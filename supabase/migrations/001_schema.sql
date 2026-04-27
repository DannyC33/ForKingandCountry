-- ==========================================
-- The Last Shall Be First — Initial Schema
-- ==========================================

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Messages within conversations
CREATE TABLE IF NOT EXISTS public.messages (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id   UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role              TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content           TEXT        NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User notes (agent can CRUD these)
CREATE TABLE IF NOT EXISTS public.notes (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==========================================
-- Row Level Security
-- ==========================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes          ENABLE ROW LEVEL SECURITY;

-- Conversations: users see only their own
CREATE POLICY "conversations_owner" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

-- Messages: users see only messages in their conversations
CREATE POLICY "messages_owner" ON public.messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );

-- Notes: users see only their own
CREATE POLICY "notes_owner" ON public.notes
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Triggers: keep updated_at current
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- Indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);
