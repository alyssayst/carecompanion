
CREATE TABLE public.saved_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  place_slug text NOT NULL,
  notes text,
  price_range text,
  would_recommend boolean,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, place_slug)
);

ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved places"
  ON public.saved_places FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved places"
  ON public.saved_places FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved places"
  ON public.saved_places FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved places"
  ON public.saved_places FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
