"use client";

import { useEffect, useState } from "react";

export type CollegeRow = {
  id: string;
  name: string;
  filed: number;
  total: number;
  departments: {
    id: string;
    name: string;
    foldersThisYear: number;
    totalFolders: number;
  }[];
};

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="3" x2="13" y2="13" />
      <line x1="13" y1="3" x2="3" y2="13" />
    </svg>
  );
}

function CollegeDrawer({
  college,
  open,
  onClose,
  schoolYear,
}: {
  college: CollegeRow | null;
  open: boolean;
  onClose: () => void;
  schoolYear: string;
}) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!college) return null;

  const pending = college.departments.filter(
    (d) => !(d.totalFolders > 0 && d.foldersThisYear >= d.totalFolders)
  );
  const partial = pending.filter((d) => d.foldersThisYear > 0);
  const none = pending.filter((d) => d.foldersThisYear === 0);

  const filtered = search.trim()
    ? pending.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
    : pending;

  const filteredPartial = filtered.filter((d) => d.foldersThisYear > 0);
  const filteredNone = filtered.filter((d) => d.foldersThisYear === 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{ background: "rgba(0,0,0,0.18)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-2xl transition-transform duration-250 ease-in-out"
        style={{
          width: 360,
          transform: open ? "translateX(0)" : "translateX(100%)",
          borderLeft: "1px solid #e5e7eb",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-maroon mb-1">Academics</p>
              <h2 className="text-sm font-semibold text-gray-800 leading-snug">{college.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="mt-0.5 shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              {college.filed} fully filed
            </span>
            {partial.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                {partial.length} partial
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full bg-red-50 text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {none.length} not started
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-50 shrink-0">
          <input
            type="text"
            placeholder="Search programs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-maroon/20 placeholder-gray-400 text-gray-700"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {search ? (
                <p className="text-sm text-gray-400">No match for "{search}"</p>
              ) : (
                <>
                  <span className="text-2xl mb-2">🎉</span>
                  <p className="text-sm font-medium text-gray-600">All programs fully filed!</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Partial — started but not done */}
              {filteredPartial.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 mb-2">Partial</p>
                  <ul className="space-y-1">
                    {filteredPartial.map((d) => (
                      <li key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span className="text-xs text-gray-700 flex-1 min-w-0 truncate">{d.name}</span>
                        <span className="text-xs tabular-nums shrink-0">
                          <span className="font-semibold text-gray-700">{d.foldersThisYear}</span>
                          <span className="text-gray-300"> / {d.totalFolders}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Not started */}
              {filteredNone.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400 mb-2">Not Started</p>
                  <ul className="space-y-1">
                    {filteredNone.map((d) => (
                      <li key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-300 shrink-0" />
                        <span className="text-xs text-gray-500 flex-1 min-w-0 truncate">{d.name}</span>
                        <span className="text-[10px] text-gray-300 shrink-0">0 / {d.totalFolders}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {pending.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 shrink-0">
            <p className="text-[11px] text-gray-400">
              SY {schoolYear} · {pending.length} program{pending.length !== 1 ? "s" : ""} incomplete
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export function CollegeComplianceList({
  collegeRows,
  schoolYear,
}: {
  collegeRows: CollegeRow[];
  schoolYear: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<CollegeRow | null>(null);

  function openDrawer(c: CollegeRow) {
    setActive(c);
    setOpen(true);
  }

  return (
    <>
      <div className="space-y-2">
        {collegeRows.map((c) => {
          const pct = c.total > 0 ? Math.round((c.filed / c.total) * 100) : 0;
          const dotColor = pct === 100 ? "#16a34a" : pct >= 50 ? "#B8892B" : pct > 0 ? "#ef4444" : "#d1d5db";
          const pending = c.total - c.filed;
          return (
            <button
              key={c.id}
              onClick={() => openDrawer(c)}
              className="w-full flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-black/[0.03] transition-colors group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon/30"
              title={`${pending} program${pending !== 1 ? "s" : ""} incomplete — click to view`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors" style={{ background: dotColor }} />
              <span className="text-xs text-gray-700 flex-1 min-w-0 truncate group-hover:text-gray-900 transition-colors">{c.name}</span>
              <span className="flex items-center gap-1 shrink-0">
                <span className="text-xs tabular-nums">
                  <span className="font-semibold text-gray-800">{c.filed}</span>
                  <span className="text-gray-300"> / {c.total}</span>
                </span>
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150"
                >
                  <polyline points="3,2 7,5 3,8" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      <CollegeDrawer
        college={active}
        open={open}
        onClose={() => setOpen(false)}
        schoolYear={schoolYear}
      />
    </>
  );
}
