import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, Inbox } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import {
  getUnitSummaries,
  getUnitFolderStatsByFilter,
  getRecentActivity,
  getFolderSubmissionStats,
  getRecentUploadsAllUnits,
  currentSchoolYear,
  buildSchoolYearOptions,
  type FolderStat,
  type FolderSubmissionStat,
  type RecentActivityItem,
  type RecentUploadItem,
} from "@/lib/data/dashboard";
import { AppShell } from "@/components/app-shell";
import Link from "next/link";
import { OfficeUserSYFilter } from "./office-user-sy-filter";
import { DashboardFilterBar } from "./dashboard-filter-bar";
import { FolderCoverage } from "./folder-coverage";
import { QAOAllOfficesTable } from "./qao-all-offices-table";
import { DeadlineManager } from "./deadline-manager";
import { DeadlineBanner } from "./deadline-banner";
import { getDeadlinesForSchoolYear } from "@/lib/data/deadlines";
import { DocumentPreviewButton } from "@/components/document-preview-button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; sy?: string; search?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (profile.role === "system_admin") redirect("/admin/accounts");

  const defaultSY = currentSchoolYear();

  // ── Office user ──────────────────────────────────────────────────────────────
  if (profile.role === "office_user") {
    if (!profile.unit_id) redirect("/pending");

    const sy = (await searchParams as { sy?: string }).sy;
    const displaySY = sy || defaultSY;

    const [folderStats, recentActivity, deadlines] = await Promise.all([
      getUnitFolderStatsByFilter(profile.unit_id, { schoolYear: displaySY }),
      getRecentActivity(profile.unit_id, 5),
      getDeadlinesForSchoolYear(displaySY),
    ]);

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
    const syOptions = buildSchoolYearOptions();

    const filedFolders   = folderStats.filter((f) => f.thisYearCount > 0).length;
    const missingFolders = folderStats.filter((f) => f.thisYearCount === 0).length;
    const rateColor = submissionRate === 100 ? "#16a34a" : "var(--ou-accent)";

    return (
      <AppShell profile={profile} title="My Dashboard" activeHref="/dashboard">
        <div className="p-6 md:p-8 space-y-5" style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5 flex items-center gap-2" style={{ color: "var(--ou-accent)" }}>
                <span className="w-0.5 h-4 rounded-full inline-block" style={{ background: "var(--ou-accent)" }} />
                Compliance Dashboard
              </p>
              <h1 className="font-poppins text-[26px] font-bold leading-tight" style={{ color: "var(--ou-heading)" }}>
                {profile.unit_name ?? "My Office"}
              </h1>
              <p className="text-[13px] mt-1" style={{ color: "var(--ou-subtext)" }}>SY {displaySY}</p>
            </div>
            <Suspense fallback={<div className="h-9 w-36 rounded-lg animate-pulse" style={{ background: "var(--ou-toggle-bg, #f3f4f6)" }} />}>
              <OfficeUserSYFilter sy={sy ?? ""} syOptions={syOptions} />
            </Suspense>
          </div>

          {/* ── Deadline banner ── */}
          {deadlines.length > 0 && (
            <DeadlineBanner deadlines={deadlines} schoolYear={displaySY} />
          )}

          {/* ── Top row: Compliance progress card + Filed/Missing cards ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4">

            {/* Compliance Progress card */}
            <div className="rounded-2xl p-6" style={{ background: "var(--ou-card-bg)", border: "1px solid var(--ou-card-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h2 className="text-[14px] font-bold mb-0.5" style={{ color: "var(--ou-accent)" }}>Compliance Progress</h2>
              <p className="text-[12px] mb-5" style={{ color: "var(--ou-subtext)" }}>Overall folder completion for SY {displaySY}</p>

              <div className="flex items-center gap-6">
                {/* Folders count box */}
                <div className="shrink-0 rounded-xl px-5 py-4 text-center" style={{ background: "rgba(121,19,47,0.06)", minWidth: 90 }}>
                  <p className="text-[28px] font-bold leading-none" style={{ color: "var(--ou-accent)" }}>
                    {foldersSubmittedThisSY}/{folderStats.length}
                  </p>
                  <p className="text-[11px] font-medium mt-1" style={{ color: "var(--ou-subtext)" }}>Folders</p>
                </div>

                {/* Progress bar section */}
                <div className="flex-1 space-y-2">
                  <p className="text-[20px] font-bold" style={{ color: "var(--ou-heading)" }}>{submissionRate}% Complete</p>

                  {/* Progress bar with animated north-star tip */}
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
                          {/* glow */}
                          <circle cx="14" cy="14" r="12" fill={rateColor} opacity="0.12" />
                          {/* 4-pointed star — single clean path */}
                          <path
                            d="M14 1 L15.8 12.2 L27 14 L15.8 15.8 L14 27 L12.2 15.8 L1 14 L12.2 12.2 Z"
                            fill={rateColor}
                          />
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
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--ou-card-bg)", border: "1px solid var(--ou-card-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--ou-divider)" }}>
                <h2 className="text-[15px] font-bold" style={{ color: "var(--ou-accent)" }}>Folder Breakdown</h2>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--ou-subtext)" }}>Submission status of all required folders · SY {displaySY}</p>
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
                    {folderStats.map((f) => {
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
                              href={`/repository/${profile.unit_id}/${f.id}`}
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
            </div>

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
                  recentActivity.map((item) => <OUActivityItem key={item.id} item={item} />)
                )}
              </div>
            </div>

          </div>

        </div>
      </AppShell>
    );
  }

  // ── QAO: university-wide dashboard ──────────────────────────────────────────
  const { branch, sy } = await searchParams;
  const validBranch = branch === "academics" || branch === "administration" ? branch : undefined;
  const activeSY = sy || defaultSY;
  const syOptions = buildSchoolYearOptions();

  const [allSummaries, folderStats, qaoDeadlines, recentUploads] = await Promise.all([
    getUnitSummaries(validBranch, activeSY),
    getFolderSubmissionStats(activeSY),
    getDeadlinesForSchoolYear(activeSY),
    getRecentUploadsAllUnits(5),
  ]);

  const totalUnits = allSummaries.length;
  const totalFolderSlots = allSummaries.reduce((s, u) => s + u.totalFolders, 0);
  const totalFoldersFiled = allSummaries.reduce((s, u) => s + u.foldersThisYear, 0);
  const submissionRate = totalFolderSlots > 0 ? Math.round((totalFoldersFiled / totalFolderSlots) * 100) : 0;
  const withSubmissions = allSummaries.filter((u) => u.totalFolders > 0 && u.foldersThisYear >= u.totalFolders).length;
  const withAnySubmission = allSummaries.filter((u) => u.foldersThisYear > 0).length;
  const noAnySubmission = allSummaries.filter((u) => u.foldersThisYear === 0).length;

  const R = 36, CIRC = 2 * Math.PI * R;
  const rateOffset = CIRC - (submissionRate / 100) * CIRC;
  const ringColor = "#7A1330";

  // Compliance Overview card stats
  const acadSummariesAll = allSummaries.filter((u) => u.branch === "academics");
  const adminSummariesAll = allSummaries.filter((u) => u.branch === "administration");
  const acadFiled   = acadSummariesAll.filter((u) => u.totalFolders > 0 && u.foldersThisYear >= u.totalFolders).length;
  const adminFiled  = adminSummariesAll.filter((u) => u.totalFolders > 0 && u.foldersThisYear >= u.totalFolders).length;
  const acadStarted = acadSummariesAll.filter((u) => u.foldersThisYear > 0).length;
  const adminStarted = adminSummariesAll.filter((u) => u.foldersThisYear > 0).length;
  const acadSlots   = acadSummariesAll.reduce((s, u) => s + u.totalFolders, 0);
  const acadFilled2 = acadSummariesAll.reduce((s, u) => s + u.foldersThisYear, 0);
  const acadPct     = acadSlots > 0 ? Math.round((acadFilled2 / acadSlots) * 100) : 0;
  const adminSlots  = adminSummariesAll.reduce((s, u) => s + u.totalFolders, 0);
  const adminFilled2 = adminSummariesAll.reduce((s, u) => s + u.foldersThisYear, 0);
  const adminPct    = adminSlots > 0 ? Math.round((adminFilled2 / adminSlots) * 100) : 0;

  return (
    <AppShell profile={profile} title="University Dashboard" activeHref="/dashboard">
      <div className="p-6 md:p-8 space-y-6" style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5 flex items-center gap-2" style={{ color: "var(--ou-accent)" }}>
              <span className="w-0.5 h-4 rounded-full inline-block" style={{ background: "var(--ou-accent)" }} />
              QAO Dashboard
            </p>
            <h1 className="font-poppins text-[26px] font-bold leading-tight" style={{ color: "var(--ou-heading)" }}>
              University Overview
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--ou-subtext)" }}>Overall compliance status of all offices and departments.</p>
          </div>
          <Suspense fallback={<div className="h-9 w-64 rounded-lg animate-pulse" style={{ background: "var(--ou-toggle-bg, #f3f4f6)" }} />}>
            <DashboardFilterBar
              sy={activeSY}
              branch={branch ?? ""}
              search=""
              syOptions={syOptions}
              hideSearch
            />
          </Suspense>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Submission Rate — icon LEFT, ring RIGHT */}
          <div className="rounded-2xl ou-card p-5 flex items-center gap-5">
            {/* Icon badge */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(122,19,48,0.07)" }}>
              {/* Stacked layers icon matching reference */}
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#7A1330" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold mb-0.5" style={{ color: "var(--ou-subtext)" }}>Submission Rate</p>
              <p className="text-[28px] font-bold leading-none" style={{ color: "var(--ou-heading)" }}>{submissionRate}%</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--ou-muted)" }}>
                {withAnySubmission === 0 ? "No offices have started" : `${withAnySubmission} of ${totalUnits} offices have started`}
              </p>
            </div>
            {/* Ring on the right */}
            <div className="relative shrink-0 w-14 h-14">
              <svg width="56" height="56" viewBox="0 0 88 88" className="-rotate-90">
                <circle cx="44" cy="44" r={R} fill="none" stroke="var(--ou-toggle-bg)" strokeWidth="9" />
                <circle cx="44" cy="44" r={R} fill="none" stroke={ringColor} strokeWidth="9" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={rateOffset} />
              </svg>
            </div>
          </div>

          {/* Fully Filed */}
          <div className="rounded-2xl ou-card p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(21,128,61,0.08)" }}>
              <CheckCircle2 className="w-6 h-6" style={{ color: "#16a34a" }} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold mb-0.5" style={{ color: "var(--ou-subtext)" }}>Fully Filed</p>
              <p className="text-[28px] font-bold leading-none" style={{ color: "var(--ou-heading)" }}>{withSubmissions}</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--ou-muted)" }}>
                {withSubmissions === totalUnits ? "All offices completed" : `of ${totalUnits} offices completed all folders`}
              </p>
            </div>
          </div>

          {/* No Submissions Yet */}
          <div className="rounded-2xl ou-card p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: noAnySubmission > 0 ? "rgba(239,68,68,0.08)" : "rgba(21,128,61,0.08)" }}>
              <Inbox className="w-6 h-6" style={{ color: noAnySubmission > 0 ? "#ef4444" : "#16a34a" }} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold mb-0.5" style={{ color: "var(--ou-subtext)" }}>No Submissions Yet</p>
              <p className="text-[28px] font-bold leading-none" style={{ color: "var(--ou-heading)" }}>{noAnySubmission}</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--ou-muted)" }}>
                {noAnySubmission === 0 ? "All offices have submitted" : `${noAnySubmission} office${noAnySubmission !== 1 ? "s" : ""} haven't submitted anything`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Row 1: Compliance Overview + Submission Deadlines ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

          {/* Compliance Overview */}
          <div className="rounded-2xl ou-card overflow-hidden">
            <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--ou-divider)" }}>
              <h2 className="text-[15px] font-bold" style={{ color: "var(--ou-heading)" }}>
                Compliance Overview
                <span className="ml-2 text-[12px] font-normal" style={{ color: "var(--ou-muted)" }}>SY {activeSY}</span>
              </h2>
            </div>
            <div className="px-5 py-5 flex flex-col gap-5">

              {/* Academics row */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(122,19,48,0.07)" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#7A1330" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-semibold" style={{ color: "var(--ou-heading)" }}>Academics</span>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--ou-muted)" }}>Colleges and academic departments</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--ou-subtext)" }}>{acadFiled} / {acadSummariesAll.length}</span>
                    <p className="text-[13px] font-bold tabular-nums mt-0.5" style={{ color: "#7A1330" }}>{acadPct}%</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--ou-toggle-bg)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${acadPct}%`, background: "#7A1330" }} />
                </div>
              </div>

              <div className="border-t" style={{ borderColor: "var(--ou-divider)" }} />

              {/* Administration row */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(122,19,48,0.07)" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#7A1330" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-semibold" style={{ color: "var(--ou-heading)" }}>Administration</span>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--ou-muted)" }}>Standalone offices and administrative units</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--ou-subtext)" }}>{adminFiled} / {adminSummariesAll.length}</span>
                    <p className="text-[13px] font-bold tabular-nums mt-0.5" style={{ color: "#7A1330" }}>{adminPct}%</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--ou-toggle-bg)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${adminPct}%`, background: "#7A1330" }} />
                </div>
              </div>

            </div>
          </div>

          {/* Submission Deadlines */}
          <DeadlineManager
            schoolYear={activeSY}
            deadlines={{
              "1st": qaoDeadlines.find((d) => d.semester === "1st") ?? null,
              "2nd": qaoDeadlines.find((d) => d.semester === "2nd") ?? null,
              "Summer": qaoDeadlines.find((d) => d.semester === "Summer") ?? null,
            }}
          />

        </div>

        {/* ── Row 2: Folder Coverage + Recent Uploads ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">

          {/* Folder Coverage */}
          <div className="rounded-2xl ou-card overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid var(--ou-divider)" }}>
              <h2 className="text-[15px] font-bold" style={{ color: "var(--ou-heading)" }}>
                Folder Coverage
                <span className="ml-2 text-[12px] font-normal" style={{ color: "var(--ou-muted)" }}>SY {activeSY}</span>
              </h2>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <FolderCoverage
                stats={folderStats}
                branch={validBranch ?? "all"}
                schoolYear={activeSY}
              />
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="rounded-2xl ou-card overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid var(--ou-divider)" }}>
              <h2 className="text-[15px] font-bold" style={{ color: "var(--ou-heading)" }}>Recent Uploads</h2>
              <span className="text-[12px]" style={{ color: "var(--ou-muted)" }}>Across all offices</span>
            </div>
            {recentUploads.length === 0 ? (
              <p className="px-6 py-10 text-sm text-center" style={{ color: "var(--ou-muted)" }}>No documents uploaded yet.</p>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--ou-divider)" }}>
                {recentUploads.map((item) => (
                  <Link
                    key={item.id}
                    href={`/repository/${item.unit_id}/${item.folder_id}`}
                    className="ou-table-row flex items-start gap-4 px-6 py-3.5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(122,19,48,0.07)" }}>
                      <svg className="w-4 h-4" style={{ color: "#7A1330" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold truncate" style={{ color: "var(--ou-heading)" }}>{item.title}</span>
                        {item.version > 1 && (
                          <span className="text-[11px] font-medium text-maroon bg-maroon/[0.06] border border-maroon/15 px-1.5 py-0.5 rounded shrink-0">
                            v{item.version}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] mt-0.5" style={{ color: "var(--ou-muted)" }}>
                        <span className="font-medium" style={{ color: "var(--ou-subtext)" }}>{item.unit_name}</span>
                        {" · "}{item.folder_name}{" · "}{item.uploader_name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px]" style={{ color: "var(--ou-muted)" }}>{qaoTimeAgo(item.created_at)}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--ou-muted)" }}>{item.school_year} · {item.semester === "N/A" ? "Full Year" : `${item.semester} sem`}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── All Offices ── */}
        <div className="rounded-2xl ou-card overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--ou-divider)" }}>
            <h2 className="text-[15px] font-bold" style={{ color: "var(--ou-heading)" }}>All Offices</h2>
            <span className="text-[12px] font-semibold text-white px-2.5 py-0.5 rounded-full" style={{ background: "#7A1330" }}>{totalUnits} total</span>
          </div>
          <QAOAllOfficesTable summaries={allSummaries} schoolYear={activeSY} />
        </div>

      </div>
    </AppShell>
  );
}

// ── Office-user helpers ───────────────────────────────────────────────────────

function ouDaysSince(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function ouFormatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function qaoTimeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function OUActivityItem({ item }: { item: RecentActivityItem }) {
  return (
    <div className="px-6 py-4 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold truncate" style={{ color: "var(--ou-heading)" }}>{item.title}</p>
          <span className="text-[11px] font-medium shrink-0" style={{ color: "var(--ou-muted)" }}>v{item.version}</span>
        </div>
        <p className="text-[12px] mt-0.5 truncate" style={{ color: "var(--ou-subtext)" }}>{item.folder_name}</p>
        <p className="text-[11px] mt-1" style={{ color: "var(--ou-muted)" }}>{ouFormatDate(item.created_at)}</p>
      </div>
      <DocumentPreviewButton
        storagePath={item.storage_path}
        mimeType={item.mime_type}
        title={item.title}
        className="shrink-0 inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-gray-400 dark:text-slate-500 hover:text-maroon border border-gray-200 dark:border-white/10 hover:border-maroon/30 rounded-lg px-2.5 py-1 transition-colors hover:bg-maroon/[0.03] dark:hover:bg-maroon/10 disabled:opacity-40"
      />
    </div>
  );
}

