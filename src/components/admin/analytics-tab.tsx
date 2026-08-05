import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, Eye, MousePointerClick, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toPersianDigits } from "@/lib/types";

type ViewRow = {
  id: string;
  visitor_id: string;
  session_id: string;
  path: string;
  source: string;
  device: string;
  is_new_visitor: boolean;
  duration_ms: number;
  created_at: string;
};

type RangeKey = "today" | "week" | "month" | "custom";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "today", label: "امروز" },
  { key: "week", label: "این هفته" },
  { key: "month", label: "این ماه" },
  { key: "custom", label: "بازه دلخواه" },
];

const SOURCE_LABELS: Record<string, string> = {
  google: "گوگل و موتورهای جستجو",
  social: "شبکه‌های اجتماعی",
  referral: "سایت‌های دیگر",
  direct: "ورود مستقیم",
};

const DEVICE_LABELS: Record<string, string> = {
  mobile: "موبایل",
  tablet: "تبلت",
  desktop: "دسکتاپ",
};

const PATH_LABELS: Record<string, string> = {
  "/": "صفحه اصلی",
  "/menu": "منو",
  "/club": "باشگاه مشتریان",
  "/contact": "تماس با ما",
};

const CHART_COLORS = ["#f5c518", "#22c55e", "#3b82f6", "#f97316", "#a855f7", "#ef4444"];

function startOf(range: RangeKey, customFrom: string): Date {
  const now = new Date();
  if (range === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "week") return new Date(now.getTime() - 7 * 86400000);
  if (range === "month") return new Date(now.getTime() - 30 * 86400000);
  return customFrom ? new Date(customFrom) : new Date(now.getTime() - 30 * 86400000);
}

function fa(n: number): string {
  return toPersianDigits(new Intl.NumberFormat("fa-IR").format(n));
}

function faDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${fa(m)} دقیقه ${fa(s)} ثانیه` : `${fa(s)} ثانیه`;
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Eye;
}) {
  return (
    <div className="surface-card flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <h3 className="mb-4 text-sm font-extrabold">{title}</h3>
      <div className="h-64 w-full" dir="ltr">
        {children}
      </div>
    </div>
  );
}

export function AnalyticsTab() {
  const [range, setRange] = useState<RangeKey>("week");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const bounds = useMemo(() => {
    const start = startOf(range, from);
    const end = range === "custom" && to ? new Date(`${to}T23:59:59`) : new Date();
    return { start, end };
  }, [range, from, to]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "analytics", range, from, to],
    refetchInterval: 20000,
    queryFn: async (): Promise<{ rows: ViewRow[]; totals: ViewRow[] }> => {
      const [ranged, all] = await Promise.all([
        supabase
          .from("page_views")
          .select("id, visitor_id, session_id, path, source, device, is_new_visitor, duration_ms, created_at")
          .gte("created_at", bounds.start.toISOString())
          .lte("created_at", bounds.end.toISOString())
          .order("created_at", { ascending: true })
          .limit(20000),
        supabase
          .from("page_views")
          .select("id, visitor_id, session_id, path, source, device, is_new_visitor, duration_ms, created_at")
          .order("created_at", { ascending: false })
          .limit(20000),
      ]);
      if (ranged.error) throw ranged.error;
      if (all.error) throw all.error;
      return {
        rows: (ranged.data ?? []) as unknown as ViewRow[],
        totals: (all.data ?? []) as unknown as ViewRow[],
      };
    },
  });

  const stats = useMemo(() => {
    const rows = data?.rows ?? [];
    const totals = data?.totals ?? [];
    const now = Date.now();
    const dayStart = new Date().setHours(0, 0, 0, 0);
    const countSince = (t: number) => totals.filter((r) => new Date(r.created_at).getTime() >= t).length;

    const uniques = new Set(rows.map((r) => r.visitor_id)).size;
    const durations = rows.filter((r) => r.duration_ms > 0).map((r) => r.duration_ms);
    const avg = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    const newVisitors = new Set(rows.filter((r) => r.is_new_visitor).map((r) => r.visitor_id));
    const returning = new Set(rows.map((r) => r.visitor_id).filter((v) => !newVisitors.has(v)));

    const group = (key: "source" | "device" | "path") => {
      const map = new Map<string, number>();
      rows.forEach((r) => map.set(r[key], (map.get(r[key]) ?? 0) + 1));
      return [...map.entries()].sort((a, b) => b[1] - a[1]);
    };

    const daily = new Map<string, { views: number; visitors: Set<string> }>();
    rows.forEach((r) => {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const entry = daily.get(key) ?? { views: 0, visitors: new Set<string>() };
      entry.views += 1;
      entry.visitors.add(r.visitor_id);
      daily.set(key, entry);
    });

    return {
      totalVisitors: new Set(totals.map((r) => r.visitor_id)).size,
      uniques,
      today: countSince(dayStart),
      week: countSince(now - 7 * 86400000),
      month: countSince(now - 30 * 86400000),
      pageViews: totals.length,
      rangeViews: rows.length,
      avg,
      newCount: newVisitors.size,
      returningCount: returning.size,
      sources: group("source").map(([k, v]) => ({ name: SOURCE_LABELS[k] ?? k, value: v })),
      devices: group("device").map(([k, v]) => ({ name: DEVICE_LABELS[k] ?? k, value: v })),
      topPages: group("path")
        .slice(0, 6)
        .map(([k, v]) => ({ name: PATH_LABELS[k] ?? k, value: v })),
      series: [...daily.entries()].map(([date, v]) => ({
        date: toPersianDigits(date.slice(5)),
        بازدید: v.views,
        بازدیدکننده: v.visitors.size,
      })),
    };
  }, [data]);

  const tooltipStyle = {
    background: "hsl(var(--card, 0 0% 100%))",
    border: "1px solid rgba(128,128,128,.3)",
    borderRadius: 12,
    fontSize: 12,
    color: "inherit",
  } as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-extrabold">آمار بازدید سایت</h2>
        <div className="flex-1" />
        <button
          onClick={() => void refetch()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-bold hover:bg-accent"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          به‌روزرسانی
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              range === r.key ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent"
            }`}
          >
            {r.label}
          </button>
        ))}
        {range === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-xs"
            />
            <span className="text-xs text-muted-foreground">تا</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-xs"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="p-6 text-center text-sm text-muted-foreground">در حال بارگذاری آمار…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="کل بازدیدکنندگان" value={fa(stats.totalVisitors)} icon={Users} />
            <StatCard label="بازدیدکنندگان یکتا (بازه)" value={fa(stats.uniques)} icon={Users} />
            <StatCard label="کل بازدید صفحات" value={fa(stats.pageViews)} icon={Eye} />
            <StatCard label="میانگین زمان حضور" value={faDuration(stats.avg)} icon={Clock} />
            <StatCard label="بازدید امروز" value={fa(stats.today)} icon={MousePointerClick} />
            <StatCard label="بازدید این هفته" value={fa(stats.week)} icon={MousePointerClick} />
            <StatCard label="بازدید این ماه" value={fa(stats.month)} icon={MousePointerClick} />
            <StatCard
              label="کاربران جدید / بازگشتی"
              value={`${fa(stats.newCount)} / ${fa(stats.returningCount)}`}
              icon={Users}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="روند بازدید در بازه انتخابی">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,.2)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="بازدید" stroke="#f5c518" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="بازدیدکننده" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="پربازدیدترین صفحات">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topPages}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,.2)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" name="بازدید" fill="#f5c518" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="منبع ورود کاربران">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.sources} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                    {stats.sources.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="نوع دستگاه کاربران">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.devices} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                    {stats.devices.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {stats.rangeViews === 0 && (
            <p className="surface-card p-6 text-center text-sm font-bold">
              هنوز بازدیدی در این بازه ثبت نشده است.
            </p>
          )}
        </>
      )}
    </div>
  );
}
