import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminAccount } from "@/lib/admin.functions";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود مدیریت | بمب لیمون" },
      { name: "description", content: "ورود به پنل مدیریت وب‌سایت بمب لیمون." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "ورود مدیریت | بمب لیمون" },
      { property: "og:description", content: "ورود به پنل مدیریت." },
      { property: "og:url", content: "/auth" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void ensureAdminAccount().catch(() => undefined);
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await ensureAdminAccount().catch(() => undefined);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ورود ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="surface-card w-full max-w-sm p-7">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="لوگو" width={56} height={56} className="h-14 w-14 object-contain" />
          <h1 className="mt-4 text-xl font-extrabold">پنل مدیریت بمب لیمون</h1>
          <p className="mt-2 text-xs text-muted-foreground">برای ادامه وارد شوید</p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold">
              ایمیل
            </label>
            <input
              id="email"
              type="email"
              required
              dir="ltr"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-left text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold">
              رمز عبور
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              dir="ltr"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-left text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            ورود
          </button>
        </form>
      </div>
    </div>
  );
}
