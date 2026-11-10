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
  buildSchoolYearOptions,
  type FolderStat,
  type RecentActivityItem,
} from "@/lib/data/dashboard";
import { AppShell } from "@/components/app-shell";
import { OfficeDashboardFilterBar } from "./filter-bar";
import { ExportOfficeButton } from "./export-button";
import { FolderBreakdownTable } from "./folder-breakdown-table";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

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

  const foldersSubmittedThisSY = folderStats.filter((f) => f.thisYearCount > 0).length;
  const submissionRate = folderStats.length > 0
    ? Math.round((foldersSubmittedThisSY / folderStats.length) * 100)
    : 0;
  const filedFolders = foldersSubmittedThisSY;
  const missingFolders = folderStats.filter((f) => f.thisYearCount === 0).length;
  const rateColor = submissionRate === 100 ? "#16a34a" : "var(--ou-accent)";

  const parentUnit = unit.parent_id ? allUnits.find((u) => u.id === unit.parent_id) : null;
  const branchLabel = unit.branch === "academics" ? "Academics" : "Administration";
  const collegeLabel = parentUnit?.name ?? branchLabel;

  return (
    <AppShell profile={profile} title="Office Dashboard" activeUnitId={unitId} activeHref={`/dashboard/office/${unitId}`}>
      <div className="p-6 md:p-8 space-y-5" style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: "var(--ou-muted)" }}>
              <Link href="/dashboard" className="transition-colors hover:underline" style={{ color: "var(--ou-muted)" }}>Dashboard</Link>
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span>{branchLabel}</span>
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span style={{ color: "var(--ou-subtext)" }} className="font-medium truncate">{unit.name}</span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5 flex items-center gap-2" style={{ color: "var(--ou-accent)" }}>
              <span className="w-0.5 h-4 rounded-full inline-block" style={{ background: "var(--ou-accent)" }} />
              Compliance Dashboard
            </p>
            <h1 className="font-poppins text-[26px] font-bold leading-tight" style={{ color: "var(--ou-heading)" }}>
              {unit.name}
            </h1>
            <p className="text-[13px] mt-1" style={{ color: "var(--ou-subtext)" }}>
              {unit.branch === "academics" ? collegeLabel : "Administration"} · SY {displaySY}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Suspense fallback={<div className="h-9 w-52 bg-gray-100 rounded-lg animate-pulse" />}>
              <OfficeDashboardFilterBar sy={sy ?? ""} sem={sem ?? ""} />
            </Suspense>
            <ExportOfficeButton
              unitName={unit.name}
              schoolYear={displaySY}
              folders={folderStats}
            />
            <Link
              href={`/repository/${unitId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white rounded-xl px-4 py-2.5 transition-colors shrink-0"
              style={{ background: "var(--ou-accent)" }}
            >
              Repository
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ── Top row: Compliance progress card + Filed/Missing cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4">

          {/* Compliance Progress card */}
          <div className="rounded-2xl p-6" style={{ background: "var(--ou-card-bg)", border: "1px solid var(--ou-card-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 className="text-[14px] font-bold mb-0.5" style={{ color: "var(--ou-accent)" }}>Compliance Progress</h2>
            <p className="text-[12px] mb-5" style={{ color: "var(--ou-subtext)" }}>Overall folder completion for SY {displaySY}{sem ? ` · ${sem} Semester` : ""}</p>

            <div className="flex items-center gap-6">
              {/* Folders count box */}
              <div className="shrink-0 rounded-xl px-5 py-4 text-center" style={{ background: "rgba(121,19,47,0.06)", minWidth: 90 }}>
                <p className="text-[28px] font-bold leading-none" style={{ color: "var(--ou-accent)" }}>
                  {foldersSubmittedThisSY}/{folderStats.length}
                </p>
                <p className="text-[11px] font-medium mt-1" style={{ color: "var(--ou-subtext)" }}>Folders</p>
              </div>

              {/* Progress bar */}
              <div className="flex-1 space-y-2">
                <p className="text-[20px] font-bold" style={{ color: "var(--ou-heading)" }}>{submissionRate}% Complete</p>
                <div className="relative h-[7px] rounded-full overflow-visible" style={{ background: "rgba(0,0,0,0.07)" }}>
                  <div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${submissionRate}%`, background: rateColor, transition: "width 1.2s ease" }}
                  />
                  {submissionRate > 2 && submissionRate < 100 && (
                    <div
                      className="absolute"
                      style={{
                        left: `calc(${submissionRate}% - 14px)`,
                        top: "50%",
                        marginTop: -14,
                        width: 28,
                        height: 28,
                        animation: "ou-star-pulse 2s ease-in-out infinite",
                        pointerEvents: "none",
                      }}
                    >
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="12" fill={rateColor} opacity="0.12" />
                        <path d="M14 1 L15.8 12.2 L27 14 L15.8 15.8 L14 27 L12.2 15.8 L1 14 L12.2 12.2 Z" fill={rateColor} />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-[12px]" style={{ color: "var(--ou-subtext)" }}>
                  {foldersSubmittedThisSY} of {folderStats.length} folders submitted
                </p>
              </div>
            </div>
          </div>

          {/* Filed + Missing stat cards */}
          <div className="flex lg:flex-col gap-4">
            <div className="flex-1 rounded-2xl p-5 flex flex-col items-center justify-center text-center" style={{ background: "var(--ou-card-bg)", border: "1px solid var(--ou-card-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: "var(--ou-muted)" }}>Filed</p>
              <p className="text-[36px] font-bold leading-none" style={{ color: "#16a34a" }}>{filedFolders}</p>
            </div>
            <div className="flex-1 rounded-2xl p-5 flex flex-col items-center justify-center text-center" style={{ background: "var(--ou-card-bg)", border: "1px solid var(--ou-card-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: "var(--ou-muted)" }}>Missing</p>
              <p className="text-[36px] font-bold leading-none" style={{ color: "var(--ou-accent)" }}>{missingFolders}</p>
            </div>
          </div>
        </div>

        {/* ── Bottom row: Folder Breakdown + Recent Submissions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* Folder Breakdown */}
          <FolderBreakdownTable
            folderStats={folderStats}
            unitId={unitId}
            displaySY={displaySY}
            sem={sem}
          />

          {/* Recent Submissions */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--ou-card-bg)", border: "1px solid var(--ou-card-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--ou-divider)" }}>
              <h2 className="text-[15px] font-bold" style={{ color: "var(--ou-accent)" }}>Recent Submissions</h2>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--ou-subtext)" }}>Latest document uploads and updates</p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--ou-divider)" }}>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: "var(--ou-muted)" }}>No activity yet.</p>
              ) : (
                recentActivity.map((item) => <ActivityItem key={item.id} item={item} />)
              )}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}

function ActivityItem({ item }: { item: RecentActivityItem }) {
  return (
    <div className="px-6 py-4 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold truncate" style={{ color: "var(--ou-heading)" }}>{item.title}</p>
          <span className="text-[11px] font-medium shrink-0" style={{ color: "var(--ou-muted)" }}>v{item.version}</span>
        </div>
        <p className="text-[12px] mt-0.5 truncate" style={{ color: "var(--ou-subtext)" }}>{item.folder_name}</p>
        <p className="text-[11px] mt-1" style={{ color: "var(--ou-muted)" }}>
          {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}
