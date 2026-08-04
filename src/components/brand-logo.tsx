import { useEffect, useState } from "react";
import logoAsset from "@/assets/limoon-logo.png.asset.json";

const SWEEP_KEY = "bomb-lemon-logo-sweep";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
};

/** Animated brand mark: entrance, float, lemon glow pulse, one-per-session light sweep. */
export function BrandLogo({ src, alt, className = "" }: Props) {
  const [sweep, setSweep] = useState(false);

  useEffect(() => {
    try {
      if (!window.sessionStorage.getItem(SWEEP_KEY)) {
        window.sessionStorage.setItem(SWEEP_KEY, "1");
        setSweep(true);
      }
    } catch {
      /* storage unavailable — skip sweep */
    }
  }, []);

  return (
    <span className={`logo-mark ${className}`}>
      <span aria-hidden className="logo-glow" />
      <span className="logo-float">
        <img
          src={src || logoAsset.url}
          alt={alt}
          width={320}
          height={214}
          fetchPriority="high"
          decoding="async"
          className="logo-img"
        />
        {sweep && <span aria-hidden className="logo-sweep" />}
      </span>
      <span aria-hidden className="logo-shadow" />
    </span>
  );
}
