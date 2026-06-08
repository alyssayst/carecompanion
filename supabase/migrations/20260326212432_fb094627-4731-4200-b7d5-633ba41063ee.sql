
-- Allow authenticated users to update referral code used_count
CREATE POLICY "Authenticated users can increment referral code usage"
  ON public.referral_codes FOR UPDATE TO authenticated
  USING (is_active = true)
  WITH CHECK (is_active = true);
