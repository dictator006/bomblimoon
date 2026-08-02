import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { SiteSettings } from "@/lib/types";
import { AdminButton, Field, inputClass } from "./ui";

const FIELDS: { key: keyof SiteSettings; label: string; ltr?: boolean }[] = [
  { key: "brand_name", label: "نام برند" },
  { key: "bio", label: "معرفی برند" },
  { key: "phone", label: "شماره تماس اصلی", ltr: true },
  { key: "phone_secondary", label: "شماره تماس دوم", ltr: true },
  { key: "address", label: "آدرس" },
  { key: "working_hours", label: "ساعات کاری" },
  { key: "snappfood_url", label: "لینک اسنپ‌فود", ltr: true },
  { key: "google_maps_url", label: "لینک گوگل مپ", ltr: true },
  { key: "neshan_url", label: "لینک نشان", ltr: true },
  { key: "meta_title", label: "عنوان سئو" },
  { key: "meta_description", label: "توضیحات سئو" },
];

export function SettingsTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1).single();
      if (error) throw error;
      return data as unknown as SiteSettings;
    },
  });

  useEffect(() => {
    if (data) {
      const next: Record<string, string> = {};
      for (const f of FIELDS) next[f.key as string] = (data[f.key] as string | null) ?? "";
      setForm(next);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data) return;
      const { error } = await supabase.from("site_settings").update(form as Partial<SiteSettings>).eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تنظیمات ذخیره شد.");
      void qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-5"
    >
      <h2 className="text-lg font-extrabold">تنظیمات سایت</h2>
      <div className="surface-card grid gap-4 p-5 md:grid-cols-2">
        {FIELDS.map((f) => (
          <Field key={f.key as string} label={f.label}>
            <input
              dir={f.ltr ? "ltr" : "rtl"}
              className={inputClass + (f.ltr ? " text-left" : "")}
              value={form[f.key as string] ?? ""}
              onChange={(e) => setForm({ ...form, [f.key as string]: e.target.value })}
            />
          </Field>
        ))}
        <div className="md:col-span-2">
          <AdminButton type="submit" disabled={save.isPending}>
            <Save className="h-4 w-4" />
            ذخیره تنظیمات
          </AdminButton>
        </div>
      </div>
    </form>
  );
}
