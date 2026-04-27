import { tool } from 'ai';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function agentTools(supabase: any, userId: string) {
  return {
    searchNotes: tool({
      description: "Search the user's saved notes by keyword. Use this to find information the user has previously saved.",
      parameters: z.object({
        query: z.string().describe('The search term to look for in notes'),
      }),
      execute: async ({ query }) => {
        const { data, error } = await supabase
          .from('notes')
          .select('id, title, content, created_at')
          .eq('user_id', userId)
          .ilike('content', `%${query}%`)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (error) return { error: error.message };
        if (!data?.length) return { results: [], message: 'No notes found matching that query.' };
        return { results: data };
      },
    }),

    listNotes: tool({
      description: "List the user's most recent notes.",
      parameters: z.object({
        limit: z.number().min(1).max(20).default(10).describe('How many notes to return'),
      }),
      execute: async ({ limit }) => {
        const { data, error } = await supabase
          .from('notes')
          .select('id, title, content, created_at, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (error) return { error: error.message };
        return { notes: data ?? [] };
      },
    }),

    saveNote: tool({
      description: 'Save a new note for the user. Use this to remember important information they share.',
      parameters: z.object({
        title: z.string().optional().describe('A short title for the note'),
        content: z.string().describe('The full content to save'),
      }),
      execute: async ({ title, content }) => {
        const { data, error } = await supabase
          .from('notes')
          .insert({ user_id: userId, title: title ?? null, content })
          .select('id, title')
          .single();

        if (error) return { error: error.message };
        return { success: true, noteId: data.id, title: data.title };
      },
    }),

    updateNote: tool({
      description: "Update the content or title of an existing note.",
      parameters: z.object({
        id: z.string().describe('The note ID to update'),
        title: z.string().optional().describe('New title (omit to keep existing)'),
        content: z.string().optional().describe('New content (omit to keep existing)'),
      }),
      execute: async ({ id, title, content }) => {
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;

        const { error } = await supabase
          .from('notes')
          .update(updates)
          .eq('id', id)
          .eq('user_id', userId);

        if (error) return { error: error.message };
        return { success: true };
      },
    }),

    deleteNote: tool({
      description: 'Permanently delete a note by ID. Confirm with the user before deleting.',
      parameters: z.object({
        id: z.string().describe('The note ID to delete'),
      }),
      execute: async ({ id }) => {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) return { error: error.message };
        return { success: true };
      },
    }),
  };
}
