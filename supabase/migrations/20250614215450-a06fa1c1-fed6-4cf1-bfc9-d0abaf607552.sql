
-- Create profiles table to store user profile information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  profile_image TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_events table for calendar events
CREATE TABLE public.user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_all_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_revisions table for revision items
CREATE TABLE public.user_revisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  next_revision_date TIMESTAMP WITH TIME ZONE NOT NULL,
  revision_count INTEGER DEFAULT 0,
  interval_days INTEGER DEFAULT 1,
  category TEXT DEFAULT 'today',
  non_study_days TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create user_flashcard_decks table
CREATE TABLE public.user_flashcard_decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_flashcards table
CREATE TABLE public.user_flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES public.user_flashcard_decks ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  ease_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  language TEXT DEFAULT 'pt',
  theme TEXT DEFAULT 'dark',
  focus_time INTEGER DEFAULT 25,
  short_break INTEGER DEFAULT 5,
  long_break INTEGER DEFAULT 15,
  long_break_interval INTEGER DEFAULT 4,
  auto_start_breaks BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_events
CREATE POLICY "Users can view their own events" 
  ON public.user_events FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events" 
  ON public.user_events FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
  ON public.user_events FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
  ON public.user_events FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_revisions
CREATE POLICY "Users can view their own revisions" 
  ON public.user_revisions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revisions" 
  ON public.user_revisions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revisions" 
  ON public.user_revisions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revisions" 
  ON public.user_revisions FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_flashcard_decks
CREATE POLICY "Users can view their own decks" 
  ON public.user_flashcard_decks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decks" 
  ON public.user_flashcard_decks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" 
  ON public.user_flashcard_decks FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" 
  ON public.user_flashcard_decks FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_flashcards
CREATE POLICY "Users can view their own flashcards" 
  ON public.user_flashcards FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flashcards" 
  ON public.user_flashcards FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards" 
  ON public.user_flashcards FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards" 
  ON public.user_flashcards FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own settings" 
  ON public.user_settings FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email
  );
  
  INSERT INTO public.user_settings (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile and settings for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
