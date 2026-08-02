import { createServerFn } from "@tanstack/react-start";

/**
 * Idempotently makes sure the single administrator account exists and has the
 * admin role. Credentials come from server-side env vars, never from the client.
 */
export const ensureAdminAccount = createServerFn({ method: "POST" }).handler(async () => {
  const email = process.env["ADMIN_EMAIL"];
  const password = process.env["ADMIN_INITIAL_PASSWORD"];
  if (!email || !password) return { ok: false as const };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  let user = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) return { ok: false as const };
    user = data.user;
  }

  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("role", "admin");

  if ((count ?? 0) === 0) {
    await supabaseAdmin.from("user_roles").insert({ user_id: user.id, role: "admin" });
  }

  return { ok: true as const };
});
