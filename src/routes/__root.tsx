import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { themeScript } from "../lib/theme";
import { getSiteSettings } from "../lib/site.functions";
import type { SiteSettings } from "../lib/types";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">۴۰۴</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">صفحه پیدا نشد</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          صفحه‌ای که دنبال آن هستید وجود ندارد یا جابه‌جا شده است.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            بازگشت به خانه
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          این صفحه بارگذاری نشد
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          مشکلی پیش آمد. می‌توانید دوباره تلاش کنید یا به صفحه اصلی برگردید.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            تلاش دوباره
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            صفحه اصلی
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: (): Promise<SiteSettings | null> => getSiteSettings(),
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: loaderData?.meta_title || "بمب لیمون | فست فود مدرن" },
      {
        name: "description",
        content:
          loaderData?.meta_description ||
          "منوی دیجیتال بمب لیمون؛ برگر، پیتزا، سوخاری و نوشیدنی با کیفیت پریمیوم.",
      },
      { property: "og:site_name", content: loaderData?.brand_name || "بمب لیمون" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fa_IR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#f5c518" },
      { title: "بمب لیمون | فست فود مدرن، سریع و خوشمزه" },
      { property: "og:title", content: "بمب لیمون | فست فود مدرن، سریع و خوشمزه" },
      { name: "twitter:title", content: "بمب لیمون | فست فود مدرن، سریع و خوشمزه" },
      { name: "description", content: "بمب لیمون؛ فست فود مدرن با برگر دست‌ساز، پیتزا، سوخاری و نوشیدنی‌های تازه. منوی دیجیتال را ببینید و از اسنپ‌فود سفارش دهید." },
      { property: "og:description", content: "بمب لیمون؛ فست فود مدرن با برگر دست‌ساز، پیتزا، سوخاری و نوشیدنی‌های تازه. منوی دیجیتال را ببینید و از اسنپ‌فود سفارش دهید." },
      { name: "twitter:description", content: "بمب لیمون؛ فست فود مدرن با برگر دست‌ساز، پیتزا، سوخاری و نوشیدنی‌های تازه. منوی دیجیتال را ببینید و از اسنپ‌فود سفارش دهید." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/21d571ea-1bee-4998-94ff-376c4661e3f2" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/21d571ea-1bee-4998-94ff-376c4661e3f2" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: loaderData?.brand_name || "بمب لیمون",
          description: loaderData?.meta_description || "",
          servesCuisine: "Fast Food",
          telephone: loaderData?.phone || "",
          address: {
            "@type": "PostalAddress",
            streetAddress: loaderData?.address || "",
            addressCountry: "IR",
          },
          openingHours: loaderData?.working_hours || "",
          priceRange: "$$",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" dir="rtl" richColors />
    </QueryClientProvider>
  );
}
