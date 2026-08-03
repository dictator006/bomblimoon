import { useSettings } from "@/lib/use-settings";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Flame, Leaf, MapPin, Sparkles, Truck } from "lucide-react";
import heroImage from "@/assets/hero-burger.jpg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { getMenu } from "@/lib/site.functions";
import type { Category, Product } from "@/lib/types";

export const Route = createFileRoute("/")({
  loader: (): Promise<{ categories: Category[]; products: Product[] }> => getMenu(),
  head: () => ({
    meta: [
      { title: "بمب لیمون | فست فود مدرن، سریع و خوشمزه" },
      {
        name: "description",
        content:
          "بمب لیمون؛ فست فود مدرن با برگر دست‌ساز، پیتزا، سوخاری و نوشیدنی‌های تازه. منوی دیجیتال را ببینید و از اسنپ‌فود سفارش دهید.",
      },
      { property: "og:title", content: "بمب لیمون | فست فود مدرن، سریع و خوشمزه" },
      {
        property: "og:description",
        content: "بمب لیمون؛ فست فود مدرن با برگر دست‌ساز، پیتزا، سوخاری و نوشیدنی‌های تازه. منوی دیجیتال را ببینید و از اسنپ‌فود سفارش دهید.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const features = [
  { icon: Leaf, title: "مواد اولیه تازه", text: "روزانه تهیه می‌شود، بدون نگهدارنده." },
  { icon: Flame, title: "دستور پخت اختصاصی", text: "سس لیمویی امضای بمب لیمون." },
  { icon: Truck, title: "ارسال سریع", text: "سفارش آنلاین از اسنپ‌فود در چند دقیقه." },
];

function HomePage() {
  const settings = useSettings();
  const { categories, products } = Route.useLoaderData() as {
    categories: Category[];
    products: Product[];
  };
  const emojiByCategory = new Map(categories.map((c) => [c.id, c.emoji]));
  const featured = products.filter((p) => p.labels.length > 0).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <img
              src={settings?.hero_image_url || heroImage}
              alt="برگر مخصوص بمب لیمون"
              width={1600}
              height={1200}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/80 to-background/40" />
          </div>

          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
            <div className="mx-auto max-w-xl animate-rise text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-semibold backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                طعمی که منفجر می‌شود
              </span>
              <h1 className="mt-5 text-4xl font-black leading-[1.2] text-balance-fa sm:text-5xl lg:text-6xl">
                {settings?.brand_name ?? "بمب لیمون"}
              </h1>
              <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
                {settings?.bio}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-lift transition-transform hover:scale-[1.04]"
                >
                  مشاهده منو
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <a
                  href={settings?.snappfood_url || "#"}
                  onClick={(e) => {
                    const next = pickOrderUrl(settings);
                    if (next) e.currentTarget.href = next;
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-bold transition-colors hover:bg-accent"
                >
                  سفارش از اسنپ‌فود
                </a>
              </div>

              <dl className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {settings?.working_hours}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {settings?.address}
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="surface-card p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl gradient-lemon text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
          <h2 className="text-2xl font-extrabold sm:text-3xl">دسته‌بندی‌ها</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/menu"
                hash={c.slug}
                className="surface-card flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                <span className="text-xl">{c.emoji}</span>
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED */}
        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-extrabold sm:text-3xl">پیشنهاد ویژه</h2>
              <Link to="/menu" className="text-sm font-semibold text-primary hover:underline">
                همه منو
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  emoji={emojiByCategory.get(p.category_id ?? "") ?? ""}
                  orderUrl={settings?.snappfood_url ?? ""}
                />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="surface-card gradient-lemon overflow-hidden p-8 text-center sm:p-12">
            <h2 className="text-2xl font-black text-primary-foreground sm:text-3xl">
              عضو باشگاه مشتریان بمب لیمون شوید
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-primary-foreground/80">
              از تخفیف‌ها، محصولات جدید و پیشنهادهای ویژه زودتر از همه باخبر شوید.
            </p>
            <Link
              to="/club"
              className="mt-6 inline-flex rounded-full bg-foreground px-7 py-3.5 text-sm font-bold text-background transition-transform hover:scale-[1.04]"
            >
              ثبت‌نام رایگان
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
