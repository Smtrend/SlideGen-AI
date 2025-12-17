
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationMode, SlideResponse, PresentationStyle, ImageQuality, LessonPlan, Quiz, Icebreaker, LessonNote, NoteSummary } from "../types";

const initializeGenAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const generateSlideImage = async (ai: GoogleGenAI, prompt: string, quality: ImageQuality): Promise<string | undefined> => {
  try {
    let fullPrompt = "";
    
    switch (quality) {
      case ImageQuality.LOW:
        fullPrompt = `Create a simple, basic, minimalist, cartoonish, outline only, flat colors, low detail flat vector illustration style presentation slide image for: ${prompt}. White background, corporate style.`;
        break;
      case ImageQuality.HIGH:
        fullPrompt = `Create a highly detailed, 4k, vibrant, intricate details, masterpiece, professional shading, depth of field, cinematic lighting, photorealistic presentation slide image for: ${prompt}. White background, corporate style.`;
        break;
      case ImageQuality.MEDIUM:
      default:
        fullPrompt = `Create a standard vector style, clean, balanced detail flat vector illustration style presentation slide image for: ${prompt}. White background, corporate style.`;
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.warn("Image generation failed for slide:", error);
    return undefined;
  }
};

export const verifyStudentId = async (imageBase64: string, schoolName: string): Promise<{ verified: boolean; confidence: number; reason: string }> => {
  const ai = initializeGenAI();
  const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
  const data = imageBase64.split(',')[1];

  const schema = {
    type: Type.OBJECT,
    properties: {
      verified: { type: Type.BOOLEAN, description: "Whether the ID is likely a valid student ID for the given school" },
      confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1" },
      reason: { type: Type.STRING, description: "Reason for the verification decision" }
    },
    required: ["verified", "confidence", "reason"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { inlineData: { mimeType, data } },
        { text: `Analyze this image. Is it a valid Student ID card for "${schoolName}"? Look for the school name, 'Student', 'ID', dates, and a photo. Return verification status.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(response.text!) as { verified: boolean; confidence: number; reason: string };
};

export const generateSlidesFromText = async (
  text: string,
  mode: GenerationMode,
  style: PresentationStyle,
  imageQuality: ImageQuality
): Promise<SlideResponse> => {
  const ai = initializeGenAI();

  const schema = {
    type: Type.OBJECT,
    properties: {
      slides: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of the slide" },
            bullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Bullet points for the slide body",
            },
            speakerNotes: { 
              type: Type.STRING, 
              description: "Extremely detailed speaker notes. This should function as a script for the presenter, elaborating deeply on every bullet point, creating a narrative flow, and explaining the 'why' behind the content." 
            },
            imagePrompt: { type: Type.STRING, description: "A visual description for an image to accompany this slide. E.g. 'A bar chart showing growth' or 'Team shaking hands'." },
          },
          required: ["title", "bullets", "imagePrompt", "speakerNotes"],
        },
      },
    },
    required: ["slides"],
  };

  let systemInstruction = "";

  if (mode === GenerationMode.ORGANIZE) {
    systemInstruction = `
      You are a strict presentation organizer. 
      Your task is to take the user's input text and split it into logical slides.
      
      RULES:
      1. DO NOT rewrite, summarize, or creatively expand the slide content (bullets) unless necessary for coherence.
      2. Keep the wording as close to the original as possible.
      3. CRITICAL: Ensure ALL parts of the provided input text are represented in the slides.
      4. Create as many slides as necessary.
      5. SPEAKER NOTES: While the slides stay strict, you MUST write comprehensive speaker notes that explain the points in detail.
    `;
  } else {
    systemInstruction = `
      You are a world-class presentation designer.
      Your task is to take the user's input text and create an engaging, high-impact presentation for business or academic audiences.
      
      RULES:
      1. Improve clarity, fix grammar, and expand on brief points.
      2. Organize the content for maximum impact.
      3. Create concise, punchy bullet points.
    `;
  }

  let styleInstruction = "";
  switch (style) {
    case PresentationStyle.VISUAL:
      styleInstruction = `
        STYLE GUIDE: "Visual / Image Focused"
        - LAYOUT: Image takes 50% of the slide.
        - CONTENT: Bullet points MUST be very short and concise (max 5-8 words). 
        - FOCUS: Prioritize visual impact over text density.
      `;
      break;
    case PresentationStyle.MINIMALIST:
      styleInstruction = `
        STYLE GUIDE: "Minimalist / Title Slides"
        - LAYOUT: Center aligned, large text.
        - CONTENT: Use very few words. Max 2-3 bullet points per slide.
        - FOCUS: Punchy headlines and big ideas.
      `;
      break;
    case PresentationStyle.STANDARD:
    default:
      styleInstruction = `
        STYLE GUIDE: "Standard Content"
        - LAYOUT: Balanced text and details.
        - CONTENT: Detailed enough to stand alone.
      `;
      break;
  }

  systemInstruction += `\n${styleInstruction}`;
  systemInstruction += `\nIMPORTANT: For EVERY slide, generate a 'imagePrompt' field that describes a relevant visual/illustration for that slide.`;
  systemInstruction += `\nIMPORTANT: For EVERY slide, generate 'speakerNotes' that are verbose, conversational, and explanatory. Do not just repeat the bullets. Explain them.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: text,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("No response received from Gemini.");
  }

  try {
    const parsedResponse = JSON.parse(responseText) as SlideResponse;
    const slidesWithImages = await Promise.all(
      parsedResponse.slides.map(async (slide) => {
        const generatedImage = await generateSlideImage(ai, slide.imagePrompt, imageQuality);
        return {
          ...slide,
          image: generatedImage
        };
      })
    );
    return { slides: slidesWithImages };
  } catch (error) {
    console.error("Failed to process slides:", error);
    throw new Error("Failed to generate slides or images.");
  }
};

export const generateLessonPlan = async (topic: string, level: string): Promise<LessonPlan> => {
  const ai = initializeGenAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      gradeLevel: { type: Type.STRING },
      subject: { type: Type.STRING },
      duration: { type: Type.STRING },
      objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
      materials: { type: Type.ARRAY, items: { type: Type.STRING } },
      procedure: { 
        type: Type.ARRAY, 
        items: { 
          type: Type.OBJECT, 
          properties: { time: { type: Type.STRING }, activity: { type: Type.STRING } } 
        } 
      },
      assessment: { type: Type.STRING }
    },
    required: ["title", "objectives", "procedure", "assessment"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Create a detailed project plan or lesson roadmap for: ${topic} aimed at ${level}. Focus on clear milestones and success metrics.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(response.text!) as LessonPlan;
};

export const generateQuiz = async (topic: string, difficulty: string, count: number): Promise<Quiz> => {
  const ai = initializeGenAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      questions: { 
        type: Type.ARRAY, 
        items: { 
          type: Type.OBJECT, 
          properties: { 
            question: { type: Type.STRING }, 
            options: { type: Type.ARRAY, items: { type: Type.STRING } }, 
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer"]
        } 
      }
    },
    required: ["title", "questions"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Create a ${difficulty} difficulty assessment with ${count} items about: ${topic}. Useful for corporate training or student testing.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(response.text!) as Quiz;
};

export const generateIcebreaker = async (context: string): Promise<Icebreaker> => {
  const ai = initializeGenAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      duration: { type: Type.STRING },
      instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
      materials: { type: Type.ARRAY, items: { type: Type.STRING } },
      whyItWorks: { type: Type.STRING }
    },
    required: ["title", "instructions", "whyItWorks"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Create a fun, professional, or academic engagement activity for: ${context}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(response.text!) as Icebreaker;
};

export const generateLessonNote = async (topic: string, subject: string, level: string): Promise<LessonNote> => {
  const ai = initializeGenAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING },
      subject: { type: Type.STRING },
      gradeLevel: { type: Type.STRING },
      introduction: { type: Type.STRING },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { heading: { type: Type.STRING }, content: { type: Type.STRING } }
        }
      },
      keyTerms: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { term: { type: Type.STRING }, definition: { type: Type.STRING } }
        }
      },
      summary: { type: Type.STRING }
    },
    required: ["topic", "introduction", "sections", "keyTerms", "summary"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Create detailed, well-structured professional or educational notes for the topic "${topic}" in "${subject}" at a "${level}" level. Include key takeaways and comprehensive summaries.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(response.text!) as LessonNote;
};

export const summarizeNote = async (
  content: string, 
  imageBase64: string | undefined, 
  mode: 'SUMMARIZE' | 'EXPLAIN'
): Promise<NoteSummary> => {
  const ai = initializeGenAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summary: { type: Type.STRING },
      keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      actionableItems: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["title", "summary", "keyPoints"]
  };

  const parts: any[] = [];
  if (imageBase64) {
    const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
    const data = imageBase64.split(',')[1];
    parts.push({ inlineData: { mimeType: mimeType, data: data } });
  }
  if (content) parts.push({ text: content });

  const prompt = mode === 'SUMMARIZE' 
    ? "Analyze the provided content. Provide a professional summary, bullet list of key takeaways, and any actionable next steps."
    : "Analyze the provided content. Provide a detailed explanation of the concepts found, simplify jargon, and list key points.";

  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts: parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(response.text!) as NoteSummary;
};
