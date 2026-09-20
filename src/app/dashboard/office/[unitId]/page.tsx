import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { isQao } from "@/lib/permissions";
import { getUnitById, getAllUnits } from "@/lib/data/units";
import {
  getUnitFolderStatsByFilter,
  getRecentActivity,
  currentSchoolYear,
  type FolderStat,
  type RecentActivityItem,
} from "@/lib/data/dashboard";
import { AppShell } from "@/components/app-shell";
import { OfficeDashboardFilterBar } from "./filter-bar";
import { daysSince } from "@/lib/date-utils";

export default async function OfficeDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ unitId: string }>;
  searchParams: Promise<{ sy?: string; sem?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (!isQao(profile)) redirect("/dashboard");

  const { unitId } = await params;
  const { sy, sem } = await searchParams;

  const unit = await getUnitById(unitId);
  if (!unit || unit.type === "college") redirect("/dashboard");

  const [folderStats, recentActivity, allUnits] = await Promise.all([
    getUnitFolderStatsByFilter(unitId, {
      schoolYear: sy || undefined,
      semester: sem || undefined,
    }),
    getRecentActivity(unitId, 6),
    getAllUnits(),
  ]);

  const currentSY = currentSchoolYear();
  const displaySY = sy || currentSY;

  const totalDocs = folderStats.reduce((s, f) => s + f.activeDocumentCount, 0);
  const thisYearDocs = folderStats.reduce((s, f) => s + f.thisYearCount, 0);
  const foldersWithDocs = folderStats.filter((f) => f.activeDocumentCount > 0).length;
  const foldersSubmittedThisSY = folderStats.filter((f) => f.thisYearCount > 0).length;

  // "Complete" = has at least 1 doc this SY; "In progress" = has docs overall but not this SY; "No files" = nothing
  const completeFolders = folderStats.filter((f) => f.thisYearCount > 0).length;
  const submissionRate = folderStats.length > 0 ? Math.round((completeFolders / folderStats.length) * 100) : 0;

  const lastUpload = folderStats.reduce((latest, f) => {
    if (!f.lastUpdate) return latest;
    if (!latest) return f.lastUpdate;
    return f.lastUpdate > latest ? f.lastUpdate : latest;
  }, null as string | null);

  const branchLabel = unit.branch === "academics" ? "Academics" : "Administration";
  const parentUnit = unit.parent_id ? allUnits.find((u) => u.id === unit.parent_id) : null;
  const collegeLabel = parentUnit?.name ?? branchLabel;

  return (
    <AppShell profile={profile} title="Office Dashboard" activeUnitId={unitId}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Link href="/dashboard" className="hover:text-maroon transition-colors">University Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">{branchLabel}</span>
            <span>/</span>
            <span className="text-gray-500 font-medium">{unit.name}</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{unit.name}</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {unit.branch === "academics" ? `Department dashboard · ${collegeLabel}` : "Office dashboard · Administration"}
              </p>
            </div>
            <Link
              href={`/repository/${unitId}`}
              className="shrink-0 text-xs font-medium text-maroon border border-maroon/30 hover:bg-maroon/5 rounded-lg px-3 py-1.5 transition-colors"
            >
              View Repository →
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-9 w-64 bg-gray-100 rounded-lg animate-pulse" />}>
          <OfficeDashboardFilterBar sy={sy ?? ""} sem={sem ?? ""} />
        </Suspense>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Documents */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total Documents</span>
              <div className="w-7 h-7 rounded-lg bg-maroon/10 flex items-center justify-center text-maroon">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">{totalDocs}</div>
            <p className="text-xs text-gray-400 mt-1">
              {sy ? `Filtered: SY ${sy}` : `Since SY 2024-2025`}
            </p>
          </div>

          {/* This School Year */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">This School Year</span>
              <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center" style={{ color: "#c9a84c" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">{thisYearDocs}</div>
            <p className="text-xs text-gray-400 mt-1">
              {lastUpload
                ? `Last upload ${daysSince(lastUpload)}`
                : "No uploads yet this SY"}
            </p>
          </div>

          {/* Folders Complete */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Folders Complete</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                submissionRate === 100 ? "bg-green-50 text-green-600" :
                submissionRate >= 50 ? "bg-gold/10 text-gold" :
                "bg-red-50 text-red-500"
              }`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h3.586a1 1 0 01.707.293L11 7h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {foldersSubmittedThisSY}
              <span className="text-lg font-normal text-gray-400">/{folderStats.length}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {folderStats.length - foldersSubmittedThisSY > 0
                ? `${folderStats.length - foldersSubmittedThisSY} folder${folderStats.length - foldersSubmittedThisSY > 1 ? "s" : ""} still awaiting`
                : "All folders submitted"}
            </p>
          </div>
        </div>

        {/* Two-column layout: submission status + recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Folder Submission Status — wider */}
          <div className="lg:col-span-3 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Folder Submission Status</h2>
              <span className="text-xs text-gray-400">{displaySY}</span>
            </div>

            {folderStats.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No folders configured for this unit.</p>
            ) : (
              <div className="space-y-4">
                {folderStats.map((f) => (
                  <FolderProgressRow key={f.id} folder={f} unitId={unitId} displaySY={displaySY} />
                ))}
              </div>
            )}

            {folderStats.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />Complete</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#c9a84c" }} />In progress</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" />No files</span>
                </div>
                <div className="text-xs font-semibold" style={{ color: submissionRate === 100 ? "#16a34a" : submissionRate >= 50 ? "#c9a84c" : "#ef4444" }}>
                  {submissionRate}% complete
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity — narrower */}
          <div className="lg:col-span-2 card p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Recent Activity</h2>

            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))}
              </div>
            )}

            {recentActivity.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Link
                  href={`/repository/${unitId}`}
                  className="text-xs text-maroon hover:underline font-medium"
                >
                  View all in repository →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Folder detail table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Document Breakdown by Folder</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Folder</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">This SY</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">All-Time</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Last Upload</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {folderStats.map((f) => {
                const status = f.thisYearCount > 0 ? "complete" : f.activeDocumentCount > 0 ? "in-progress" : "no-files";
                return (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-maroon/[0.02] transition-colors group">
                    <td className="px-5 py-3">
                      <Link href={`/repository/${unitId}/${f.id}`} className="text-maroon font-medium hover:underline">
                        {f.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-700">{f.thisYearCount}</td>
                    <td className="px-5 py-3 text-gray-400">{f.activeDocumentCount}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {f.lastUpdate ? daysSince(f.lastUpdate) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </AppShell>
  );
}

function FolderProgressRow({ folder, unitId, displaySY }: { folder: FolderStat; unitId: string; displaySY: string }) {
  const status = folder.thisYearCount > 0 ? "complete" : folder.activeDocumentCount > 0 ? "in-progress" : "no-files";
  const fillColor = status === "complete" ? "#22c55e" : status === "in-progress" ? "#c9a84c" : "#e5e7eb";
  // Relative fill: if no docs at all, empty. If has this-year docs, show proportional to all-time (min 8% for visibility)
  const fillPct = status === "no-files" ? 0 : status === "complete"
    ? Math.max(8, folder.activeDocumentCount > 0 ? (folder.thisYearCount / folder.activeDocumentCount) * 100 : 100)
    : Math.max(8, folder.activeDocumentCount > 0 ? 30 : 8);

  return (
    <Link href={`/repository/${unitId}/${folder.id}`} className="block group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-700 font-medium group-hover:text-maroon transition-colors truncate flex-1 mr-2">
          {folder.name}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">
            {folder.thisYearCount > 0
              ? `${folder.thisYearCount} of ${folder.activeDocumentCount} document${folder.activeDocumentCount !== 1 ? "s" : ""} filed`
              : folder.activeDocumentCount > 0
              ? `${folder.activeDocumentCount} doc${folder.activeDocumentCount !== 1 ? "s" : ""} — not this SY`
              : "No documents filed"}
          </span>
          <StatusPill status={status} compact />
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${fillPct}%`, background: fillColor }}
        />
      </div>
    </Link>
  );
}

function StatusPill({ status, compact = false }: { status: "complete" | "in-progress" | "no-files"; compact?: boolean }) {
  if (status === "complete") {
    return (
      <span className={`inline-flex items-center gap-1 text-green-700 bg-green-50 rounded-full font-medium ${compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Complete
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium ${compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"}`}
        style={{ color: "#92690e", background: "rgba(201,168,76,0.12)" }}>
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#c9a84c" }} />
        In progress
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 text-gray-400 bg-gray-100 rounded-full font-medium ${compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
      No files
    </span>
  );
}

function ActivityItem({ item }: { item: RecentActivityItem }) {
  const isNew = item.version === 1;
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isNew ? "bg-green-50 text-green-600" : "bg-gold/10"}`}
        style={!isNew ? { color: "#c9a84c" } : {}}>
        {isNew ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate">{item.title}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
          {item.folder_name} · {item.uploader_name}
        </p>
        <p className="text-[11px] text-gray-300 mt-0.5">{daysSince(item.created_at)}</p>
      </div>
      {item.version > 1 && (
        <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">v{item.version}</span>
      )}
    </div>
  );
}

