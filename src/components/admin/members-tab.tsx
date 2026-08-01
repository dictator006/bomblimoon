import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import type { ClubMember } from "@/lib/types";
import { AdminButton, inputClass } from "./ui";

export function MembersTab() {
  const [q, setQ] = useState("");

  const { data: members = [] } = useQuery({
    queryKey: ["admin", "members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_members")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ClubMember[];
    },
  });

  const visible = members.filter(
    (m) => m.full_name.includes(q.trim()) || m.mobile.includes(q.trim()),
  );

  function exportExcel() {
    const rows = visible.map((m) => ({
      "نام و نام خانوادگی": m.full_name,
      "شماره موبایل": m.mobile,
      "تاریخ تولد": m.birth_date ?? "",
      "تاریخ عضویت": new Date(m.created_at).toLocaleDateString("fa-IR"),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "اعضا");
    XLSX.writeFile(book, "bombelimoo-club-members.xlsx");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold">باشگاه مشتریان ({members.length})</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="جستجو بر اساس نام یا موبایل"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={inputClass + " w-56 pr-9"}
            />
          </div>
          <AdminButton onClick={exportExcel} disabled={visible.length === 0}>
            <Download className="h-4 w-4" />
            خروجی اکسل
          </AdminButton>
        </div>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="p-3 font-bold">نام</th>
              <th className="p-3 font-bold">موبایل</th>
              <th className="p-3 font-bold">تاریخ تولد</th>
              <th className="p-3 font-bold">عضویت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((m) => (
              <tr key={m.id}>
                <td className="p-3 font-semibold">{m.full_name}</td>
                <td className="p-3" dir="ltr">
                  {m.mobile}
                </td>
                <td className="p-3 text-muted-foreground">{m.birth_date ?? "—"}</td>
                <td className="p-3 text-muted-foreground">
                  {new Date(m.created_at).toLocaleDateString("fa-IR")}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  عضوی یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
