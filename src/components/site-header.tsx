import { Link, useLoaderData } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import { useTheme } from "@/lib/theme";

const links = [
  { to: "/", label: "خانه" },
  { to: "/menu", label: "منو" },
  { to: "/club", label: "باشگاه مشتریان" },
  { to: "/contact", label: "تماس با ما" },
  { to: "/qr", label: "کیو‌آر کد" },
] as const;

export function SiteHeader() {
  const settings = useLoaderData({ from: "__root__" });
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-18 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img
            src={settings?.logo_url || logo}
            alt={`لوگوی ${settings?.brand_name ?? "بمب لیمون"}`}
            width={40}
            height={40}
            className="h-9 w-9 rounded-xl object-contain sm:h-10 sm:w-10"
          />
          <span className="text-base font-extrabold tracking-tight sm:text-lg">
            {settings?.brand_name ?? "بمب لیمون"}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "!text-foreground bg-accent" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label="تغییر حالت روشن و تاریک"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          <Link
            to="/menu"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            مشاهده منو
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="منوی ناوبری"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                activeProps={{ className: "!text-foreground bg-accent" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
