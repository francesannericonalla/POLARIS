import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import {
  getUnitSummaries,
  getUnitFolderStatsByFilter,
  getRecentActivity,
  getFolderSubmissionStats,
  currentSchoolYear,
  buildSchoolYearOptions,
  type FolderStat,
  type FolderSubmissionStat,
  type RecentActivityItem,
} from "@/lib/data/dashboard";
import { getAllUnits } from "@/lib/data/units";
import { AppShell } from "@/components/app-shell";
import Link from "next/link";
import { OfficeUserSYFilter } from "./office-user-sy-filter";
import { DashboardFilterBar } from "./dashboard-filter-bar";
import { FolderCoverageWithDrawer } from "./folder-coverage-drawer";
import { FolderCoverageTabbed } from "./folder-coverage-tabbed";
import { CollegeComplianceList, type CollegeRow } from "./college-drawer";
import { QAOAllOfficesTable } from "./qao-all-offices-table";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; sy?: string; search?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (profile.role === "system_admin") redirect("/admin/approvals");

  const defaultSY = currentSchoolYear();

  // ── Office user ──────────────────────────────────────────────────────────────
  if (profile.role === "office_user") {
    if (!profile.unit_id) redirect("/pending");

    const sy = (await searchParams as { sy?: string }).sy;
    const displaySY = sy || defaultSY;

    const [folderStats, recentActivity] = await Promise.all([
      getUnitFolderStatsByFilter(profile.unit_id, { schoolYear: displaySY }),
      getRecentActivity(profile.unit_id, 5),
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
            <Suspense fallback={<div className="h-9 w-36 bg-gray-100 rounded-lg animate-pulse" />}>
              <OfficeUserSYFilter sy={sy ?? ""} syOptions={syOptions} />
            </Suspense>
          </div>

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

  const [allSummaries, folderStats, allUnits] = await Promise.all([
    getUnitSummaries(validBranch, activeSY),
    getFolderSubmissionStats(activeSY),
    getAllUnits(),
  ]);

  const totalUnits = allSummaries.length;
  const totalFolderSlots = allSummaries.reduce((s, u) => s + u.totalFolders, 0);
  const totalFoldersFiled = allSummaries.reduce((s, u) => s + u.foldersThisYear, 0);
  const submissionRate = totalFolderSlots > 0 ? Math.round((totalFoldersFiled / totalFolderSlots) * 100) : 0;
  const withSubmissions = allSummaries.filter((u) => u.totalFolders > 0 && u.foldersThisYear >= u.totalFolders).length;
  const withAnySubmission = allSummaries.filter((u) => u.foldersThisYear > 0).length;
  const noAnySubmission = allSummaries.filter((u) => u.foldersThisYear === 0).length;

  // College rollup — group departments by parent college
  const summaryById = new Map(allSummaries.map((u) => [u.id, u]));
  const colleges = allUnits.filter((u) => u.type === "college").sort((a, b) => a.sort_order - b.sort_order);
  const collegeRows = colleges.map((college) => {
    const depts = allUnits.filter((u) => u.parent_id === college.id && u.type === "department");
    const deptSummaries = depts.map((d) => summaryById.get(d.id)).filter(Boolean) as typeof allSummaries;
    const filed = deptSummaries.filter((u) => u.totalFolders > 0 && u.foldersThisYear >= u.totalFolders).length;
    return {
      id: college.id,
      name: college.name,
      filed,
      total: deptSummaries.length,
      departments: deptSummaries.map((u) => ({
        id: u.id,
        name: u.name,
        foldersThisYear: u.foldersThisYear,
        totalFolders: u.totalFolders,
      })),
    };
  }).filter((c) => c.total > 0);

  const R = 36, CIRC = 2 * Math.PI * R;
  const rateOffset = CIRC - (submissionRate / 100) * CIRC;
  const ringColor = submissionRate >= 80 ? "#16a34a" : submissionRate >= 50 ? "#B8892B" : "#ef4444";

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

  const academicsStats = folderStats.filter((s) => s.branch === "academics");
  const adminFolderStats = folderStats.filter((s) => s.branch === "administration");
  const showAcademics = !validBranch || validBranch === "academics";
  const showAdmin     = !validBranch || validBranch === "administration";

  return (
    <AppShell profile={profile} title="University Dashboard" activeHref="/dashboard">
      <div className="p-6 md:p-8 space-y-6" style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5 flex items-center gap-2" style={{ color: "#7A1330" }}>
              <span className="w-0.5 h-4 rounded-full inline-block" style={{ background: "#7A1330" }} />
              QAO Dashboard
            </p>
            <h1 className="font-poppins text-[26px] font-bold leading-tight text-slate-900">
              University Overview
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Overall compliance status of all offices and departments.</p>
          </div>
          <Suspense fallback={<div className="h-9 w-64 bg-gray-100 rounded-lg animate-pulse" />}>
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
            {/* Icon badge */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(122,19,48,0.07)" }}>
              {/* Stacked layers icon matching reference */}
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#7A1330" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-500 mb-0.5">Submission Rate</p>
              <p className="text-[28px] font-bold leading-none text-slate-900">{submissionRate}%</p>
              <p className="text-[12px] text-slate-400 mt-1">
                {withAnySubmission === 0 ? "No offices have started" : `${withAnySubmission} of ${totalUnits} offices have started`}
              </p>
            </div>
            {/* Ring on the right */}
            <div className="relative shrink-0 w-14 h-14">
              <svg width="56" height="56" viewBox="0 0 88 88" className="-rotate-90">
                <circle cx="44" cy="44" r={R} fill="none" stroke="#f0f0f0" strokeWidth="9" />
                <circle cx="44" cy="44" r={R} fill="none" stroke={ringColor} strokeWidth="9" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={rateOffset} />
              </svg>
            </div>
          </div>

          {/* Fully Filed */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(21,128,61,0.08)" }}>
              {/* Clipboard with checkmark */}
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-slate-500 mb-0.5">Fully Filed</p>
              <p className="text-[28px] font-bold leading-none text-slate-900">{withSubmissions}</p>
              <p className="text-[12px] text-slate-400 mt-1">
                {withSubmissions === totalUnits ? "All offices completed" : `of ${totalUnits} offices completed all folders`}
              </p>
            </div>
          </div>

          {/* No Submissions Yet */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: noAnySubmission > 0 ? "rgba(239,68,68,0.08)" : "rgba(21,128,61,0.08)" }}>
              {/* Hourglass / clock indicating pending */}
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={noAnySubmission > 0 ? "#ef4444" : "#16a34a"} strokeWidth={1.8}>
                <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-slate-500 mb-0.5">No Submissions Yet</p>
              <p className="text-[28px] font-bold leading-none text-slate-900">{noAnySubmission}</p>
              <p className="text-[12px] text-slate-400 mt-1">
                {noAnySubmission === 0 ? "All offices have submitted" : `${noAnySubmission} office${noAnySubmission !== 1 ? "s" : ""} haven't submitted anything`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Middle: Compliance Overview + Folder Coverage ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Compliance Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <h2 className="text-[15px] font-bold text-slate-800">
                Compliance Overview
                <span className="ml-2 text-[12px] font-normal text-slate-400">SY {activeSY}</span>
              </h2>
            </div>
            <div className="p-6 flex flex-col gap-5 flex-1">

              {/* Academics row */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(122,19,48,0.07)" }}>
                    <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#7A1330" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[14px] font-semibold text-slate-800">Academics</span>
                      <span className="text-[13px] font-bold tabular-nums" style={{ color: acadPct >= 80 ? "#16a34a" : acadPct >= 50 ? "#B8892B" : "#7A1330" }}>{acadPct}%</span>
                    </div>
                    <p className="text-[12px] text-slate-400">Colleges and academic departments</p>
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums text-slate-600 shrink-0">{acadFiled} / {acadSummariesAll.length}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${acadPct}%`, background: "#7A1330" }} />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Administration row */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(184,137,43,0.08)" }}>
                    <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B8892B" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[14px] font-semibold text-slate-800">Administration</span>
                      <span className="text-[13px] font-bold tabular-nums" style={{ color: adminPct >= 80 ? "#16a34a" : adminPct >= 50 ? "#B8892B" : "#7A1330" }}>{adminPct}%</span>
                    </div>
                    <p className="text-[12px] text-slate-400">Standalone offices and administrative units</p>
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums text-slate-600 shrink-0">{adminFiled} / {adminSummariesAll.length}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${adminPct}%`, background: "#B8892B" }} />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* College rollup */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">By College</p>
                <CollegeComplianceList collegeRows={collegeRows as CollegeRow[]} schoolYear={activeSY} />
              </div>

            </div>
          </div>

          {/* Folder Coverage — tabbed, drawer preserved */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 420 }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <h2 className="text-[15px] font-bold text-slate-800">
                Folder Coverage
                <span className="ml-2 text-[12px] font-normal text-slate-400">SY {activeSY}</span>
              </h2>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <FolderCoverageTabbed
                academicsStats={showAcademics ? academicsStats : []}
                adminStats={showAdmin ? adminFolderStats : []}
                schoolYear={activeSY}
              />
            </div>
          </div>

        </div>

        {/* ── All Offices ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <h2 className="text-[15px] font-bold text-slate-800">All Offices</h2>
            <span className="text-[12px] font-semibold text-white px-2.5 py-0.5 rounded-full" style={{ background: "#7A1330" }}>{totalUnits} total</span>
          </div>
          <QAOAllOfficesTable summaries={allSummaries} />
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

function OUStatCard({ label, value, sub, color }: {
  label: string;
  value: string | number;
  sub: string;
  color: "maroon" | "gold" | "green" | "red";
}) {
  const dotStyle: React.CSSProperties = {
    maroon: { background: "var(--ou-accent)" },
    gold:   { background: "#c9a84c" },
    green:  { background: "#16a34a" },
    red:    { background: "#ef4444" },
  }[color];

  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--ou-card-bg)", border: "1px solid var(--ou-card-border)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center gap-1.5 mb-4">
        <span className="w-2 h-2 rounded-full shrink-0" style={dotStyle} />
        <span className="text-xs font-medium" style={{ color: "var(--ou-subtext)" }}>{label}</span>
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: "var(--ou-heading)" }}>{value}</p>
      <p className="text-xs" style={{ color: "var(--ou-muted)" }}>{sub}</p>
    </div>
  );
}

function OUFolderRow({ folder, unitId }: { folder: FolderStat; unitId: string }) {
  const status = folder.thisYearCount > 0 ? "filed" : folder.activeDocumentCount > 0 ? "outdated" : "empty";
  const bar = { filed: { color: "#22c55e", pct: 100 }, outdated: { color: "#c9a84c", pct: 40 }, empty: { color: "#e5e7eb", pct: 0 } }[status];

  return (
    <Link href={`/repository/${unitId}/${folder.id}`} className="block group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium transition-colors truncate mr-3" style={{ color: "var(--ou-heading)" }}>
          {folder.name}
        </span>
        {status === "filed" ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ color: "#15803d", background: "rgba(21,128,61,0.09)" }}>Filed</span>
        ) : status === "outdated" ? (
          <span className="text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0" style={{ color: "#92690e", background: "rgba(201,168,76,0.12)" }}>Outdated</span>
        ) : (
          <span className="text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0" style={{ color: "var(--ou-muted)", background: "rgba(0,0,0,0.05)" }}>Empty</span>
        )}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${bar.pct}%`, background: bar.color }} />
      </div>
    </Link>
  );
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
    </div>
  );
}

