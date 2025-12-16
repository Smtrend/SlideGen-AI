import PptxGenJS from "pptxgenjs";
import { Slide, PPTXThemeId } from "../types";

const THEMES: Record<PPTXThemeId, { header: string; text: string; bg: string; accent: string }> = {
  [PPTXThemeId.CORPORATE_BLUE]: { header: "4F46E5", text: "363636", bg: "FFFFFF", accent: "4F46E5" }, // Indigo
  [PPTXThemeId.MODERN_GREEN]: { header: "059669", text: "1F2937", bg: "F0FDF4", accent: "059669" }, // Emerald
  [PPTXThemeId.ELEGANT_PURPLE]: { header: "7C3AED", text: "2E1065", bg: "FAF5FF", accent: "7C3AED" }, // Violet
  [PPTXThemeId.CLASSIC_GRAY]: { header: "374151", text: "111827", bg: "F9FAFB", accent: "4B5563" }, // Gray
  [PPTXThemeId.WARM_ORANGE]: { header: "EA580C", text: "431407", bg: "FFF7ED", accent: "EA580C" }, // Orange
};

export const downloadPPTX = (slides: Slide[], themeId: PPTXThemeId = PPTXThemeId.CORPORATE_BLUE, filename = "presentation.pptx") => {
  const pres = new PptxGenJS();
  const theme = THEMES[themeId];

  // Set Author/Metadata
  pres.author = "SlideGen AI";
  pres.company = "SlideGen AI User";
  pres.title = "Generated Presentation";

  // Create Master Slide
  pres.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: theme.bg },
    objects: [
      {
        rect: { x: 0, y: 0, w: "100%", h: 0.75, fill: { color: theme.header } }, // Header bar with theme color
      },
    ],
  });

  slides.forEach((slide) => {
    const slideObj = pres.addSlide();
    
    // Add Transition
    slideObj.transition = { type: "fade", duration: 1000 };
    
    // Add Title
    slideObj.addText(slide.title, {
      x: 0.5,
      y: 0.5,
      w: "90%",
      h: 1,
      fontSize: 24,
      fontFace: "Arial",
      bold: true,
      color: theme.text, // Theme text color
    });

    if (slide.image) {
      // --- Layout with Image (Split Screen) ---
      
      // Bullets (Left side, narrower)
      slideObj.addText(slide.bullets.map(b => b).join('\n'), {
        x: 0.5,
        y: 1.5,
        w: "45%", // Takes up left half
        h: 4,
        fontSize: 18,
        fontFace: "Arial",
        color: theme.text,
        bullet: { code: "2022", color: theme.accent }, // Theme accent bullet
        lineSpacing: 30,
      });

      // Image (Right side)
      slideObj.addImage({
        data: slide.image,
        x: 5.2,
        y: 1.5,
        w: "45%",
        h: 3.8, // Constraints
        sizing: { type: "contain", w: 4.5, h: 3.8 } // Ensure it fits
      });

    } else {
      // --- Standard Layout (Full Width) ---
      
      slideObj.addText(slide.bullets.map(b => b).join('\n'), {
        x: 0.5,
        y: 1.5,
        w: "90%",
        h: 4,
        fontSize: 18,
        fontFace: "Arial",
        color: theme.text,
        bullet: { code: "2022", color: theme.accent }, // Theme accent bullet
        lineSpacing: 30,
      });
    }

    // Add Speaker Notes
    if (slide.speakerNotes) {
      slideObj.addNotes(slide.speakerNotes);
    }
  });

  pres.writeFile({ fileName: filename });
};