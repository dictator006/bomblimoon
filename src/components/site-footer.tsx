import { useSettings } from "@/lib/use-settings";
import { Link } from "@tanstack/react-router";
import { Clock, Lock, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import { formatPhone, telLink } from "@/lib/types";

export function SiteFooter() {
  const settings = useSettings();
  const phones = [settings?.phone, settings?.phone_secondary].filter(Boolean) as string[];

  return (
    <footer className="mt-20 border-t border-border bg-card/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src={settings?.logo_url || logo}
              alt={`لوگوی ${settings?.brand_name ?? "بمب لیمون"}`}
              width={40}
              height={40}
              loading="lazy"
              className="h-10 w-10 rounded-xl object-contain"
            />
            <span className="text-lg font-extrabold">{settings?.brand_name ?? "بمب لیمون"}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">{settings?.bio}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold">دسترسی سریع</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/menu" className="hover:text-foreground">
                منوی دیجیتال
              </Link>
            </li>
            <li>
              <Link to="/club" className="hover:text-foreground">
                باشگاه مشتریان
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                تماس با ما
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold">اطلاعات تماس</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="font-semibold">شماره تماس</span>
              </div>
              <div className="mr-6 flex flex-col gap-1">
                {phones.map((phone) => (
                  <a
                    key={phone}
                    href={telLink(phone)}
                    dir="ltr"
                    className="hover:text-foreground"
                  >
                    {formatPhone(phone)}
                  </a>
                ))}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{settings?.address}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{settings?.working_hours}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {settings?.brand_name ?? "بمب لیمون"} — تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}
