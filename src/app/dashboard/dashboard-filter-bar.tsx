"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function DashboardFilterBar({
  sy,
  branch,
  search,
  syOptions,
  hideSearch,
}: {
  sy: string;
  branch: string;
  search: string;
  syOptions: string[];
  hideSearch?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(updates: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Search */}
      {!hideSearch && (
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--ou-muted, #94a3b8)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search office or department..."
            defaultValue={search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-8 pr-3 py-2 text-[13px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(122,19,48,0.15)] w-56 placeholder-[color:var(--ou-muted,#94a3b8)]"
            style={{
              background: "var(--ou-input-bg, #fff)",
              borderColor: "var(--ou-input-border, #e5e7eb)",
              color: "var(--ou-heading, #334155)",
            }}
          />
        </div>
      )}

      {/* Branch segmented control */}
      <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: "var(--ou-input-border, #e5e7eb)", background: "var(--ou-input-bg, #fff)" }}>
        {([["", "All"], ["academics", "Academics"], ["administration", "Administration"]] as [string, string][]).map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => update({ branch: val })}
            className="px-3.5 py-2 text-[13px] font-semibold transition-colors"
            style={
              branch === val
                ? { background: "#7A1330", color: "#fff" }
                : { color: "var(--ou-subtext, #64748b)" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* SY dropdown */}
      <div className="relative">
        <select
          value={sy}
          onChange={(e) => update({ sy: e.target.value })}
          className="appearance-none pl-3.5 pr-8 py-2 text-[13px] font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(122,19,48,0.15)]"
          style={{
            background: "var(--ou-input-bg, #fff)",
            borderColor: "var(--ou-input-border, #e5e7eb)",
            color: "var(--ou-heading, #334155)",
          }}
        >
          {syOptions.map((y) => (
            <option key={y} value={y}>{`SY ${y}`}</option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ou-muted, #94a3b8)" }} />
      </div>
    </div>
  );
}
