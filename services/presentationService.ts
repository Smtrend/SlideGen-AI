import { Presentation, Slide, PPTXThemeId } from '../types';
import { v4 as uuidv4 } from 'uuid';

const PRESENTATIONS_KEY = 'slidegen_presentations';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const presentationService = {
  async getUserPresentations(userId: string): Promise<Presentation[]> {
    await delay(300);
    const allPresentations: Presentation[] = JSON.parse(localStorage.getItem(PRESENTATIONS_KEY) || '[]');
    return allPresentations
      .filter(p => p.userId === userId)
      .sort((a, b) => b.lastModified - a.lastModified);
  },

  async savePresentation(userId: string, presentationId: string | null, slides: Slide[], themeId: PPTXThemeId, title?: string): Promise<Presentation> {
    await delay(300);
    const allPresentations: Presentation[] = JSON.parse(localStorage.getItem(PRESENTATIONS_KEY) || '[]');
    
    const now = Date.now();
    let presentation: Presentation;

    // Use the first slide's title as the presentation title if not provided, or fallback
    const derivedTitle = title || slides[0]?.title || "Untitled Presentation";

    if (presentationId) {
      // Update existing
      const index = allPresentations.findIndex(p => p.id === presentationId);
      if (index !== -1) {
        presentation = {
          ...allPresentations[index],
          slides,
          themeId,
          title: derivedTitle,
          lastModified: now
        };
        allPresentations[index] = presentation;
      } else {
        // Fallback if ID not found (shouldn't happen)
        presentation = {
          id: presentationId,
          userId,
          title: derivedTitle,
          slides,
          themeId,
          createdAt: now,
          lastModified: now
        };
        allPresentations.push(presentation);
      }
    } else {
      // Create new
      presentation = {
        id: uuidv4(),
        userId,
        title: derivedTitle,
        slides,
        themeId,
        createdAt: now,
        lastModified: now
      };
      allPresentations.push(presentation);
    }

    localStorage.setItem(PRESENTATIONS_KEY, JSON.stringify(allPresentations));
    return presentation;
  },

  async deletePresentation(id: string): Promise<void> {
    await delay(300);
    let allPresentations: Presentation[] = JSON.parse(localStorage.getItem(PRESENTATIONS_KEY) || '[]');
    allPresentations = allPresentations.filter(p => p.id !== id);
    localStorage.setItem(PRESENTATIONS_KEY, JSON.stringify(allPresentations));
  },

  async getPresentationById(id: string): Promise<Presentation | null> {
     await delay(200);
     const allPresentations: Presentation[] = JSON.parse(localStorage.getItem(PRESENTATIONS_KEY) || '[]');
     return allPresentations.find(p => p.id === id) || null;
  }
};