"use client";

import { useState } from "react";
import Link from "next/link";
import type { FolderStat } from "@/lib/data/dashboard";

const PAGE_SIZE = 5;

export function FolderBreakdownTable({
  folderStats,
  unitId,
  displaySY,
  sem,
}: {
  folderStats: FolderStat[];
  unitId: string;
  displaySY: string;
  sem?: string;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(folderStats.length / PAGE_SIZE);
  const paginated = folderStats.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--ou-card-bg)", border: "1px solid var(--ou-card-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--ou-divider)" }}>
        <h2 className="text-[15px] font-bold" style={{ color: "var(--ou-accent)" }}>Folder Breakdown</h2>
        <p className="text-[12px] mt-0.5" style={{ color: "var(--ou-subtext)" }}>
          Submission status of all required folders · SY {displaySY}{sem ? ` · ${sem} Semester` : ""}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--ou-divider)" }}>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ou-muted)" }}>Folder</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ou-muted)" }}>Documents (This SY)</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ou-muted)" }}>Status</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ou-muted)" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((f) => {
              const status = f.thisYearCount > 0 ? "filed" : f.activeDocumentCount > 0 ? "outdated" : "missing";
              return (
                <tr key={f.id} className="ou-table-row transition-colors" style={{ borderBottom: "1px solid var(--ou-divider)" }}>
                  <td className="px-6 py-4 text-[13px] font-medium" style={{ color: "var(--ou-heading)" }}>{f.name}</td>
                  <td className="px-4 py-4 text-center text-[13px]" style={{ color: "var(--ou-heading)" }}>{f.thisYearCount}</td>
                  <td className="px-4 py-4">
                    {status === "filed" ? (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(21,128,61,0.1)", color: "#15803d" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block shrink-0" />Filed
                      </span>
                    ) : status === "outdated" ? (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(201,168,76,0.12)", color: "#92690e" }}>
                        <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: "#c9a84c" }} />Outdated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(121,19,47,0.08)", color: "var(--ou-accent)" }}>
                        <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: "var(--ou-accent)" }} />Missing
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/repository/${unitId}/${f.id}`}
                      className="inline-flex items-center gap-1 text-[13px] font-semibold transition-opacity hover:opacity-70"
                      style={{ color: "var(--ou-accent)" }}
                    >
                      View
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--ou-divider)" }}>
          <span className="text-[11px]" style={{ color: "var(--ou-muted)" }}>
            {page * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE + PAGE_SIZE, folderStats.length)} of {folderStats.length} folders
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-[11px] font-semibold px-3 py-1 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--ou-divider)", color: "var(--ou-subtext)" }}
            >
              Prev
            </button>
            <span className="text-[11px]" style={{ color: "var(--ou-muted)" }}>{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="text-[11px] font-semibold px-3 py-1 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--ou-divider)", color: "var(--ou-subtext)" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
