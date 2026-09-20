"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const SEMESTERS = ["1st", "2nd", "Summer"];

function buildYears(): string[] {
  const now = new Date();
  const currentYearStart = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: 4 }, (_, i) => {
    const y = currentYearStart - i;
    return `${y}-${y + 1}`;
  });
}

export function OfficeDashboardFilterBar({ sy, sem }: { sy: string; sem: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  const years = buildYears();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <select
        value={sy}
        onChange={(e) => update("sy", e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 text-gray-700"
      >
        <option value="">All school years</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select
        value={sem}
        onChange={(e) => update("sem", e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 text-gray-700"
      >
        <option value="">All semesters</option>
        {SEMESTERS.map((s) => (
          <option key={s} value={s}>{s} semester</option>
        ))}
      </select>
    </div>
  );
}
