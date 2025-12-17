export interface Slide {
  id: string;
  title: string;
  bullets: string[];
  speakerNotes?: string;
  image?: string; // Base64 string for the image
  backgroundImage?: string; // Base64 string for the background image
  transition?: SlideTransition;
}

export enum SlideTransition {
  NONE = 'none',
  FADE = 'fade',
  PUSH = 'push',
  WIPE = 'wipe',
  COVER = 'cover',
  UNCOVER = 'uncover'
}

export enum GenerationMode {
  ORGANIZE = 'ORGANIZE', // Strictly organize input text
  ENHANCE = 'ENHANCE',   // Improve, expand, and format text
}

export enum PresentationStyle {
  STANDARD = 'STANDARD',   // Balanced text and bullets (Content Slide)
  VISUAL = 'VISUAL',       // Minimal text, includes image descriptions (Image Slide)
  MINIMALIST = 'MINIMALIST' // Very concise, punchy text (Title Slide style)
}

export enum PPTXThemeId {
  CORPORATE_BLUE = 'CORPORATE_BLUE',
  MODERN_GREEN = 'MODERN_GREEN',
  ELEGANT_PURPLE = 'ELEGANT_PURPLE',
  CLASSIC_GRAY = 'CLASSIC_GRAY',
  WARM_ORANGE = 'WARM_ORANGE'
}

export interface ThemeColors {
  header: string;
  text: string;
  bg: string;
  accent: string;
}

export interface SlideResponse {
  slides: {
    title: string;
    bullets: string[];
    speakerNotes: string;
    imagePrompt: string;
    image?: string;
  }[];
}