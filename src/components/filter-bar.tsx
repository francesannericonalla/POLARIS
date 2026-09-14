"use client";

import { useRouter } from "next/navigation";

const SELECT_CLS =
  "text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold";

export function FilterBar({
  unitId,
  folderId,
  schoolYears,
  sy,
  sem,
  show,
}: {
  unitId: string;
  folderId: string;
  schoolYears: string[];
  sy?: string;
  sem?: string;
  show?: string;
}) {
  const router = useRouter();

  function navigate(next: { sy?: string; sem?: string; show?: string }) {
    const params = new URLSearchParams();
    if (next.sy) params.set("sy", next.sy);
    if (next.sem) params.set("sem", next.sem);
    if (next.show && next.show !== "active") params.set("show", next.show);
    const qs = params.toString();
    router.push(`/repository/${unitId}/${folderId}${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-xs text-gray-400 mr-1">Filter:</span>
      <select
        className={SELECT_CLS}
        value={sy ?? ""}
        onChange={(e) => navigate({ sy: e.target.value, sem, show })}
      >
        <option value="">All Years</option>
        {schoolYears.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <select
        className={SELECT_CLS}
        value={sem ?? ""}
        onChange={(e) => navigate({ sy, sem: e.target.value, show })}
      >
        <option value="">All Semesters</option>
        <option value="1st">1st Sem</option>
        <option value="2nd">2nd Sem</option>
        <option value="Summer">Summer</option>
        <option value="N/A">Full Year</option>
      </select>
      <select
        className={SELECT_CLS}
        value={show ?? "active"}
        onChange={(e) => navigate({ sy, sem, show: e.target.value })}
      >
        <option value="active">Active</option>
        <option value="archived">Archived</option>
        <option value="all">All</option>
      </select>
    </div>
  );
}
