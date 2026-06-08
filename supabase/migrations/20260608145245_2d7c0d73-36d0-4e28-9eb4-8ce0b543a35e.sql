DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.place_reviews;
DROP POLICY IF EXISTS "Anyone can read place reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Public can view place reviews" ON public.place_reviews;

CREATE POLICY "Users can view their own reviews"
  ON public.place_reviews FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW public.public_place_reviews
WITH (security_invoker = true) AS
SELECT id, place_slug, notes, price_range, would_recommend, created_at, updated_at
FROM public.place_reviews;

GRANT SELECT ON public.public_place_reviews TO anon, authenticated;