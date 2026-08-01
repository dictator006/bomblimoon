import { useState, type ReactNode } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

export function AdminButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    ghost: "border border-border bg-card hover:bg-accent",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

export function ImageUploader({
  value,
  onChange,
  label = "تصویر",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handle(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file));
      toast.success("تصویر آپلود شد.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "آپلود ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl">🖼️</div>
          )}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          انتخاب تصویر
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handle(e.target.files?.[0])}
          />
        </label>
        {value && (
          <AdminButton variant="ghost" onClick={() => onChange(null)}>
            حذف
          </AdminButton>
        )}
      </div>
    </div>
  );
}
