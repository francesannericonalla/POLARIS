"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { fetchPendingOffices } from "./actions";
import type { PendingOffice } from "@/lib/data/dashboard";
import type { FolderSubmissionStat } from "@/lib/data/dashboard";

interface DrawerState {
  folderName: string;
  branch: "academics" | "administration";
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="3" x2="13" y2="13" />
      <line x1="13" y1="3" x2="3" y2="13" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}

// ── Drawer panel ─────────────────────────────────────────────────────────────

function PendingDrawer({
  open,
  drawer,
  schoolYear,
  submittedCount,
  totalCount,
  onClose,
}: {
  open: boolean;
  drawer: DrawerState | null;
  schoolYear: string;
  submittedCount: number;
  totalCount: number;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [offices, setOffices] = useState<PendingOffice[]>([]);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const prevDrawer = useRef<DrawerState | null>(null);

  useEffect(() => {
    if (!open || !drawer) return;
    // Only re-fetch if the drawer target changed
    if (
      prevDrawer.current?.folderName === drawer.folderName &&
      prevDrawer.current?.branch === drawer.branch
    ) return;
    prevDrawer.current = drawer;
    setOffices([]);
    setSearch("");
    startTransition(async () => {
      const result = await fetchPendingOffices(drawer.folderName, drawer.branch, schoolYear);
      setOffices(result);
    });
  }, [open, drawer, schoolYear]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 180);
    else setSearch("");
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = search.trim()
    ? offices.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
    : offices;

  const pendingCount = totalCount - submittedCount;
  const accentColor = drawer?.branch === "academics" ? "#7A1330" : "#B8892B";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{
          background: "rgba(0,0,0,0.18)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-2xl transition-transform duration-250 ease-in-out"
        style={{
          width: 340,
          transform: open ? "translateX(0)" : "translateX(100%)",
          borderLeft: "1px solid #e5e7eb",
        }}
        aria-modal="true"
        role="dialog"
        aria-label={drawer ? `Pending offices for ${drawer.folderName}` : "Pending offices"}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor }}>
                {drawer?.branch === "academics" ? "Academics" : "Administration"}
              </p>
              <h2 className="text-sm font-semibold text-gray-800 leading-snug truncate">
                {drawer?.folderName ?? ""}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="mt-0.5 shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>

          {/* Summary pill row */}
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full bg-red-50 text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {pending ? "…" : pendingCount} not submitted
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
              <CheckIcon />
              {submittedCount} filed · SY {schoolYear}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-50 shrink-0">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search offices…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder-gray-400 text-gray-700"
            style={{ "--tw-ring-color": accentColor + "40" } as React.CSSProperties}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {pending ? (
            <div className="flex flex-col gap-2 pt-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {search ? (
                <>
                  <p className="text-sm font-medium text-gray-500">No match for "{search}"</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different name</p>
                </>
              ) : (
                <>
                  <span className="text-2xl mb-2">🎉</span>
                  <p className="text-sm font-medium text-gray-600">All offices have submitted!</p>
                  <p className="text-xs text-gray-400 mt-1">Nothing pending for this folder.</p>
                </>
              )}
            </div>
          ) : (
            <ul className="space-y-1">
              {filtered.map((office) => (
                <li
                  key={office.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: accentColor, opacity: 0.5 }}
                  />
                  <span className="text-xs text-gray-700 leading-snug flex-1 min-w-0">{office.name}</span>
                  <span className="text-[10px] text-gray-400 shrink-0 capitalize">{office.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer count */}
        {!pending && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 shrink-0">
            <p className="text-[11px] text-gray-400">
              {search ? `${filtered.length} of ${offices.length} shown` : `${offices.length} pending`}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ── Public wrapper used by FolderCoveragePanel ────────────────────────────────

export function FolderCoverageWithDrawer({
  title,
  subtitle,
  stats,
  accentColor,
  accentHex,
  schoolYear,
}: {
  title: string;
  subtitle: string;
  stats: FolderSubmissionStat[];
  accentColor: string;
  accentHex: string;
  schoolYear: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<DrawerState | null>(null);
  const [activeStat, setActiveStat] = useState<FolderSubmissionStat | null>(null);

  const branch = stats[0]?.branch ?? "academics";

  function openDrawer(stat: FolderSubmissionStat) {
    setActiveStat(stat);
    setActiveDrawer({ folderName: stat.folder_name, branch: stat.branch });
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full shrink-0 ${accentColor}`} />
          <div>
            <span className="text-sm font-semibold text-gray-800">{title}</span>
            <span className="ml-2 text-xs text-gray-400">{subtitle}</span>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3.5">
          {stats.map((s) => {
            const pct = s.total > 0 ? Math.round((s.submitted / s.total) * 100) : 0;
            const barColor = pct >= 80 ? "#16a34a" : pct >= 50 ? "#B8892B" : pct > 0 ? "#ef4444" : "#e5e7eb";
            const pendingCount = s.total - s.submitted;
            return (
              <button
                key={s.folder_name}
                onClick={() => openDrawer(s)}
                className="w-full text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded-lg px-2 py-1.5 -mx-2 hover:bg-black/[0.03] transition-colors"
                style={{ "--tw-ring-color": accentHex + "60" } as React.CSSProperties}
                title={`${pendingCount} office${pendingCount !== 1 ? "s" : ""} pending — click to view`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-700 truncate mr-2 group-hover:text-gray-900 transition-colors">
                    {s.folder_name}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span
                      className="text-xs font-semibold tabular-nums transition-colors"
                      style={{ color: pct === 0 ? "#9ca3af" : barColor }}
                    >
                      {s.submitted}
                      <span className="font-normal text-gray-300"> / {s.total}</span>
                    </span>
                    <svg
                      width="10" height="10" viewBox="0 0 10 10" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                      className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-150"
                    >
                      <polyline points="3,2 7,5 3,8" />
                    </svg>
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: barColor }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <PendingDrawer
        open={drawerOpen}
        drawer={activeDrawer}
        schoolYear={schoolYear}
        submittedCount={activeStat?.submitted ?? 0}
        totalCount={activeStat?.total ?? 0}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
