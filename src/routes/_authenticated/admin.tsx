import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Gauge, LayoutGrid, LogOut, Settings, Users, UtensilsCrossed } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardTab } from "@/components/admin/dashboard-tab";
import { ProductsTab } from "@/components/admin/products-tab";
import { CategoriesTab } from "@/components/admin/categories-tab";
import { MembersTab } from "@/components/admin/members-tab";
import { SettingsTab } from "@/components/admin/settings-tab";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "پنل مدیریت | بمب لیمون" },
      { name: "description", content: "مدیریت منو، دسته‌بندی‌ها، اعضا و تنظیمات سایت." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { id: "dashboard", label: "داشبورد", icon: Gauge },
  { id: "products", label: "غذاها", icon: UtensilsCrossed },
  { id: "categories", label: "دسته‌بندی‌ها", icon: LayoutGrid },
  { id: "members", label: "باشگاه مشتریان", icon: Users },
  { id: "settings", label: "تنظیمات", icon: Settings },
] as const;

function AdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("dashboard");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: isAdmin, isLoading: checkingRole } = useQuery({
    queryKey: ["admin", "is-admin"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("id").eq("role", "admin").limit(1);
      return (data?.length ?? 0) > 0;
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <img src={logo} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-sm font-extrabold">پنل مدیریت</span>
          <div className="flex-1" />
          <Link to="/" className="rounded-full px-3 py-2 text-xs font-bold hover:bg-accent">
            مشاهده سایت
          </Link>
          <button
            onClick={() => void signOut()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-bold hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" />
            خروج
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {checkingRole ? (
          <p className="p-6 text-center text-sm text-muted-foreground">در حال بررسی دسترسی…</p>
        ) : !isAdmin ? (
          <p className="surface-card p-6 text-center text-sm font-bold">
            این حساب دسترسی مدیریت ندارد.
          </p>
        ) : (
          <>
            {tab === "dashboard" && <DashboardTab />}
            {tab === "products" && <ProductsTab />}
            {tab === "categories" && <CategoriesTab />}
            {tab === "members" && <MembersTab />}
            {tab === "settings" && <SettingsTab />}
          </>
        )}
      </main>

    </div>
  );
}
