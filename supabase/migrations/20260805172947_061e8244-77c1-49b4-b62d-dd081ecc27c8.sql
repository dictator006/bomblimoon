CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  path text NOT NULL,
  referrer text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'direct',
  device text NOT NULL DEFAULT 'desktop',
  is_new_visitor boolean NOT NULL DEFAULT true,
  duration_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX page_views_visitor_idx ON public.page_views (visitor_id);

GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read page views" ON public.page_views
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "No client inserts on page_views" ON public.page_views
  AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No client updates on page_views" ON public.page_views
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on page_views" ON public.page_views
  AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

CREATE OR REPLACE FUNCTION public.track_page_view(
  _visitor_id text,
  _session_id text,
  _path text,
  _referrer text,
  _source text,
  _device text,
  _is_new_visitor boolean
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_id uuid;
BEGIN
  INSERT INTO public.page_views (visitor_id, session_id, path, referrer, source, device, is_new_visitor)
  VALUES (
    left(coalesce(_visitor_id, ''), 64),
    left(coalesce(_session_id, ''), 64),
    left(coalesce(_path, '/'), 512),
    left(coalesce(_referrer, ''), 512),
    left(coalesce(_source, 'direct'), 32),
    left(coalesce(_device, 'desktop'), 16),
    coalesce(_is_new_visitor, true)
  )
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_page_duration(_view_id uuid, _duration_ms integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.page_views
     SET duration_ms = least(greatest(coalesce(_duration_ms, 0), 0), 3600000)
   WHERE id = _view_id
     AND created_at > now() - interval '1 day';
END;
$$;

REVOKE ALL ON FUNCTION public.track_page_view(text, text, text, text, text, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.track_page_duration(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_page_view(text, text, text, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_page_duration(uuid, integer) TO anon, authenticated;