import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutGrid, LogOut, Settings, Users, UtensilsCrossed } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  { id: "products", label: "محصولات", icon: UtensilsCrossed },
  { id: "categories", label: "دسته‌بندی‌ها", icon: LayoutGrid },
  { id: "members", label: "باشگاه مشتریان", icon: Users },
  { id: "settings", label: "تنظیمات", icon: Settings },
] as const;

function AdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("products");
  const navigate = useNavigate();
  const qc = useQueryClient();

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
        {tab === "products" && <ProductsTab />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "members" && <MembersTab />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
