
import { Presentation, Slide, PPTXThemeId } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient';

export const presentationService = {
  /**
   * Fetches only the metadata for the dashboard to keep the request small and fast.
   * Slides are heavy (Base64), so we exclude them here.
   */
  async getUserPresentations(userId: string): Promise<Presentation[]> {
    const { data, error } = await supabase
      .from('presentations')
      .select('id, user_id, title, theme_id, created_at, last_modified')
      .eq('user_id', userId)
      .order('last_modified', { ascending: false });

    if (error) {
      console.error("Error fetching presentations:", error);
      throw error;
    }
    
    // We return slides as empty array here; App will fetch them on-demand when opened
    return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        slides: [], 
        themeId: item.theme_id as PPTXThemeId,
        createdAt: typeof item.created_at === 'string' ? parseInt(item.created_at) : item.created_at,
        lastModified: typeof item.last_modified === 'string' ? parseInt(item.last_modified) : item.last_modified
    })) as Presentation[];
  },

  async savePresentation(userId: string, presentationId: string | null, slides: Slide[], themeId: PPTXThemeId, title?: string): Promise<{id: string, lastModified: number}> {
    const now = Date.now();
    const derivedTitle = title || slides[0]?.title || "Untitled Presentation";
    const id = presentationId || uuidv4();

    const payload: any = {
        id: id,
        user_id: userId,
        title: derivedTitle,
        slides,
        theme_id: themeId,
        last_modified: now
    };

    if (!presentationId) {
        payload.created_at = now;
    }

    // Upsert with explicit conflict resolution on 'id'
    const { error } = await supabase
      .from('presentations')
      .upsert(payload, { onConflict: 'id' })
      .select('id');

    if (error) {
      console.error("Supabase Save Error:", error);
      if (error.message.includes('too large') || error.code === '413') {
        throw new Error("This presentation has too many high-resolution images to save. Try removing one or two images.");
      }
      throw error;
    }

    return {
        id,
        lastModified: now
    };
  },

  async deletePresentation(id: string): Promise<void> {
    const { error } = await supabase
      .from('presentations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getPresentationById(id: string): Promise<Presentation | null> {
    const { data, error } = await supabase
      .from('presentations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
        console.error("Error fetching full presentation:", error);
        return null;
    }

    return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        slides: data.slides || [],
        themeId: data.theme_id as PPTXThemeId,
        createdAt: typeof data.created_at === 'string' ? parseInt(data.created_at) : data.created_at,
        lastModified: typeof data.last_modified === 'string' ? parseInt(data.last_modified) : data.last_modified
    } as Presentation;
  }
};
