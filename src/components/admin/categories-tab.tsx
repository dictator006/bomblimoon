import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/types";
import { AdminButton, Field, inputClass } from "./ui";

function slugify(name: string) {
  return (
    name
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .toLowerCase() || `cat-${Date.now()}`
  );
}

export function CategoriesTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Category> | null>(null);

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

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "categories"] });

  const save = useMutation({
    mutationFn: async (cat: Partial<Category>) => {
      const payload = {
        name: cat.name!.trim(),
        emoji: cat.emoji ?? "",
        slug: cat.slug?.trim() || slugify(cat.name!),
        sort_order: cat.sort_order ?? categories.length + 1,
      };
      const { error } = cat.id
        ? await supabase.from("categories").update(payload).eq("id", cat.id)
        : await supabase.from("categories").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("دسته‌بندی ذخیره شد.");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("دسته‌بندی حذف شد.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: async ({ index, dir }: { index: number; dir: -1 | 1 }) => {
      const a = categories[index];
      const b = categories[index + dir];
      if (!a || !b) return;
      await supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id);
      await supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id);
    },
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold">دسته‌بندی‌ها ({categories.length})</h2>
        <AdminButton onClick={() => setEditing({ name: "", emoji: "" })}>
          <Plus className="h-4 w-4" />
          دسته جدید
        </AdminButton>
      </div>

      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(editing);
          }}
          className="surface-card grid gap-4 p-5 sm:grid-cols-3"
        >
          <Field label="نام دسته">
            <input
              required
              className={inputClass}
              value={editing.name ?? ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
          </Field>
          <Field label="ایموجی">
            <input
              className={inputClass}
              placeholder="🍔"
              value={editing.emoji ?? ""}
              onChange={(e) => setEditing({ ...editing, emoji: e.target.value })}
            />
          </Field>
          <div className="flex items-end gap-2">
            <AdminButton type="submit" disabled={save.isPending}>
              ذخیره
            </AdminButton>
            <AdminButton variant="ghost" onClick={() => setEditing(null)}>
              انصراف
            </AdminButton>
          </div>
        </form>
      )}

      <div className="surface-card divide-y divide-border overflow-hidden">
        {categories.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3 p-4">
            <span className="text-2xl">{c.emoji}</span>
            <span className="flex-1 text-sm font-semibold">{c.name}</span>
            <div className="flex items-center gap-1">
              <button
                aria-label="بالا"
                disabled={i === 0}
                onClick={() => reorder.mutate({ index: i, dir: -1 })}
                className="rounded-lg p-2 hover:bg-accent disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                aria-label="پایین"
                disabled={i === categories.length - 1}
                onClick={() => reorder.mutate({ index: i, dir: 1 })}
                className="rounded-lg p-2 hover:bg-accent disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                aria-label="ویرایش"
                onClick={() => setEditing(c)}
                className="rounded-lg p-2 hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                aria-label="حذف"
                onClick={() => {
                  if (confirm(`دسته «${c.name}» حذف شود؟`)) remove.mutate(c.id);
                }}
                className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">هنوز دسته‌بندی ندارید.</p>
        )}
      </div>
    </div>
  );
}
