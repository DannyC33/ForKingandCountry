import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { agentTools } from '@/lib/anthropic/tools';

export const maxDuration = 60;

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a thoughtful, proactive AI assistant with access to the user's personal knowledge base.

Your capabilities:
- Search, create, update, and delete the user's notes
- Recall previous information the user has shared
- Help organize thoughts and knowledge

Guidelines:
- When users share important information, proactively offer to save it as a note
- When answering questions, search the user's notes first to personalize your response
- Be concise but thorough — think before acting
- Always confirm before deleting anything

Current date: ${new Date().toISOString().split('T')[0]}`;

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, conversationId } = await req.json();

  const tools = agentTools(supabase, user.id);

  const result = streamText({
    model: anthropic('claude-sonnet-4-6', {
      cacheControl: true,
    }),
    system: SYSTEM_PROMPT,
    messages,
    tools,
    maxSteps: 8,
    onFinish: async ({ text }) => {
      if (!conversationId || !text) return;
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: text,
      });
    },
  });

  return result.toDataStreamResponse();
}
