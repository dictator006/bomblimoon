import { useSettings } from "@/lib/use-settings";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, QrCode } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "کیو‌آر کد منو | بمب لیمون" },
      {
        name: "description",
        content:
          "کیو‌آر کد اختصاصی منوی بمب لیمون را با کیفیت چاپ دانلود کنید و روی میز، ویترین، منو و تراکت استفاده کنید.",
      },
      { property: "og:title", content: "کیو‌آر کد منو | بمب لیمون" },
      { property: "og:description", content: "دانلود کیو‌آر کد با کیفیت بالا برای چاپ." },
      { property: "og:url", content: "/qr" },
    ],
    links: [{ rel: "canonical", href: "/qr" }],
  }),
  component: QrPage,
});

function QrPage() {
  const settings = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");
  const [target, setTarget] = useState<"site" | "menu">("menu");

  useEffect(() => {
    const base = window.location.origin;
    setUrl(target === "menu" ? `${base}/menu` : base);
  }, [target]);

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    let cancelled = false;
    void (async () => {
      const QRCode = (await import("qrcode")).default;
      if (cancelled || !canvasRef.current) return;
      await QRCode.toCanvas(canvasRef.current, url, {
        width: 1200,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#111111", light: "#ffffff" },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${target}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold">
              <QrCode className="h-3.5 w-3.5 text-primary" />
              مناسب چاپ
            </span>
            <h1 className="mt-5 text-3xl font-black sm:text-4xl">کیو‌آر کد {settings?.brand_name ?? "بمب لیمون"}</h1>
            <p className="mt-4 text-sm leading-8 text-muted-foreground">
              کیو‌آر کد را با کیفیت ۱۲۰۰ پیکسل دانلود کنید و روی میزها، ویترین مغازه، منوی چاپی و
              تراکت‌ها استفاده کنید. مشتری با اسکن، مستقیم وارد منوی دیجیتال می‌شود.
            </p>

            <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1">
              <button
                onClick={() => setTarget("menu")}
                className={`rounded-full px-5 py-2 text-sm font-semibold ${target === "menu" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                منوی دیجیتال
              </button>
              <button
                onClick={() => setTarget("site")}
                className={`rounded-full px-5 py-2 text-sm font-semibold ${target === "site" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                صفحه اصلی
              </button>
            </div>

            <p className="mt-4 break-all text-xs text-muted-foreground" dir="ltr">
              {url}
            </p>

            <button
              onClick={download}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03]"
            >
              <Download className="h-4 w-4" />
              دانلود کیو‌آر کد (PNG)
            </button>
          </div>

          <div className="surface-card flex items-center justify-center p-6 sm:p-10">
            <canvas ref={canvasRef} className="h-auto w-full max-w-xs rounded-2xl" />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
