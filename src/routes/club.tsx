import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Gift, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { joinClub } from "@/lib/site.functions";

export const Route = createFileRoute("/club")({
  head: () => ({
    meta: [
      { title: "باشگاه مشتریان | بمب لیمون" },
      {
        name: "description",
        content:
          "با عضویت در باشگاه مشتریان بمب لیمون از تخفیف‌ها، محصولات جدید و پیشنهادهای ویژه زودتر از همه باخبر شوید.",
      },
      { property: "og:title", content: "باشگاه مشتریان | بمب لیمون" },
      { property: "og:description", content: "عضویت رایگان در باشگاه مشتریان بمب لیمون." },
      { property: "og:url", content: "/club" },
    ],
    links: [{ rel: "canonical", href: "/club" }],
  }),
  component: ClubPage,
});

function ClubPage() {
  const settings = useLoaderData({ from: "__root__" });
  const submit = useServerFn(joinClub);
  const [form, setForm] = useState({ firstName: "", lastName: "", mobile: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submit({ data: form });
      if (res.ok) {
        toast.success(res.message);
        setDone(true);
        setForm({ firstName: "", lastName: "", mobile: "" });
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("خطا در ارتباط با سرور. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 md:items-center">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold">
            <Gift className="h-3.5 w-3.5 text-primary" />
            عضویت رایگان
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
            باشگاه مشتریان {settings?.brand_name ?? "بمب لیمون"}
          </h1>
          <p className="mt-4 text-sm leading-8 text-muted-foreground">
            با عضویت در باشگاه مشتریان، از تخفیف‌های اختصاصی، معرفی محصولات جدید و جشنواره‌های فصلی
            زودتر از همه باخبر می‌شوید. اطلاعات شما نزد ما محفوظ است.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">🎁 تخفیف‌های اختصاصی اعضا</li>
            <li className="flex items-center gap-2">🆕 اطلاع از محصولات جدید</li>
            <li className="flex items-center gap-2">🎂 هدیه روز تولد</li>
          </ul>
        </div>

        <div className="surface-card p-6 sm:p-8">
          {done ? (
            <div className="py-8 text-center">
              <div className="text-5xl">🎉</div>
              <h2 className="mt-4 text-xl font-bold">عضویت شما ثبت شد</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                به خانواده {settings?.brand_name ?? "بمب لیمون"} خوش آمدید.
              </p>
              <button
                onClick={() => setDone(false)}
                className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent"
              >
                ثبت‌نام عضو دیگر
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-sm font-semibold">
                    نام
                  </label>
                  <input
                    id="firstName"
                    required
                    maxLength={50}
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="مثلاً: علی"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-2 block text-sm font-semibold">
                    نام خانوادگی
                  </label>
                  <input
                    id="lastName"
                    required
                    maxLength={50}
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="مثلاً: رضایی"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="mobile" className="mb-2 block text-sm font-semibold">
                  شماره موبایل
                </label>
                <input
                  id="mobile"
                  required
                  inputMode="tel"
                  dir="ltr"
                  maxLength={20}
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-left text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="09121234567"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  شماره موبایل ایران، با فرمت ۰۹۱۲۱۲۳۴۵۶۷
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                عضویت در باشگاه
              </button>
            </form>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
