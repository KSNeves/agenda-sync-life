
-- Enable RLS on all user tables and create policies (with existence checks)

-- Enable RLS on profiles table (if not already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Profiles policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Enable RLS on user_events table
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- User events policies (drop existing ones first)
DROP POLICY IF EXISTS "Users can view their own events" ON public.user_events;
DROP POLICY IF EXISTS "Users can create their own events" ON public.user_events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.user_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.user_events;

CREATE POLICY "Users can view their own events" 
  ON public.user_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events" 
  ON public.user_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
  ON public.user_events 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
  ON public.user_events 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on user_flashcard_decks table
ALTER TABLE public.user_flashcard_decks ENABLE ROW LEVEL SECURITY;

-- Flashcard decks policies
DROP POLICY IF EXISTS "Users can view their own flashcard decks" ON public.user_flashcard_decks;
DROP POLICY IF EXISTS "Users can create their own flashcard decks" ON public.user_flashcard_decks;
DROP POLICY IF EXISTS "Users can update their own flashcard decks" ON public.user_flashcard_decks;
DROP POLICY IF EXISTS "Users can delete their own flashcard decks" ON public.user_flashcard_decks;

CREATE POLICY "Users can view their own flashcard decks" 
  ON public.user_flashcard_decks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flashcard decks" 
  ON public.user_flashcard_decks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard decks" 
  ON public.user_flashcard_decks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcard decks" 
  ON public.user_flashcard_decks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on user_flashcards table
ALTER TABLE public.user_flashcards ENABLE ROW LEVEL SECURITY;

-- Flashcards policies
DROP POLICY IF EXISTS "Users can view their own flashcards" ON public.user_flashcards;
DROP POLICY IF EXISTS "Users can create their own flashcards" ON public.user_flashcards;
DROP POLICY IF EXISTS "Users can update their own flashcards" ON public.user_flashcards;
DROP POLICY IF EXISTS "Users can delete their own flashcards" ON public.user_flashcards;

CREATE POLICY "Users can view their own flashcards" 
  ON public.user_flashcards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flashcards" 
  ON public.user_flashcards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards" 
  ON public.user_flashcards 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards" 
  ON public.user_flashcards 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on user_revisions table
ALTER TABLE public.user_revisions ENABLE ROW LEVEL SECURITY;

-- Revisions policies
DROP POLICY IF EXISTS "Users can view their own revisions" ON public.user_revisions;
DROP POLICY IF EXISTS "Users can create their own revisions" ON public.user_revisions;
DROP POLICY IF EXISTS "Users can update their own revisions" ON public.user_revisions;
DROP POLICY IF EXISTS "Users can delete their own revisions" ON public.user_revisions;

CREATE POLICY "Users can view their own revisions" 
  ON public.user_revisions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revisions" 
  ON public.user_revisions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revisions" 
  ON public.user_revisions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revisions" 
  ON public.user_revisions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on user_settings table
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- User settings policies
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = id);
