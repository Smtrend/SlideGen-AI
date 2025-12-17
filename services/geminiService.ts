import { GoogleGenAI, Type } from "@google/genai";
import { GenerationMode, SlideResponse, PresentationStyle } from "../types";

const initializeGenAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const generateSlideImage = async (ai: GoogleGenAI, prompt: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Create a flat vector illustration style presentation slide image for: ${prompt}. White background, minimalist, corporate style.` }],
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

export const generateSlidesFromText = async (
  text: string,
  mode: GenerationMode,
  style: PresentationStyle
): Promise<SlideResponse> => {
  const ai = initializeGenAI();

  // Define the schema for the output
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
      Your task is to take the user's input text and create an engaging, high-impact presentation.
      
      RULES:
      1. Improve clarity, fix grammar, and expand on brief points.
      2. Organize the content for maximum impact.
      3. Create concise, punchy bullet points.
    `;
  }

  // Add Style Instructions
  let styleInstruction = "";
  switch (style) {
    case PresentationStyle.VISUAL:
      styleInstruction = `
        STYLE GUIDE: "Visual / Image Focused"
        - Keep bullet points very short and concise (max 5-8 words).
        - Focus on creating space for the accompanying image (which you will describe in the imagePrompt).
      `;
      break;
    case PresentationStyle.MINIMALIST:
      styleInstruction = `
        STYLE GUIDE: "Minimalist / Title Slides"
        - Use very few words. 
        - Focus on big ideas and punchy headlines.
        - Max 2-3 bullet points per slide.
      `;
      break;
    case PresentationStyle.STANDARD:
    default:
      styleInstruction = `
        STYLE GUIDE: "Standard Content"
        - Balance of information and readability.
        - Detailed enough to stand alone.
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
    
    // Generate images for each slide in parallel
    const slidesWithImages = await Promise.all(
      parsedResponse.slides.map(async (slide) => {
        const generatedImage = await generateSlideImage(ai, slide.imagePrompt);
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