
-- Rename saved_places to be purely bookmarks (drop review columns)
ALTER TABLE public.saved_places DROP COLUMN IF EXISTS notes;
ALTER TABLE public.saved_places DROP COLUMN IF EXISTS price_range;
ALTER TABLE public.saved_places DROP COLUMN IF EXISTS would_recommend;

-- Create separate place_reviews table
CREATE TABLE public.place_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  place_slug text NOT NULL,
  notes text,
  price_range text,
  would_recommend boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, place_slug)
);

ALTER TABLE public.place_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reviews"
  ON public.place_reviews FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can insert own reviews"
  ON public.place_reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.place_reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.place_reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
