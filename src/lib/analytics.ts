import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "bl-visitor-id";
const SESSION_KEY = "bl-session-id";

export type DeviceType = "mobile" | "tablet" | "desktop";
export type TrafficSource = "google" | "social" | "referral" | "direct";

function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function detectDevice(): DeviceType {
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|windows phone/.test(ua)) return "mobile";
  return "desktop";
}

function detectSource(referrer: string): TrafficSource {
  if (!referrer) return "direct";
  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "direct";
  }
  if (host === window.location.hostname) return "direct";
  if (/google\.|bing\.|yahoo\.|duckduckgo\.|yandex\./.test(host)) return "google";
  if (/instagram\.|facebook\.|t\.co|twitter\.|x\.com|telegram|whatsapp|linkedin\.|pinterest\.|aparat\./.test(host))
    return "social";
  return "referral";
}

/** Records a page view and returns a function that flushes the time spent on it. */
export async function trackPageView(path: string): Promise<void> {
  if (typeof window === "undefined") return;
  let visitorId = window.localStorage.getItem(VISITOR_KEY);
  const isNewVisitor = !visitorId;
  if (!visitorId) {
    visitorId = uid();
    window.localStorage.setItem(VISITOR_KEY, visitorId);
  }
  let sessionId = window.sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uid();
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  const referrer = document.referrer || "";
  const { data, error } = await (supabase.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: string | null; error: unknown }>)("track_page_view", {
    _visitor_id: visitorId,
    _session_id: sessionId,
    _path: path,
    _referrer: referrer,
    _source: detectSource(referrer),
    _device: detectDevice(),
    _is_new_visitor: isNewVisitor,
  });
  if (error || !data) return;

  const viewId = data;
  const start = Date.now();
  let sent = false;
  const flush = () => {
    if (sent) return;
    sent = true;
    void (supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<unknown>)(
      "track_page_duration",
      { _view_id: viewId, _duration_ms: Date.now() - start },
    );
  };
  window.addEventListener("pagehide", flush, { once: true });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") flush();
    },
    { once: true },
  );
  // also flush when the next page view starts
  window.setTimeout(flush, 5 * 60 * 1000);
}
