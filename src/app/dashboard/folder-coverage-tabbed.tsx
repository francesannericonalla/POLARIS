"use client";

import { useState } from "react";
import type { FolderSubmissionStat } from "@/lib/data/dashboard";
import { FolderCoverageWithDrawer } from "./folder-coverage-drawer";

export function FolderCoverageTabbed({
  academicsStats,
  adminStats,
  schoolYear,
}: {
  academicsStats: FolderSubmissionStat[];
  adminStats: FolderSubmissionStat[];
  schoolYear: string;
}) {
  const [tab, setTab] = useState<"academics" | "administration">("academics");

  const hasAcademics = academicsStats.length > 0;
  const hasAdmin = adminStats.length > 0;

  const activeStats = tab === "academics" ? academicsStats : adminStats;
  const hasData = tab === "academics" ? hasAcademics : hasAdmin;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ borderBottom: "1px solid #f1f5f9" }}>
        {hasAcademics && (
          <button
            onClick={() => setTab("academics")}
            className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors"
            style={
              tab === "academics"
                ? { background: "#7A1330", color: "#fff" }
                : { color: "#64748b" }
            }
          >
            Academics
          </button>
        )}
        {hasAdmin && (
          <button
            onClick={() => setTab("administration")}
            className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors"
            style={
              tab === "administration"
                ? { background: "#7A1330", color: "#fff" }
                : { color: "#64748b" }
            }
          >
            Administration
          </button>
        )}
        <span className="ml-auto text-[12px] text-slate-400">
          {tab === "academics"
            ? `${academicsStats[0]?.total ?? 0} departments`
            : `${adminStats[0]?.total ?? 0} offices`}
        </span>
      </div>

      {/* Folder rows */}
      {hasData ? (
        <div className="flex-1 min-h-0">
        <FolderCoverageWithDrawer
          title=""
          subtitle=""
          stats={activeStats}
          accentColor=""
          accentHex={tab === "academics" ? "#7A1330" : "#B8892B"}
          schoolYear={schoolYear}
          compact
        />
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-10">No data available.</p>
      )}
    </div>
  );
}
