
export interface Slide {
  id: string;
  title: string;
  bullets: string[];
  speakerNotes?: string;
  image?: string;
  backgroundImage?: string;
  transition?: SlideTransition;
}

export enum UserType {
  STUDENT = 'STUDENT',
  PROFESSIONAL = 'PROFESSIONAL'
}

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  subscriptionStatus: SubscriptionStatus;
  trialStartDate: number;
  paymentMethodLinked: boolean;
  studentVerified: boolean;
  schoolName?: string;
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

export enum SourceMode {
  TEXT = 'TEXT',
  TOPIC = 'TOPIC'
}

export enum GenerationMode {
  ORGANIZE = 'ORGANIZE',
  ENHANCE = 'ENHANCE',
}

export enum PresentationStyle {
  STANDARD = 'STANDARD',
  VISUAL = 'VISUAL',
  MINIMALIST = 'MINIMALIST'
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
