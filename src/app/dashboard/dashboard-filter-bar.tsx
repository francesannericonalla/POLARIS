"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function DashboardFilterBar({
  sy,
  branch,
  search,
  syOptions,
}: {
  sy: string;
  branch: string;
  search: string;
  syOptions: string[];
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
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search units…"
          defaultValue={search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 text-gray-700 w-52"
        />
      </div>

      {/* Branch tabs */}
      <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm">
        {[["", "All"], ["academics", "Academics"], ["administration", "Administration"]].map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => update({ branch: val })}
            className={`px-3 py-1.5 font-medium transition-colors ${branch === val ? "bg-maroon text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SY dropdown */}
      <select
        value={sy}
        onChange={(e) => update({ sy: e.target.value })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 text-gray-700 font-medium"
      >
        {syOptions.map((y) => (
          <option key={y} value={y}>{`SY ${y}`}</option>
        ))}
      </select>
    </div>
  );
}
