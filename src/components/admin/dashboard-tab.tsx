import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Users, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toPersianDigits } from "@/lib/types";

async function countOf(table: "products" | "categories" | "club_members") {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export function DashboardTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => ({
      products: await countOf("products"),
      categories: await countOf("categories"),
      members: await countOf("club_members"),
    }),
  });

  const cards = [
    { label: "تعداد غذاها", value: data?.products, icon: UtensilsCrossed },
    { label: "تعداد دسته‌بندی‌ها", value: data?.categories, icon: LayoutGrid },
    { label: "اعضای باشگاه مشتریان", value: data?.members, icon: Users },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-extrabold">داشبورد</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="surface-card flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <c.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-2xl font-extrabold">
                {isLoading ? "—" : toPersianDigits(String(c.value ?? 0))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
