import { useSettings } from "@/lib/use-settings";
import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";
import { BrandLogo } from "@/components/brand-logo";

const links = [
  { to: "/", label: "خانه" },
  { to: "/menu", label: "منو" },
  { to: "/club", label: "باشگاه مشتریان" },
  { to: "/contact", label: "تماس با ما" },
] as const;

export function SiteHeader() {
  const settings = useSettings();
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
          ? "border-b border-border bg-background/95 backdrop-blur-xl shadow-soft"
          : "border-b border-transparent bg-background"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 pt-3 pb-2 sm:pt-4">
          <button
            type="button"
            onClick={toggle}
            aria-label="تغییر حالت روشن و تاریک"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="mx-auto flex min-w-0 justify-center"
            aria-label={settings?.brand_name ?? "بمب لیمون"}
          >
            <BrandLogo
              src={settings?.logo_url}
              alt={`لوگوی ${settings?.brand_name ?? "بمب لیمون"}`}
              className={`w-auto transition-all duration-300 ${
                scrolled
                  ? "h-10 max-w-[130px] sm:h-12 sm:max-w-[170px] lg:h-14 lg:max-w-[200px]"
                  : "h-14 max-w-[190px] sm:h-20 sm:max-w-[260px] lg:h-24 lg:max-w-[320px]"
              }`}
            />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="منوی ناوبری"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link
            to="/menu"
            className="hidden shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03] md:inline-flex"
          >
            مشاهده منو
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-1 pb-3 md:flex">
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
