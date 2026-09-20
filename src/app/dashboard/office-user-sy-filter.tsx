"use client";

import { useRouter, usePathname } from "next/navigation";

export function OfficeUserSYFilter({ sy, syOptions }: { sy: string; syOptions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={sy}
      onChange={(e) => router.push(`${pathname}?sy=${e.target.value}`)}
      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 text-gray-700"
    >
      {syOptions.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  );
}
