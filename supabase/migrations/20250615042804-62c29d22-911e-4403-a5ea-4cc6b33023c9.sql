
-- Verificar se as colunas necessárias existem na tabela profiles
DO $$ 
BEGIN
    -- Adicionar colunas à tabela profiles se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Habilitar RLS na tabela profiles se ainda não estiver
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas para profiles (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Verificar se a tabela calendar_events já existe, se não, criar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'calendar_events') THEN
        CREATE TABLE public.calendar_events (
          id TEXT NOT NULL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          start_time BIGINT NOT NULL,
          end_time BIGINT NOT NULL,
          type TEXT NOT NULL,
          color TEXT,
          is_recurring BOOLEAN DEFAULT false,
          recurrence_type TEXT,
          recurrence_interval INTEGER,
          recurrence_end BIGINT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own events" ON public.calendar_events
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own events" ON public.calendar_events
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own events" ON public.calendar_events
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own events" ON public.calendar_events
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Verificar se a tabela revision_items já existe, se não, criar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'revision_items') THEN
        CREATE TABLE public.revision_items (
          id TEXT NOT NULL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          revision_count INTEGER DEFAULT 0,
          next_revision_date BIGINT NOT NULL,
          interval_days INTEGER DEFAULT 1,
          non_study_days INTEGER[],
          completed_at BIGINT,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        ALTER TABLE public.revision_items ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own revisions" ON public.revision_items
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own revisions" ON public.revision_items
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own revisions" ON public.revision_items
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own revisions" ON public.revision_items
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Verificar se a tabela flashcard_decks já existe, se não, criar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'flashcard_decks') THEN
        CREATE TABLE public.flashcard_decks (
          id TEXT NOT NULL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          created_at BIGINT NOT NULL,
          card_count INTEGER DEFAULT 0,
          new_cards INTEGER DEFAULT 0,
          review_cards INTEGER DEFAULT 0,
          learned_cards INTEGER DEFAULT 0,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own decks" ON public.flashcard_decks
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own decks" ON public.flashcard_decks
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own decks" ON public.flashcard_decks
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own decks" ON public.flashcard_decks
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Verificar se a tabela flashcards já existe, se não, criar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'flashcards') THEN
        CREATE TABLE public.flashcards (
          id TEXT NOT NULL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
          deck_id TEXT NOT NULL,
          front TEXT NOT NULL,
          back TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          review_count INTEGER DEFAULT 0,
          ease_factor DECIMAL DEFAULT 2.5,
          interval_days INTEGER DEFAULT 1,
          next_review BIGINT NOT NULL,
          status TEXT DEFAULT 'learning',
          lapses INTEGER DEFAULT 0,
          learning_step INTEGER DEFAULT 0,
          last_reviewed BIGINT,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Adicionar foreign key constraint se a tabela flashcard_decks existir
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'flashcard_decks') THEN
            ALTER TABLE public.flashcards ADD CONSTRAINT flashcards_deck_id_fkey 
            FOREIGN KEY (deck_id) REFERENCES public.flashcard_decks(id) ON DELETE CASCADE;
        END IF;
        
        ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own flashcards" ON public.flashcards
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own flashcards" ON public.flashcards
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own flashcards" ON public.flashcards
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own flashcards" ON public.flashcards
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Criar função para lidar com novos usuários (atualizar se já existir)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email
  );
  RETURN new;
END;
$$;

-- Criar trigger para novos usuários (substituir se já existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
