"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────

type FolderStatus = "filed" | "outdated" | "missing";

export type FolderItem = {
  id: string;
  name: string;
  totalCount: number;
  thisYearCount: number;
  status: FolderStatus;
  semesters: string[];
};

type Props = {
  folders: FolderItem[];
  unitId: string;
  sy: string;
  syOptions: string[];
};

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_META: Record<FolderStatus, { label: string; color: string; bg: string; dot: string }> = {
  filed:   { label: "Filed",    color: "#15803d", bg: "rgba(21,128,61,0.09)",   dot: "#16a34a" },
  outdated:{ label: "Outdated", color: "#92690e", bg: "rgba(201,168,76,0.12)",  dot: "#c9a84c" },
  missing: { label: "Missing",  color: "#86112F", bg: "rgba(134,17,47,0.09)",   dot: "#86112F" },
};

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconGrid({ active }: { active: boolean }) {
  return (
    <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.75}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconList({ active }: { active: boolean }) {
  return (
    <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg className="w-3.5 h-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function FolderSvgIcon({ status }: { status: FolderStatus }) {
  const filed = status === "filed";
  const color = filed ? "#16a34a" : "#86112F";
  const bg    = filed ? "rgba(21,128,61,0.09)" : "rgba(134,17,47,0.08)";
  return (
    <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    </span>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FolderStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-[3px] rounded-full whitespace-nowrap"
      style={{ color: m.color, background: m.bg }}
    >
      <span className="w-[5px] h-[5px] rounded-full inline-block shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

// ── Styled select ──────────────────────────────────────────────────────────────

function StyledSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3.5 pr-8 h-10 text-[13px] font-medium rounded-xl border cursor-pointer focus:outline-none"
        style={{ color: "#202938", background: "#fff", borderColor: "#E2E5EC", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        {children}
      </select>
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9ca3af" }}>
        <IconChevronDown />
      </span>
    </div>
  );
}

// ── Grid card ─────────────────────────────────────────────────────────────────

function GridCard({ folder, unitId }: { folder: FolderItem; unitId: string }) {
  return (
    <Link
      href={`/repository/${unitId}/${folder.id}`}
      className="group flex items-center gap-4 bg-white rounded-2xl px-5 py-4 transition-all duration-150 hover:shadow-md"
      style={{ border: "1px solid #E8EAF0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <FolderSvgIcon status={folder.status} />
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold leading-snug truncate" style={{ color: "#202938" }}>{folder.name}</p>
        <p className="text-[12px] mt-0.5" style={{ color: "#9ca3af" }}>
          {folder.totalCount} {folder.totalCount === 1 ? "file" : "files"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={folder.status} />
        <span className="transition-transform duration-150 group-hover:translate-x-0.5" style={{ color: "#C4C9D4" }}>
          <IconChevron />
        </span>
      </div>
    </Link>
  );
}

// ── List row ───────────────────────────────────────────────────────────────────

function ListRow({ folder, unitId, isLast }: { folder: FolderItem; unitId: string; isLast: boolean }) {
  return (
    <Link
      href={`/repository/${unitId}/${folder.id}`}
      className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#FAFBFC]"
      style={isLast ? {} : { borderBottom: "1px solid #F0F2F5" }}
    >
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: folder.status === "filed" ? "rgba(21,128,61,0.08)" : "rgba(134,17,47,0.07)" }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={folder.status === "filed" ? "#16a34a" : "#86112F"} strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
      </span>
      <p className="flex-1 text-[13px] font-medium truncate group-hover:text-[#79132F] transition-colors" style={{ color: "#202938" }}>
        {folder.name}
      </p>
      <span className="hidden sm:block text-[12.5px] tabular-nums w-20 text-center" style={{ color: "#788397" }}>
        {folder.totalCount} {folder.totalCount === 1 ? "file" : "files"}
      </span>
      <span className="shrink-0"><StatusBadge status={folder.status} /></span>
      <span className="hidden sm:flex items-center gap-1 text-[12px] font-semibold shrink-0" style={{ color: "#79132F" }}>
        View <IconChevron />
      </span>
    </Link>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <span className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(134,17,47,0.07)" }}>
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#86112F" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
      </span>
      <p className="text-[14px] font-semibold mb-1" style={{ color: "#202938" }}>No folders found</p>
      <p className="text-[13px]" style={{ color: "#788397" }}>{message}</p>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export function RepositoryClientView({ folders, unitId, sy, syOptions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let r = folders;
    const q = search.trim().toLowerCase();
    if (q) r = r.filter((f) => f.name.toLowerCase().includes(q));
    if (statusFilter !== "all") r = r.filter((f) => f.status === statusFilter);
    if (semesterFilter !== "all") r = r.filter((f) => f.semesters.includes(semesterFilter));
    return r;
  }, [folders, search, statusFilter, semesterFilter]);

  const emptyMessage =
    (search || statusFilter !== "all" || semesterFilter !== "all")
      ? "Try adjusting your search or filters."
      : "No folders are configured for this office yet.";

  return (
    <div className="space-y-5">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[480px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#A0A8B4" }}>
            <IconSearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search folders..."
            className="w-full h-10 pl-10 pr-4 text-[13px] rounded-xl border focus:outline-none"
            style={{ color: "#202938", borderColor: "#E2E5EC", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          />
        </div>

        {/* Filter label + dropdowns */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium hidden sm:block" style={{ color: "#788397" }}>Filter:</span>
          <StyledSelect value={statusFilter} onChange={setStatusFilter}>
            <option value="all">All Statuses</option>
            <option value="filed">Filed</option>
            <option value="outdated">Outdated</option>
            <option value="missing">Missing</option>
          </StyledSelect>
          <StyledSelect value={semesterFilter} onChange={setSemesterFilter}>
            <option value="all">All Semesters</option>
            <option value="1st Semester">First Semester</option>
            <option value="2nd Semester">Second Semester</option>
            <option value="Summer">Summer</option>
          </StyledSelect>
          <StyledSelect value={sy} onChange={(v) => router.push(`${pathname}?sy=${v}`)}>
            {syOptions.map((y) => (
              <option key={y} value={y}>SY {y}</option>
            ))}
          </StyledSelect>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Grid / List toggle */}
        <div
          className="flex items-center rounded-xl overflow-hidden h-10"
          style={{ border: "1px solid #E2E5EC", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
        >
          <button
            onClick={() => setView("grid")}
            title="Grid view"
            className="flex items-center justify-center w-10 h-full transition-colors"
            style={view === "grid" ? { background: "#79132F", color: "#fff" } : { background: "#fff", color: "#9ca3af" }}
          >
            <IconGrid active={view === "grid"} />
          </button>
          <button
            onClick={() => setView("list")}
            title="List view"
            className="flex items-center justify-center w-10 h-full transition-colors"
            style={view === "list" ? { background: "#79132F", color: "#fff" } : { background: "#fff", color: "#9ca3af" }}
          >
            <IconList active={view === "list"} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white" style={{ border: "1px solid #E8EAF0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <EmptyState message={emptyMessage} />
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((f) => <GridCard key={f.id} folder={f} unitId={unitId} />)}
        </div>
      ) : (
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid #E8EAF0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div
            className="hidden sm:grid px-5 py-3"
            style={{ gridTemplateColumns: "1fr 100px 130px 90px", gap: "1rem", background: "#FAFBFC", borderBottom: "1px solid #F0F2F5" }}
          >
            {["Folder", "Documents", "Status", "Action"].map((col) => (
              <span key={col} className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#A0A8B4" }}>{col}</span>
            ))}
          </div>
          {filtered.map((f, i) => (
            <ListRow key={f.id} folder={f} unitId={unitId} isLast={i === filtered.length - 1} />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-[12px] text-center pb-2" style={{ color: "#C4C9D4" }}>
          {filtered.length} of {folders.length} folder{folders.length !== 1 ? "s" : ""} · SY {sy}
        </p>
      )}
    </div>
  );
}
