import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_LABELS, formatPrice, type Category, type Product } from "@/lib/types";
import { AdminButton, Field, ImageUploader, inputClass } from "./ui";

function slugify(name: string) {
  return (
    name
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .toLowerCase() || `p-${Date.now()}`
  );
}

const empty: Partial<Product> = {
  name: "",
  description: "",
  price: 0,
  is_available: true,
  labels: [],
  image_url: null,
};

export function ProductsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [filter, setFilter] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as Category[];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "products"] });

  const save = useMutation({
    mutationFn: async (p: Partial<Product>) => {
      const payload = {
        name: p.name!.trim(),
        slug: p.slug?.trim() || slugify(p.name!),
        description: (p.description ?? "").trim(),
        price: Number(p.price) || 0,
        category_id: p.category_id ?? null,
        image_url: p.image_url ?? null,
        is_available: p.is_available ?? true,
        labels: p.labels ?? [],
        sort_order: p.sort_order ?? products.length + 1,
      };
      const { error } = p.id
        ? await supabase.from("products").update(payload).eq("id", p.id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("محصول ذخیره شد.");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("محصول حذف شد.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const catName = useMemo(
    () => new Map(categories.map((c) => [c.id, `${c.emoji} ${c.name}`])),
    [categories],
  );

  const visible = products.filter((p) => p.name.includes(filter.trim()));

  function toggleLabel(label: string) {
    if (!editing) return;
    const current = editing.labels ?? [];
    setEditing({
      ...editing,
      labels: current.includes(label) ? current.filter((l) => l !== label) : [...current, label],
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold">محصولات ({products.length})</h2>
        <div className="flex gap-2">
          <input
            placeholder="جستجوی محصول..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={inputClass + " w-44"}
          />
          <AdminButton onClick={() => setEditing({ ...empty })}>
            <Plus className="h-4 w-4" />
            محصول جدید
          </AdminButton>
        </div>
      </div>

      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(editing);
          }}
          className="surface-card grid gap-4 p-5 md:grid-cols-2"
        >
          <Field label="نام محصول">
            <input
              required
              className={inputClass}
              value={editing.name ?? ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
          </Field>
          <Field label="دسته‌بندی">
            <select
              className={inputClass}
              value={editing.category_id ?? ""}
              onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })}
            >
              <option value="">بدون دسته</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="توضیح کوتاه">
              <textarea
                rows={2}
                maxLength={300}
                className={inputClass}
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>
          </div>
          <Field label="قیمت (تومان)">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={editing.price ?? 0}
              onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
            />
          </Field>
          <Field label="وضعیت موجودی">
            <select
              className={inputClass}
              value={editing.is_available ? "1" : "0"}
              onChange={(e) => setEditing({ ...editing, is_available: e.target.value === "1" })}
            >
              <option value="1">موجود</option>
              <option value="0">ناموجود</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">برچسب‌ها</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRODUCT_LABELS).map(([key, meta]) => {
                const active = (editing.labels ?? []).includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleLabel(key)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {meta.emoji} {meta.text}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <ImageUploader
              value={editing.image_url ?? null}
              onChange={(url) => setEditing({ ...editing, image_url: url })}
              label="تصویر محصول"
            />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <AdminButton type="submit" disabled={save.isPending}>
              ذخیره محصول
            </AdminButton>
            <AdminButton variant="ghost" onClick={() => setEditing(null)}>
              انصراف
            </AdminButton>
          </div>
        </form>
      )}

      <div className="surface-card divide-y divide-border overflow-hidden">
        {visible.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg">🍽️</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{p.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {catName.get(p.category_id ?? "") ?? "بدون دسته"} · {formatPrice(p.price)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                p.is_available ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              }`}
            >
              {p.is_available ? "موجود" : "ناموجود"}
            </span>
            <button
              aria-label="ویرایش"
              onClick={() => setEditing(p)}
              className="rounded-lg p-2 hover:bg-accent"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              aria-label="حذف"
              onClick={() => {
                if (confirm(`محصول «${p.name}» حذف شود؟`)) remove.mutate(p.id);
              }}
              className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">محصولی یافت نشد.</p>
        )}
      </div>
    </div>
  );
}
