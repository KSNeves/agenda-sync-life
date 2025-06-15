
-- Check if subscriptions table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        CREATE TABLE public.subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          plan_type plan_type NOT NULL DEFAULT 'free_trial',
          trial_start_date TIMESTAMPTZ,
          trial_end_date TIMESTAMPTZ,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(user_id)
        );
        
        -- Enable Row Level Security
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view own subscription" ON public.subscriptions
        FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can update own subscription" ON public.subscriptions
        FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert own subscription" ON public.subscriptions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Update the existing subscription creation function
CREATE OR REPLACE FUNCTION public.create_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.subscriptions (
    user_id, 
    plan_type, 
    trial_start_date, 
    trial_end_date
  ) VALUES (
    NEW.id,
    'free_trial',
    now(),
    now() + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger to ensure it works with the updated function
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_subscription();
