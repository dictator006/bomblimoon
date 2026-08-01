import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { getMenu } from "@/lib/site.functions";

export const Route = createFileRoute("/menu")({
  loader: () => getMenu(),
  head: () => ({
    meta: [
      { title: "منوی دیجیتال | بمب لیمون" },
      {
        name: "description",
        content:
          "منوی کامل بمب لیمون: برگر، پیتزا، هات داگ، سوخاری، پیش غذا، نوشیدنی و دسر همراه با قیمت و وضعیت موجودی.",
      },
      { property: "og:title", content: "منوی دیجیتال | بمب لیمون" },
      { property: "og:description", content: "منوی کامل بمب لیمون با قیمت روز و امکان سفارش آنلاین." },
      { property: "og:url", content: "/menu" },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
  }),
  component: MenuPage,
});

function MenuPage() {
  const settings = useLoaderData({ from: "__root__" });
  const { categories, products } = Route.useLoaderData();
  const [active, setActive] = useState<string>("all");

  const visibleCategories =
    active === "all" ? categories : categories.filter((c) => c.id === active);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="animate-rise">
          <h1 className="text-3xl font-black sm:text-4xl">منوی دیجیتال</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            دسته‌بندی مورد نظر را انتخاب کنید و سفارش خود را مستقیم از اسنپ‌فود ثبت کنید.
          </p>
        </header>

        <div className="sticky top-16 z-30 -mx-4 mt-6 overflow-x-auto bg-background/85 px-4 py-3 backdrop-blur-xl sm:top-18">
          <div className="flex gap-2">
            <button
              onClick={() => setActive("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active === "all"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              همه
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active === c.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-12">
          {visibleCategories.map((c) => {
            const items = products.filter((p) => p.category_id === c.id);
            if (items.length === 0) return null;
            return (
              <section key={c.id} id={c.slug} className="scroll-mt-32">
                <h2 className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
                  <span className="text-2xl">{c.emoji}</span>
                  {c.name}
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      emoji={c.emoji}
                      orderUrl={settings?.snappfood_url ?? ""}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
