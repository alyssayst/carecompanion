
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  urgency text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service requests"
  ON public.service_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create service requests"
  ON public.service_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own service requests"
  ON public.service_requests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
