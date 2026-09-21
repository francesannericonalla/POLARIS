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
    getRecentActivity(unitId, 5),
    getAllUnits(),
  ]);

  const currentSY = currentSchoolYear();
  const displaySY = sy || currentSY;

  const totalDocs = folderStats.reduce((s, f) => s + f.activeDocumentCount, 0);
  const thisYearDocs = folderStats.reduce((s, f) => s + f.thisYearCount, 0);
  const foldersSubmittedThisSY = folderStats.filter((f) => f.thisYearCount > 0).length;
  const submissionRate = folderStats.length > 0
    ? Math.round((foldersSubmittedThisSY / folderStats.length) * 100)
    : 0;

  const lastUpload = folderStats.reduce((latest, f) => {
    if (!f.lastUpdate) return latest;
    if (!latest) return f.lastUpdate;
    return f.lastUpdate > latest ? f.lastUpdate : latest;
  }, null as string | null);

  const parentUnit = unit.parent_id ? allUnits.find((u) => u.id === unit.parent_id) : null;
  const branchLabel = unit.branch === "academics" ? "Academics" : "Administration";
  const collegeLabel = parentUnit?.name ?? branchLabel;

  return (
    <AppShell profile={profile} title="Office Dashboard" activeUnitId={unitId}>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-7">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/dashboard" className="hover:text-maroon transition-colors">Dashboard</Link>
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span>{branchLabel}</span>
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium truncate">{unit.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
              {unit.branch === "academics" ? collegeLabel : "Administration"}
            </p>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
              {unit.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Suspense fallback={<div className="h-9 w-52 bg-gray-100 rounded-lg animate-pulse" />}>
              <OfficeDashboardFilterBar sy={sy ?? ""} sem={sem ?? ""} />
            </Suspense>
            <Link
              href={`/repository/${unitId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-maroon hover:bg-maroon-dark rounded-lg px-4 py-2 transition-colors shrink-0"
            >
              Repository
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Total Documents"
            value={totalDocs}
            sub={sy ? `Filtered: SY ${sy}` : "All active files"}
            color="maroon"
          />
          <StatCard
            label={`Filed SY ${displaySY}`}
            value={thisYearDocs}
            sub={lastUpload ? `Last upload ${daysSince(lastUpload)}` : "No uploads yet"}
            color="gold"
          />
          <StatCard
            label="Folders Complete"
            value={`${foldersSubmittedThisSY}/${folderStats.length}`}
            sub={submissionRate === 100 ? "All done!" : `${submissionRate}% submitted`}
            color={submissionRate === 100 ? "green" : submissionRate >= 50 ? "gold" : "red"}
          />
        </div>

        {/* Submission status + activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Folder status */}
          <div className="lg:col-span-3 card divide-y divide-gray-50">
            <div className="px-5 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Submission Status</h2>
              <span className="text-xs text-gray-400">{displaySY}{sem ? ` · ${sem} sem` : ""}</span>
            </div>
            <div className="px-5 py-4 space-y-5">
              {folderStats.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No folders configured.</p>
              ) : (
                folderStats.map((f) => <FolderProgressRow key={f.id} folder={f} unitId={unitId} />)
              )}
            </div>
            {folderStats.length > 0 && (
              <div className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Filed</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#c9a84c" }} />Outdated</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />Empty</span>
                </div>
                <span className="text-xs font-bold" style={{ color: submissionRate === 100 ? "#16a34a" : submissionRate >= 50 ? "#c9a84c" : "#ef4444" }}>
                  {submissionRate}%
                </span>
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="lg:col-span-2 card divide-y divide-gray-50">
            <div className="px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
            </div>
            <div className="px-5 py-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No activity yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((item) => <ActivityItem key={item.id} item={item} />)}
                </div>
              )}
            </div>
            {recentActivity.length > 0 && (
              <div className="px-5 py-3">
                <Link href={`/repository/${unitId}`} className="text-xs font-semibold text-maroon hover:underline">
                  View repository
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Folder breakdown table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Folder Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Folder</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">This SY</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">All-Time</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Last Upload</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {folderStats.map((f) => {
                  const status = f.thisYearCount > 0 ? "complete" : f.activeDocumentCount > 0 ? "in-progress" : "no-files";
                  return (
                    <tr key={f.id} className="hover:bg-maroon/[0.018] transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-800">{f.name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-gray-700">{f.thisYearCount}</td>
                      <td className="px-4 py-3.5 text-center text-gray-400">{f.activeDocumentCount}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">{f.lastUpdate ? daysSince(f.lastUpdate) : "—"}</td>
                      <td className="px-4 py-3.5">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Link
                          href={`/repository/${unitId}/${f.id}`}
                          className="inline-flex items-center justify-center w-16 text-xs font-semibold text-maroon border border-maroon/25 hover:bg-maroon hover:text-white hover:border-maroon rounded-md py-1 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: {
  label: string;
  value: string | number;
  sub: string;
  color: "maroon" | "gold" | "green" | "red";
}) {
  const dot = { maroon: "bg-maroon", gold: "bg-gold", green: "bg-green-500", red: "bg-red-400" }[color];
  return (
    <div className="card p-5">
      <div className="flex items-center gap-1.5 mb-4">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function FolderProgressRow({ folder, unitId }: { folder: FolderStat; unitId: string }) {
  const status = folder.thisYearCount > 0 ? "filed" : folder.activeDocumentCount > 0 ? "outdated" : "empty";
  const bar = {
    filed:    { color: "#22c55e", pct: 100 },
    outdated: { color: "#c9a84c", pct: 40 },
    empty:    { color: "#e5e7eb", pct: 0 },
  }[status];

  return (
    <Link href={`/repository/${unitId}/${folder.id}`} className="block group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700 group-hover:text-maroon transition-colors truncate mr-3">
          {folder.name}
        </span>
        {status === "filed" ? (
          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full shrink-0">Filed</span>
        ) : status === "outdated" ? (
          <span className="text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0" style={{ color: "#92690e", background: "rgba(201,168,76,0.12)" }}>Outdated</span>
        ) : (
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">Empty</span>
        )}
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${bar.pct}%`, background: bar.color }} />
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: "complete" | "in-progress" | "no-files" }) {
  if (status === "complete") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block shrink-0" />Filed
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#b07d2a" }}>
        <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: "#c9a84c" }} />Outdated
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block shrink-0" />Empty
    </span>
  );
}

function ActivityItem({ item }: { item: RecentActivityItem }) {
  const isNew = item.version === 1;
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isNew ? "bg-green-50 text-green-600" : "bg-gold/10"}`}
        style={!isNew ? { color: "#c9a84c" } : {}}
      >
        {isNew ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.folder_name} · {item.uploader_name}</p>
        <p className="text-[11px] text-gray-300 mt-0.5">{daysSince(item.created_at)}</p>
      </div>
      {item.version > 1 && (
        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">v{item.version}</span>
      )}
    </div>
  );
}
