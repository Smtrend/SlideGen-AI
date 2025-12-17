export interface Slide {
  id: string;
  title: string;
  bullets: string[];
  speakerNotes?: string;
  image?: string; // Base64 string for the image
  backgroundImage?: string; // Base64 string for the background image
  transition?: SlideTransition;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Presentation {
  id: string;
  userId: string;
  title: string;
  slides: Slide[];
  themeId: PPTXThemeId;
  createdAt: number;
  lastModified: number;
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

export enum ImageQuality {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
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

// --- NEW TOOL TYPES ---

export enum ToolId {
  SLIDE_GENERATOR = 'SLIDE_GENERATOR',
  LESSON_PLANNER = 'LESSON_PLANNER',
  QUIZ_MAKER = 'QUIZ_MAKER',
  ICEBREAKER = 'ICEBREAKER',
  LESSON_NOTE_MAKER = 'LESSON_NOTE_MAKER',
  NOTE_SUMMARIZER = 'NOTE_SUMMARIZER'
}

export interface LessonPlan {
  title: string;
  gradeLevel: string;
  subject: string;
  duration: string;
  objectives: string[];
  materials: string[];
  procedure: { time: string; activity: string }[];
  assessment: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface Icebreaker {
  title: string;
  duration: string;
  instructions: string[];
  materials: string[];
  whyItWorks: string;
}

export interface LessonNote {
  topic: string;
  subject: string;
  gradeLevel: string;
  introduction: string;
  sections: { heading: string; content: string }[];
  keyTerms: { term: string; definition: string }[];
  summary: string;
}

export interface NoteSummary {
  title: string;
  summary: string;
  keyPoints: string[];
  actionableItems: string[];
}