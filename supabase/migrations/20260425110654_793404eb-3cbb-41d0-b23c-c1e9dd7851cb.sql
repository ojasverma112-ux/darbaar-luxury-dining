-- 1. admin_emails table: list of approved admin email addresses
CREATE TABLE IF NOT EXISTS public.admin_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  added_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage admin_emails"
  ON public.admin_emails FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed bootstrap admin email
INSERT INTO public.admin_emails (email)
VALUES ('ojasverma112@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Helper function to check approved admin email
CREATE OR REPLACE FUNCTION public.is_email_admin(_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_emails WHERE LOWER(email) = LOWER(_email))
$$;

-- 3. Update handle_new_user to auto-promote any email in admin_emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, phone, address, city, postcode)
  VALUES (
    NEW.id, NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'postcode'
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;

  IF public.is_email_admin(NEW.email) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Make sure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Promote existing users whose email is in admin_emails (in case they signed up before being added)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE public.is_email_admin(u.email)
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Add payment fields and richer status enum to orders
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
                 WHERE t.typname = 'order_status' AND e.enumlabel = 'pending_payment') THEN
    ALTER TYPE order_status ADD VALUE 'pending_payment';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
                 WHERE t.typname = 'order_status' AND e.enumlabel = 'confirmed') THEN
    ALTER TYPE order_status ADD VALUE 'confirmed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
                 WHERE t.typname = 'order_status' AND e.enumlabel = 'preparing') THEN
    ALTER TYPE order_status ADD VALUE 'preparing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
                 WHERE t.typname = 'order_status' AND e.enumlabel = 'out_for_delivery') THEN
    ALTER TYPE order_status ADD VALUE 'out_for_delivery';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
                 WHERE t.typname = 'order_status' AND e.enumlabel = 'delivered') THEN
    ALTER TYPE order_status ADD VALUE 'delivered';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
                 WHERE t.typname = 'order_status' AND e.enumlabel = 'cancelled') THEN
    ALTER TYPE order_status ADD VALUE 'cancelled';
  END IF;
END$$;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- 6. Allow guest order INSERTs from anyone (place-order edge function uses service role,
--    but having a permissive insert policy lets the anon key path also work safely as guest)
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert order_items" ON public.order_items;
CREATE POLICY "Anyone can insert order_items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- 7. updated_at trigger for admin_emails (uses existing util)
DROP TRIGGER IF EXISTS trg_admin_emails_updated ON public.admin_emails;
-- (no updated_at column needed for admin_emails; skip)
