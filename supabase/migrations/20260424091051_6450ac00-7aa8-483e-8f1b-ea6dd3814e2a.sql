-- Store settings: single-row global switches
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_delivery_open boolean NOT NULL DEFAULT true,
  is_pickup_open boolean NOT NULL DEFAULT true,
  temporary_message text,
  standard_lead_time_minutes integer NOT NULL DEFAULT 45,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can read store settings
CREATE POLICY "Anyone can view store settings"
ON public.store_settings
FOR SELECT
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins manage store settings"
ON public.store_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to keep updated_at fresh
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the single global row
INSERT INTO public.store_settings (is_delivery_open, is_pickup_open, temporary_message, standard_lead_time_minutes)
VALUES (true, true, NULL, 45);