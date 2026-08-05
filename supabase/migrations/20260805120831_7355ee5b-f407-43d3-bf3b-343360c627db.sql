-- club_members: writes only via trusted server code (service role)
REVOKE INSERT, UPDATE, DELETE ON public.club_members FROM anon, authenticated;
GRANT SELECT, DELETE ON public.club_members TO authenticated;
GRANT ALL ON public.club_members TO service_role;

CREATE POLICY "No direct client inserts on club_members"
ON public.club_members AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);

CREATE POLICY "No client updates on club_members"
ON public.club_members AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

-- user_roles: no client writes at all; role grants only via trusted server code
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

CREATE POLICY "No client inserts on user_roles"
ON public.user_roles AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);

CREATE POLICY "No client updates on user_roles"
ON public.user_roles AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "No client deletes on user_roles"
ON public.user_roles AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);