export interface SiteSettings {
  id: string;
  brand_name: string;
  logo_url: string | null;
  hero_image_url: string | null;
  bio: string;
  phone: string;
  phone_secondary: string | null;
  address: string;
  working_hours: string;
  snappfood_url: string;
  snappfood_url_secondary: string;
  google_maps_url: string;
  neshan_url: string;
  meta_title: string;
  meta_description: string;
  mobile_primary: string;
  mobile_secondary: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  labels: string[];
  sort_order: number;
  price_single: number | null;
  price_medium: number | null;
  price_family: number | null;
}

export interface ClubMember {
  id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  created_at: string;
}

export const PRODUCT_LABELS: Record<string, { text: string; emoji: string }> = {
  bestseller: { text: "پرفروش", emoji: "🔥" },
  new: { text: "جدید", emoji: "🆕" },
};

/** All configured SnappFood links (non-empty). */
export function orderUrls(settings: SiteSettings | null): string[] {
  return [settings?.snappfood_url, settings?.snappfood_url_secondary]
    .map((u) => (u ?? "").trim())
    .filter((u) => u.length > 0);
}

/** Pick one SnappFood link at random. */
export function pickOrderUrl(settings: SiteSettings | null): string {
  const urls = orderUrls(settings);
  if (urls.length === 0) return "";
  return urls[Math.floor(Math.random() * urls.length)] as string;
}


export const PIZZA_SIZES = [
  { key: "price_single", label: "تک‌نفره" },
  { key: "price_medium", label: "متوسط" },
  { key: "price_family", label: "خانواده" },
] as const;

/** Sizes with a price defined for this product. */
export function productSizes(product: Product): { label: string; price: number }[] {
  return PIZZA_SIZES.filter((s) => (product[s.key] ?? 0) > 0).map((s) => ({
    label: s.label,
    price: product[s.key] as number,
  }));
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
}

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toEnglishDigits(value: string): string {
  return value.replace(/./g, (char) => {
    const pIndex = PERSIAN_DIGITS.indexOf(char);
    if (pIndex !== -1) return String(pIndex);
    const aIndex = ARABIC_DIGITS.indexOf(char);
    if (aIndex !== -1) return String(aIndex);
    return char;
  });
}

export function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (digit) => PERSIAN_DIGITS.charAt(parseInt(digit, 10)));
}

export function formatPhone(value: string): string {
  const digits = toEnglishDigits(value).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("021")) {
    return toPersianDigits(`${digits.slice(0, 3)}-${digits.slice(3)}`);
  }
  return toPersianDigits(digits);
}

export function telLink(value: string): string {
  const digits = toEnglishDigits(value).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("021")) {
    return `tel:+98${digits.slice(1)}`;
  }
  return `tel:${digits}`;
}
