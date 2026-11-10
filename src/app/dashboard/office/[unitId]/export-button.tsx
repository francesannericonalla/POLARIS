"use client";

import { Download } from "lucide-react";

type FolderRow = { name: string; thisYearCount: number; activeDocumentCount: number };

export function ExportOfficeButton({
  unitName,
  schoolYear,
  folders,
}: {
  unitName: string;
  schoolYear: string;
  folders: FolderRow[];
}) {
  function handleExport() {
    const headers = ["Folder", "Documents (This SY)", "Status"];
    const rows = folders.map((f) => {
      const status = f.thisYearCount > 0 ? "Filed" : f.activeDocumentCount > 0 ? "Outdated" : "Missing";
      return [`"${f.name.replace(/"/g, '""')}"`, f.thisYearCount, status].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${unitName.replace(/[^a-z0-9]/gi, "-")}-SY${schoolYear.replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border transition-colors hover:bg-[rgba(122,19,48,0.05)]"
      style={{ borderColor: "#7A1330", color: "#7A1330" }}
    >
      <Download size={14} />
      Export Excel
    </button>
  );
}
