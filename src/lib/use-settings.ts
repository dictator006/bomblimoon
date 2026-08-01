import { useLoaderData } from "@tanstack/react-router";
import type { SiteSettings } from "./types";

/** Site settings loaded once by the root route and shared by every page. */
export function useSettings(): SiteSettings | null {
  return useLoaderData({ from: "__root__" }) as unknown as SiteSettings | null;
}
