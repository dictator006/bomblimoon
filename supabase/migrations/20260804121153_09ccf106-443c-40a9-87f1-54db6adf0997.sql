ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_single integer,
  ADD COLUMN IF NOT EXISTS price_medium integer,
  ADD COLUMN IF NOT EXISTS price_family integer;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS mobile_primary text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS mobile_secondary text NOT NULL DEFAULT '';