export interface SiteSettings {
  id: string;
  brand_name: string;
  logo_url: string | null;
  hero_image_url: string | null;
  bio: string;
  phone: string;
  address: string;
  working_hours: string;
  snappfood_url: string;
  google_maps_url: string;
  neshan_url: string;
  meta_title: string;
  meta_description: string;
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
  special: { text: "فروش ویژه", emoji: "⭐" },
  new: { text: "جدید", emoji: "🆕" },
};

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
}
