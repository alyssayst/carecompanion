
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. Referral Codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL DEFAULT 'system',
  is_active BOOLEAN NOT NULL DEFAULT true,
  used_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active referral codes"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

-- 2. Profiles table (stores onboarding answers for matching)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  display_name TEXT,
  relationship TEXT,
  child_age TEXT,
  staying_at TEXT,
  care_type TEXT,
  companions TEXT[] DEFAULT '{}',
  needs TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  referral_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Cached Events table (for scraped events)
CREATE TABLE public.cached_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date_time TEXT,
  location TEXT,
  link TEXT,
  image_url TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cached_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached events"
  ON public.cached_events FOR SELECT
  USING (true);

-- 4. Seed referral codes
INSERT INTO public.referral_codes (code, created_by) VALUES
  ('HARPER2024', 'system'),
  ('DUKE-SW-001', 'social_worker'),
  ('DUKE-SW-002', 'social_worker'),
  ('FAMILY-CARE', 'system'),
  ('WELCOME-HOME', 'system');
