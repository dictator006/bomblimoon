
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- SETTINGS
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL DEFAULT 'بمب لیمون',
  logo_url text,
  hero_image_url text,
  bio text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  working_hours text NOT NULL DEFAULT '',
  snappfood_url text NOT NULL DEFAULT '',
  google_maps_url text NOT NULL DEFAULT '',
  neshan_url text NOT NULL DEFAULT '',
  meta_title text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are public" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  emoji text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL DEFAULT 0,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  labels text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_id);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CLUB MEMBERS
CREATE TABLE public.club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  mobile text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.club_members TO authenticated;
GRANT ALL ON public.club_members TO service_role;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read members" ON public.club_members FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete members" ON public.club_members FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (bio, phone, address, working_hours, snappfood_url, google_maps_url, neshan_url, meta_title, meta_description)
VALUES (
  'بمب لیمون؛ طعمی متفاوت از فست‌فود مدرن ایرانی. با مواد اولیه تازه، دستور پخت اختصاصی و سرویس سریع، هر وعده را به یک تجربه لذت‌بخش تبدیل می‌کنیم.',
  '02112345678',
  'تهران، خیابان ولیعصر، پلاک ۱۲۰',
  'همه روزه ۱۲:۰۰ تا ۲۳:۳۰',
  'https://snappfood.ir',
  'https://maps.google.com',
  'https://neshan.org',
  'بمب لیمون | فست فود مدرن و خوشمزه',
  'منوی دیجیتال بمب لیمون؛ برگر، پیتزا، سوخاری و نوشیدنی با کیفیت پریمیوم. سفارش آنلاین از اسنپ‌فود.'
);

INSERT INTO public.categories (name, slug, emoji, sort_order) VALUES
  ('برگر','burger','🍔',1),
  ('پیتزا','pizza','🍕',2),
  ('هات داگ','hotdog','🌭',3),
  ('سوخاری','fried','🍗',4),
  ('پیش غذا','starters','🍟',5),
  ('نوشیدنی','drinks','🥤',6),
  ('دسر','dessert','🍰',7);

INSERT INTO public.products (category_id, name, slug, description, price, is_available, labels, sort_order)
SELECT c.id, v.name, v.slug, v.descr, v.price, v.avail, v.labels, v.ord
FROM (VALUES
  ('burger','برگر بمب لیمون','bomb-lemon-burger','برگر دست‌ساز ۲۰۰ گرمی با سس مخصوص لیمویی و پنیر چدار',285000,true,ARRAY['bestseller'],1),
  ('burger','چیزبرگر دوبل','double-cheeseburger','دو لایه گوشت گریل شده با پنیر گودا و ژامبون',345000,true,ARRAY['special'],2),
  ('burger','مشروم برگر','mushroom-burger','برگر گوشت با قارچ سوته و سس خامه‌ای',298000,true,ARRAY[]::text[],3),
  ('pizza','پیتزا پپرونی','pepperoni-pizza','خمیر ایتالیایی، پپرونی تند و پنیر موزارلا',320000,true,ARRAY['bestseller'],1),
  ('pizza','پیتزا مخصوص','special-pizza','ترکیب گوشت، مرغ، قارچ و فلفل دلمه‌ای',360000,true,ARRAY['new'],2),
  ('hotdog','هات داگ پنیری','cheese-hotdog','سوسیس آلمانی با پنیر ذوب شده و خردل',185000,true,ARRAY[]::text[],1),
  ('fried','سوخاری ۳ تکه','fried-chicken-3','مرغ سوخاری کریسپی با آرد مخصوص',265000,true,ARRAY['bestseller'],1),
  ('fried','استریپس مرغ','chicken-strips','۵ عدد استریپس تُرد با سس هانی ماسترد',245000,false,ARRAY[]::text[],2),
  ('starters','سیب زمینی سرخ کرده','french-fries','سیب زمینی طلایی با ادویه مخصوص',115000,true,ARRAY[]::text[],1),
  ('starters','قارچ سوخاری','fried-mushroom','قارچ تُرد با سس رنچ',135000,true,ARRAY['new'],2),
  ('drinks','لیموناد بمب','bomb-lemonade','لیموناد تازه با نعناع و یخ',85000,true,ARRAY['special'],1),
  ('drinks','نوشابه قوطی','canned-soda','انواع نوشابه ۳۳۰ میلی‌لیتر',35000,true,ARRAY[]::text[],2),
  ('dessert','براونی شکلاتی','chocolate-brownie','براونی گرم با سس شکلات بلژیکی',145000,true,ARRAY['new'],1)
) AS v(cat, name, slug, descr, price, avail, labels, ord)
JOIN public.categories c ON c.slug = v.cat;
