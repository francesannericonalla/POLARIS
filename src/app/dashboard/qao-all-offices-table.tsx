"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, Search, Download } from "lucide-react";

function exportToCSV(summaries: OfficeSummary[], schoolYear: string) {
  const headers = ["Office / Department", "Unit", "Filed", "Compliance %", "Status"];
  const rows = summaries.map((u) => {
    const pct = u.totalFolders > 0 ? Math.round((u.foldersThisYear / u.totalFolders) * 100) : 0;
    const status = u.totalFolders > 0 && u.foldersThisYear >= u.totalFolders ? "Filed" : u.foldersThisYear > 0 ? "Partial" : "Pending";
    return [
      `"${u.name.replace(/"/g, '""')}"`,
      u.branch === "academics" ? "Academics" : "Administration",
      u.foldersThisYear,
      `${pct}%`,
      status,
    ].join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `compliance-report-SY${schoolYear.replace(/\//g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type OfficeSummary = {
  id: string;
  name: string;
  branch: "academics" | "administration";
  foldersThisYear: number;
  totalFolders: number;
  lastUpdate: string | null;
};

function StatusBadge({ u }: { u: OfficeSummary }) {
  if (u.totalFolders > 0 && u.foldersThisYear >= u.totalFolders) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ color: "#15803d", background: "rgba(21,128,61,0.09)" }}>
        <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0 bg-green-500" />
        Filed
      </span>
    );
  }
  if (u.foldersThisYear > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ color: "#92400e", background: "rgba(217,119,6,0.09)" }}>
        <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0 bg-amber-400" />
        Partial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ color: "#9b1c1c", background: "rgba(239,68,68,0.08)" }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0 bg-red-400" />
      Pending
    </span>
  );
}

function statusOf(u: OfficeSummary): "filed" | "partial" | "pending" {
  if (u.totalFolders > 0 && u.foldersThisYear >= u.totalFolders) return "filed";
  if (u.foldersThisYear > 0) return "partial";
  return "pending";
}

const PAGE_SIZE = 5;

export function QAOAllOfficesTable({ summaries, schoolYear }: { summaries: OfficeSummary[]; schoolYear: string }) {
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState<"all" | "academics" | "administration">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "filed" | "partial" | "pending">("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return summaries.filter((u) => {
      if (search.trim() && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (unitFilter !== "all" && u.branch !== unitFilter) return false;
      if (statusFilter !== "all" && statusOf(u) !== statusFilter) return false;
      return true;
    });
  }, [summaries, search, unitFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="p-5">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          <input
            type="text"
            placeholder="Search office or department..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-8 pr-3 py-2 text-[13px] rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[rgba(122,19,48,0.15)] text-gray-700 placeholder-gray-400"
            style={{ borderColor: "#e5e7eb" }}
          />
        </div>

        {/* Unit filter */}
        <div className="relative">
          <select
            value={unitFilter}
            onChange={(e) => { setUnitFilter(e.target.value as typeof unitFilter); setPage(0); }}
            className="appearance-none pl-3.5 pr-7 py-2 text-[13px] font-medium rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[rgba(122,19,48,0.15)] text-gray-700 cursor-pointer"
            style={{ borderColor: "#e5e7eb" }}
          >
            <option value="all">All Units</option>
            <option value="academics">Academics</option>
            <option value="administration">Administration</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(0); }}
            className="appearance-none pl-3.5 pr-7 py-2 text-[13px] font-medium rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[rgba(122,19,48,0.15)] text-gray-700 cursor-pointer"
            style={{ borderColor: "#e5e7eb" }}
          >
            <option value="all">All Status</option>
            <option value="filed">Filed</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>

        {/* Export button */}
        <button
          onClick={() => exportToCSV(filtered, schoolYear)}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl border transition-colors hover:bg-[rgba(122,19,48,0.05)]"
          style={{ borderColor: "#7A1330", color: "#7A1330" }}
        >
          <Download size={14} />
          Export Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#e8eaed" }}>
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr style={{ background: "#fafbfc", borderBottom: "1px solid #f0f2f5" }}>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>Office / Department</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>Unit</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>Filed</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>Compliance</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>Status</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-gray-400">
                  No offices match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((u, i) => {
                const pct = u.totalFolders > 0 ? Math.round((u.foldersThisYear / u.totalFolders) * 100) : 0;
                const barColor = "#7A1330";
                return (
                  <tr
                    key={u.id}
                    className="group transition-colors hover:bg-[#fafbfc]"
                    style={i < paginated.length - 1 ? { borderBottom: "1px solid #f5f6f8" } : {}}
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <Link href={`/dashboard/office/${u.id}`} className="block">
                        <span className="text-[13px] font-medium text-gray-800 group-hover:text-[#7A1330] transition-colors leading-tight block">
                          {u.name}
                        </span>
                      </Link>
                    </td>

                    {/* Unit */}
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={
                          u.branch === "academics"
                            ? { color: "#7A1330", background: "rgba(122,19,48,0.07)" }
                            : { color: "#92400e", background: "rgba(217,119,6,0.09)" }
                        }
                      >
                        {u.branch === "academics" ? "Academics" : "Administration"}
                      </span>
                    </td>

                    {/* Filed */}
                    <td className="px-4 py-3.5 text-center tabular-nums">
                      <span className="text-[13px] font-semibold text-gray-800">{u.foldersThisYear}</span>
                      <span className="text-[12px] text-gray-300"> / {u.totalFolders}</span>
                    </td>

                    {/* Compliance bar + % */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#f0f2f5", minWidth: 60 }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: barColor }}
                          />
                        </div>
                        <span
                          className="text-[12px] font-semibold tabular-nums shrink-0 w-9 text-right"
                          style={{ color: pct === 0 ? "#9ca3af" : barColor }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge u={u} />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-center">
                      <Link
                        href={`/dashboard/office/${u.id}`}
                        className="inline-flex items-center gap-1 text-[12px] font-semibold transition-colors hover:opacity-70"
                        style={{ color: "#7A1330" }}
                      >
                        View
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3 px-1">
        <p className="text-[12px]" style={{ color: "#9ca3af" }}>
          Showing {filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE + PAGE_SIZE, filtered.length)} of {filtered.length} offices
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="px-3 py-1.5 text-[12px] font-medium rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            style={{ borderColor: "#e5e7eb", color: "#374151" }}
          >
            Prev
          </button>
          <span className="text-[12px] font-medium" style={{ color: "#6b7280" }}>
            {safePage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="px-3 py-1.5 text-[12px] font-medium rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            style={{ borderColor: "#e5e7eb", color: "#374151" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
