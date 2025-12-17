import { Presentation, Slide, PPTXThemeId } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { openDB, DBSchema } from 'idb';

interface SlideGenDB extends DBSchema {
  presentations: {
    key: string;
    value: Presentation;
    indexes: { 'by-user': string };
  };
}

const DB_NAME = 'slidegen-db';
const STORE_NAME = 'presentations';

const dbPromise = openDB<SlideGenDB>(DB_NAME, 1, {
  upgrade(db) {
    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    store.createIndex('by-user', 'userId');
  },
});

export const presentationService = {
  async getUserPresentations(userId: string): Promise<Presentation[]> {
    const db = await dbPromise;
    const allPresentations = await db.getAllFromIndex(STORE_NAME, 'by-user', userId);
    return allPresentations.sort((a, b) => b.lastModified - a.lastModified);
  },

  async savePresentation(userId: string, presentationId: string | null, slides: Slide[], themeId: PPTXThemeId, title?: string): Promise<Presentation> {
    const db = await dbPromise;
    const now = Date.now();
    const derivedTitle = title || slides[0]?.title || "Untitled Presentation";

    let presentation: Presentation;

    if (presentationId) {
      const existing = await db.get(STORE_NAME, presentationId);
      if (existing) {
        presentation = {
          ...existing,
          slides,
          themeId,
          title: derivedTitle,
          lastModified: now
        };
      } else {
        presentation = {
          id: presentationId,
          userId,
          title: derivedTitle,
          slides,
          themeId,
          createdAt: now,
          lastModified: now
        };
      }
    } else {
      presentation = {
        id: uuidv4(),
        userId,
        title: derivedTitle,
        slides,
        themeId,
        createdAt: now,
        lastModified: now
      };
    }

    try {
        await db.put(STORE_NAME, presentation);
    } catch (e) {
        console.error("IndexedDB Save Error:", e);
        throw new Error("Failed to save presentation. Storage might be full.");
    }
    
    return presentation;
  },

  async deletePresentation(id: string): Promise<void> {
    const db = await dbPromise;
    await db.delete(STORE_NAME, id);
  },

  async getPresentationById(id: string): Promise<Presentation | null> {
     const db = await dbPromise;
     return (await db.get(STORE_NAME, id)) || null;
  }
};