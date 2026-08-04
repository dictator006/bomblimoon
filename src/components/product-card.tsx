import { ExternalLink } from "lucide-react";
import { PRODUCT_LABELS, formatPrice, type Product } from "@/lib/types";

export function ProductCard({
  product,
  emoji,
  orderUrl,
  pickOrderUrl,
}: {
  product: Product;
  emoji: string;
  orderUrl: string;
  pickOrderUrl?: () => string;
}) {
  return (
    <article className="group surface-card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl" aria-hidden>
            {emoji || "🍽️"}
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
          {product.labels.map((label) => {
            const meta = PRODUCT_LABELS[label];
            if (!meta) return null;
            return (
              <span
                key={label}
                className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-soft"
              >
                {meta.emoji} {meta.text}
              </span>
            );
          })}
        </div>

        {!product.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
            <span className="rounded-full bg-destructive px-4 py-1.5 text-xs font-bold text-destructive-foreground">
              ناموجود
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-6">{product.name}</h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              product.is_available
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {product.is_available ? "موجود" : "ناموجود"}
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
          {product.description}
        </p>
        {sizes.length > 0 && (
          <ul className="mt-2 space-y-1.5 rounded-2xl bg-muted/50 p-3">
            {sizes.map((s) => (
              <li key={s.label} className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{s.label}</span>
                <span>{formatPrice(s.price)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="text-sm font-extrabold text-foreground">
            {sizes.length > 0 ? `از ${formatPrice(sizes[0]!.price)}` : formatPrice(product.price)}
          </span>
          <
            href={orderUrl || "#"}
            onClick={(e) => {
              const next = pickOrderUrl?.();
              if (next) e.currentTarget.href = next;
            }}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!product.is_available}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-transform ${
              product.is_available
                ? "bg-primary text-primary-foreground hover:scale-[1.04]"
                : "pointer-events-none bg-muted text-muted-foreground"
            }`}
          >
            سفارش
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
