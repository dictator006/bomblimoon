import { createServerFn } from "@tanstack/react-start";
import { normalizeIranMobile } from "./mobile";
import type { Category, Product, SiteSettings } from "./types";

export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings | null> => {
    const { createPublicClient } = await import("./public-client.server");
    const { data } = await createPublicClient()
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    return (data ?? null) as SiteSettings | null;
  },
);

export const getMenu = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ categories: Category[]; products: Product[] }> => {
    const { createPublicClient } = await import("./public-client.server");
    const supabase = createPublicClient();
    const [categories, products] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("products").select("*").order("sort_order", { ascending: true }),
    ]);
    return {
      categories: (categories.data ?? []) as Category[],
      products: (products.data ?? []) as Product[],
    };
  },
);

export const joinClub = createServerFn({ method: "POST" })
  .inputValidator((data: { firstName: string; lastName: string; mobile: string }) => data)
  .handler(async ({ data }) => {
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    if (firstName.length < 2 || firstName.length > 50) {
      return { ok: false as const, message: "نام را درست وارد کنید." };
    }
    if (lastName.length < 2 || lastName.length > 50) {
      return { ok: false as const, message: "نام خانوادگی را درست وارد کنید." };
    }
    const mobile = normalizeIranMobile(data.mobile ?? "");
    if (!mobile) {
      return { ok: false as const, message: "شماره موبایل معتبر نیست. مثال: ۰۹۱۲۱۲۳۴۵۶۷" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("club_members")
      .insert({ first_name: firstName, last_name: lastName, mobile });

    if (error) {
      if (error.code === "23505") {
        return { ok: false as const, message: "این شماره موبایل قبلاً ثبت شده است." };
      }
      return { ok: false as const, message: "ثبت‌نام انجام نشد. دوباره تلاش کنید." };
    }
    return { ok: true as const, message: "عضویت شما با موفقیت ثبت شد 🎉" };
  });
