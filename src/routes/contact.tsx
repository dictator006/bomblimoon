import { useSettings } from "@/lib/use-settings";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Compass, MapPin, Navigation, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPhone, telLink } from "@/lib/types";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس با ما | بمب لیمون" },
      {
        name: "description",
        content:
          "شماره تماس، آدرس و ساعات کاری بمب لیمون. با یک کلیک تماس بگیرید یا مسیریابی با گوگل مپ و نشان را باز کنید.",
      },
      { property: "og:title", content: "تماس با ما | بمب لیمون" },
      { property: "og:description", content: "آدرس، شماره تماس و ساعات کاری بمب لیمون." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const settings = useSettings();
  const phones = [settings?.phone, settings?.phone_secondary].filter(Boolean) as string[];
  const mobiles = [settings?.mobile_primary, settings?.mobile_secondary].filter(Boolean) as string[];
  const allPhones = [...phones, ...mobiles];

  const items = [
    {
      icon: Phone,
      title: "شماره تماس",
      value: allPhones.map(formatPhone).join(" / "),
      ltr: true,
    },
    { icon: MapPin, title: "آدرس", value: settings?.address ?? "" },
    { icon: Clock, title: "ساعات کاری", value: settings?.working_hours ?? "" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-black sm:text-4xl">تماس با ما</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
          هر روز هفته آماده پذیرایی از شما هستیم. برای رزرو یا سفارش تلفنی تماس بگیرید.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="surface-card p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl gradient-lemon text-primary-foreground">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-bold text-muted-foreground">{item.title}</h2>
              <p className="mt-2 text-base font-semibold" dir={item.ltr ? "ltr" : undefined}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {allPhones.map((phone) => (
            <a
              key={phone}
              href={telLink(phone)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
            >
              <Phone className="h-4 w-4" />
              <span dir="ltr">{formatPhone(phone)}</span>
            </a>
          ))}
          <a
            href={settings?.google_maps_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-4 text-sm font-bold transition-colors hover:bg-accent"
          >
            <Navigation className="h-4 w-4 text-primary" />
            گوگل مپ
          </a>
          <a
            href={settings?.neshan_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-4 text-sm font-bold transition-colors hover:bg-accent"
          >
            <Compass className="h-4 w-4 text-primary" />
            نشان
          </a>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
