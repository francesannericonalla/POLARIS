import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import {
  getUnitSummaries,
  getUnitFolderStats,
  getUnitFolderStatsByFilter,
  getRecentActivity,
  currentSchoolYear,
  buildSchoolYearOptions,
  type FolderStat,
  type RecentActivityItem,
} from "@/lib/data/dashboard";
import { AppShell } from "@/components/app-shell";
import { DownloadButton } from "@/components/download-button";
import Link from "next/link";
import { DashboardFilterBar } from "./dashboard-filter-bar";
import { OfficeUserSYFilter } from "./office-user-sy-filter";

const KPI_CATEGORIES = {
  academics: [
    { num: 1, title: "People & Academic Performance", items: ["Faculty Evaluation", "Faculty Development", "Research - Scopus Indexed (% or count)"] },
    { num: 2, title: "Performance Achievement", items: ["Overall KPI Achievement", "Accomplishment Rate", "Reporting/Submission Compliance", "Implementation Rate of Action Plans"] },
    { num: 3, title: "Strategic Performance", items: ["Balance Scorecard", "Attainment of Strategic Objectives"] },
    { num: 4, title: "Compliance", items: ["Report Submission Rate", "% Readiness - Accreditation, Certification, Ranking, etc", "% Regulatory Compliance"] },
    { num: 5, title: "Operations & Transformations", items: ["Process Improvement Projects", "% Process Improvement Projects Implemented", "Savings"] },
    { num: 6, title: "Sustainability & Impact", items: ["Count of SDG-Aligned Projects", "Impact Indicators"] },
  ],
  administration: [
    { num: 1, title: "People & Administrative Performance", items: ["e-AEPA", "Office Satisfaction Rating", "Research - Scopus Indexed (% or count)"] },
    { num: 2, title: "Performance Achievement", items: ["Overall KPI Achievement", "Accomplishment Rate", "Reporting/Submission Compliance", "Implementation Rate of Action Plans"] },
    { num: 3, title: "Strategic Performance", items: ["Balance Scorecard", "Attainment of Strategic Objectives"] },
    { num: 4, title: "Compliance", items: ["Report Submission Rate", "% Readiness - Accreditation, Certification, Ranking, etc", "% Regulatory Compliance"] },
    { num: 5, title: "Operations & Transformations", items: ["Process Improvement Projects", "% Process Improvement Projects Implemented", "Savings"] },
    { num: 6, title: "Sustainability & Impact", items: ["Count of SDG-Aligned Projects", "Impact Indicators"] },
  ],
};

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
      getRecentActivity(profile.unit_id, 6),
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

    return (
      <AppShell profile={profile} title="My Dashboard" activeHref="/dashboard">
        <div className="p-6 max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{profile.unit_name ?? "My Office"}</h1>
              <p className="text-sm text-gray-400 mt-0.5">Office dashboard · SY {displaySY}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* SY filter */}
              <Suspense fallback={<div className="h-9 w-36 bg-gray-100 rounded-lg animate-pulse" />}>
                <OfficeUserSYFilter sy={sy ?? ""} syOptions={syOptions} />
              </Suspense>
              <Link
                href={`/repository/${profile.unit_id}`}
                className="text-xs font-medium text-maroon border border-maroon/30 hover:bg-maroon/5 rounded-lg px-3 py-1.5 transition-colors"
              >
                Go to Repository →
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Documents */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total Documents</span>
                <div className="w-7 h-7 rounded-lg bg-maroon/10 flex items-center justify-center text-maroon">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800">{totalDocs}</div>
              <p className="text-xs text-gray-400 mt-1">All active documents</p>
            </div>

            {/* This School Year */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Submitted SY {displaySY}</span>
                <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center" style={{ color: "#c9a84c" }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800">{thisYearDocs}</div>
              <p className="text-xs text-gray-400 mt-1">
                {lastUpload ? `Last upload ${ouDaysSince(lastUpload)}` : "No uploads yet this SY"}
              </p>
            </div>

            {/* Folders Complete */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Folders Complete</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${submissionRate === 100 ? "bg-green-50 text-green-600" : submissionRate >= 50 ? "bg-gold/10 text-gold" : "bg-red-50 text-red-500"}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h3.586a1 1 0 01.707.293L11 7h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
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

          {/* Two-column: submission status + recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Folder Submission Status */}
            <div className="lg:col-span-3 card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Folder Submission Status</h2>
                <span className="text-xs text-gray-400">SY {displaySY}</span>
              </div>

              {folderStats.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No folders configured yet.</p>
              ) : (
                <div className="space-y-4">
                  {folderStats.map((f) => (
                    <OUFolderProgressRow key={f.id} folder={f} unitId={profile.unit_id!} />
                  ))}
                </div>
              )}

              {folderStats.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />Submitted</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#c9a84c" }} />Has older docs</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" />No files</span>
                  </div>
                  <div className="text-xs font-semibold" style={{ color: submissionRate === 100 ? "#16a34a" : submissionRate >= 50 ? "#c9a84c" : "#ef4444" }}>
                    {submissionRate}% complete
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 card p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Recent Activity</h2>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item) => (
                    <OUActivityItem key={item.id} item={item} />
                  ))}
                </div>
              )}
              {recentActivity.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Link href={`/repository/${profile.unit_id}`} className="text-xs text-maroon hover:underline font-medium">
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
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {folderStats.map((f) => {
                  const status = f.thisYearCount > 0 ? "submitted" : f.activeDocumentCount > 0 ? "older" : "empty";
                  return (
                    <tr key={f.id} className="border-b border-gray-50 hover:bg-maroon/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/repository/${profile.unit_id}/${f.id}`} className="text-maroon font-medium hover:underline">
                          {f.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-700">{f.thisYearCount}</td>
                      <td className="px-5 py-3 text-gray-400">{f.activeDocumentCount}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {f.lastUpdate ? ouDaysSince(f.lastUpdate) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {status === "submitted" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Submitted
                          </span>
                        ) : status === "older" ? (
                          <span className="inline-flex items-center gap-1 text-xs rounded-full font-medium px-2 py-0.5" style={{ color: "#92690e", background: "rgba(201,168,76,0.12)" }}>
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#c9a84c" }} />Needs update
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />No files
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/repository/${profile.unit_id}/${f.id}`}
                          className="text-xs font-medium text-maroon hover:underline"
                        >
                          {f.thisYearCount === 0 ? "Upload →" : "View →"}
                        </Link>
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

  // ── QAO: university-wide dashboard ──────────────────────────────────────────
  const { branch, sy, search } = await searchParams;
  const validBranch = branch === "academics" || branch === "administration" ? branch : undefined;
  const activeSY = sy || defaultSY;
  const searchQ = (search ?? "").toLowerCase().trim();
  const syOptions = buildSchoolYearOptions();

  const allSummaries = await getUnitSummaries(validBranch, activeSY);

  // Filter by search query
  const summaries = searchQ
    ? allSummaries.filter((u) => u.name.toLowerCase().includes(searchQ))
    : allSummaries;

  // Derived stats (on full set, not search-filtered for KPIs)
  const totalUnits = allSummaries.length;
  const withSubmissions = allSummaries.filter((u) => u.thisYearCount > 0).length;
  const noSubmissions = totalUnits - withSubmissions;
  const submissionRate = totalUnits > 0 ? Math.round((withSubmissions / totalUnits) * 100) : 0;
  const totalDocsThisSY = allSummaries.reduce((s, u) => s + u.thisYearCount, 0);
  const totalDocsAcademics = allSummaries.filter((u) => u.branch === "academics").reduce((s, u) => s + u.thisYearCount, 0);
  const totalDocsAdmin = allSummaries.filter((u) => u.branch === "administration").reduce((s, u) => s + u.thisYearCount, 0);

  // Units with no submissions sorted by last update (longest gap first)
  const noFileUnits = allSummaries
    .filter((u) => u.thisYearCount === 0)
    .sort((a, b) => {
      if (!a.lastUpdate && !b.lastUpdate) return 0;
      if (!a.lastUpdate) return -1;
      if (!b.lastUpdate) return 1;
      return new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime();
    });

  const longestGapUnit = noFileUnits[0];
  const longestGapDays = longestGapUnit?.lastUpdate
    ? Math.floor((Date.now() - new Date(longestGapUnit.lastUpdate).getTime()) / 86400000)
    : null;

  // Bar chart — top units by doc count for selected SY
  const barData = [...allSummaries]
    .sort((a, b) => b.thisYearCount - a.thisYearCount)
    .slice(0, 12);
  const maxBar = Math.max(...barData.map((u) => u.thisYearCount), 1);

  // Abbreviated name for bar chart labels
  function abbrev(name: string) {
    const STOPS = ["of", "and", "the", "&"];
    return name
      .split(" ")
      .filter((w) => !STOPS.includes(w.toLowerCase()))
      .slice(0, 4)
      .map((w) => (w.length > 10 ? w.slice(0, 9) + "…" : w))
      .join(" ");
  }

  // Days since last upload helper
  function daysSince(dateStr: string | null): string {
    if (!dateStr) return "Never";
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  // SVG ring constants
  const R = 36, CIRC = 2 * Math.PI * R;
  const rateOffset = CIRC - (submissionRate / 100) * CIRC;

  return (
    <AppShell profile={profile} title="University Dashboard">
      <div className="p-6 max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>University overview</h1>
            <p className="text-sm text-gray-400 mt-0.5">Submission activity across all colleges and offices</p>
          </div>
          <Suspense fallback={<div className="h-9 w-72 bg-gray-100 rounded-lg animate-pulse" />}>
            <DashboardFilterBar sy={activeSY} branch={branch ?? ""} search={search ?? ""} syOptions={syOptions} />
          </Suspense>
        </div>

        {/* ── KPI Cards row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Submission rate — with SVG ring */}
          <div className="card p-5 flex gap-5 items-center">
            <div className="relative shrink-0 w-20 h-20">
              <svg width="80" height="80" viewBox="0 0 88 88" className="-rotate-90">
                <circle cx="44" cy="44" r={R} fill="none" stroke="#f0f0f0" strokeWidth="8" />
                <circle
                  cx="44" cy="44" r={R} fill="none"
                  stroke={submissionRate >= 80 ? "#7A1330" : submissionRate >= 50 ? "#B8892B" : "#ef4444"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={rateOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-800 leading-none">{submissionRate}<span className="text-xs font-semibold text-gray-400">%</span></span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Submission rate</p>
              <p className="text-2xl font-bold text-gray-900">{submissionRate}%</p>
              <p className="text-xs text-gray-400 mt-0.5">{withSubmissions} of {totalUnits} units submitted this SY</p>
            </div>
          </div>

          {/* Documents this SY */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Documents, SY {activeSY}</p>
            <p className="text-3xl font-bold text-gray-900">{totalDocsThisSY.toLocaleString()}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-maroon inline-block" />
                <span className="text-xs text-gray-500 font-medium">{totalDocsAcademics.toLocaleString()}</span>
                <span className="text-xs text-gray-400">Academics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gold inline-block" />
                <span className="text-xs text-gray-500 font-medium">{totalDocsAdmin.toLocaleString()}</span>
                <span className="text-xs text-gray-400">Administration</span>
              </div>
            </div>
          </div>

          {/* Units with no submissions */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Units with no submissions</p>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-gray-900">{noSubmissions}</p>
              {noSubmissions > 0 && (
                <span className="mb-0.5 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Needs follow-up</span>
              )}
              {noSubmissions === 0 && (
                <span className="mb-0.5 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">All submitted</span>
              )}
            </div>
            {longestGapUnit && longestGapDays !== null && (
              <p className="text-xs text-gray-400 mt-2">
                Longest gap:{" "}
                <Link href={`/dashboard/office/${longestGapUnit.id}`} className="text-maroon hover:underline font-medium">
                  {abbrev(longestGapUnit.name)}
                </Link>
                , {longestGapDays} days
              </p>
            )}
            {noFileUnits.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                {noFileUnits.slice(0, 3).map((u) => (
                  <Link key={u.id} href={`/dashboard/office/${u.id}`} className="flex items-center justify-between group">
                    <span className="text-xs text-gray-600 group-hover:text-maroon transition-colors truncate">{u.name}</span>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2 group-hover:text-maroon transition-colors">View →</span>
                  </Link>
                ))}
                {noFileUnits.length > 3 && (
                  <p className="text-[10px] text-gray-400">+{noFileUnits.length - 3} more</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Main content: bar chart + unit list ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">

          {/* Bar chart */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Documents per unit <span className="text-xs font-normal text-gray-400 ml-1">SY {activeSY}</span></h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-maroon inline-block" /><span className="text-xs text-gray-400">Academics</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gold inline-block" /><span className="text-xs text-gray-400">Administration</span></div>
              </div>
            </div>
            {barData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No data for this period.</p>
            ) : (
              <div className="space-y-2">
                {barData.map((u) => (
                  <Link
                    key={u.id}
                    href={`/dashboard/office/${u.id}`}
                    className="flex items-center gap-3 group rounded-lg px-1 py-0.5 -mx-1 hover:bg-gray-50 transition-colors"
                    title={`View ${u.name} dashboard`}
                  >
                    <span className="text-xs text-gray-500 group-hover:text-maroon transition-colors w-36 shrink-0 truncate text-right">
                      {abbrev(u.name)}
                    </span>
                    <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all group-hover:opacity-80 ${u.branch === "academics" ? "bg-maroon" : "bg-gold"}`}
                        style={{ width: `${Math.max((u.thisYearCount / maxBar) * 100, u.thisYearCount > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 font-medium w-6 text-right shrink-0">{u.thisYearCount}</span>
                    <svg className="w-3 h-3 text-gray-300 group-hover:text-maroon transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Units table */}
          <div className="card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Units</h2>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-400">
                  {searchQ ? `${summaries.length} result${summaries.length !== 1 ? "s" : ""}` : `${totalUnits} total`}
                </span>
              </div>
            </div>
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 420 }}>
              {summaries.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No units match your search.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Unit</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">This SY</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-maroon/[0.025] transition-colors group cursor-pointer">
                        <td className="px-4 py-2.5">
                          <Link href={`/dashboard/office/${u.id}`} className="font-medium text-gray-800 group-hover:text-maroon transition-colors text-xs leading-tight block">
                            {u.name}
                          </Link>
                          <span className="text-[10px] text-gray-400">
                            {u.branch === "academics" ? "Academics" : "Administration"}{u.lastUpdate ? `, last upload ${daysSince(u.lastUpdate)}` : ""}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-sm font-semibold text-gray-700">{u.thisYearCount}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          {u.thisYearCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block shrink-0" />Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block shrink-0" />No files
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <Link
                            href={`/dashboard/office/${u.id}`}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-300 group-hover:text-maroon transition-colors"
                          >
                            View
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── KPI Framework ── */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold text-gray-700">KPI framework</h2>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Reference, not live data</span>
          </div>
          <p className="text-xs text-gray-400 mb-5">The indicators QAO evaluates units against. Definitions are maintained by the Quality Assurance Office and updated at the start of each school year.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { num: "01", title: "Documentation completeness", desc: "Share of required folders holding at least one current-year document.", target: "Target 100%" },
              { num: "02", title: "Submission timeliness", desc: "Documents filed on or before the semestral cut-off date.", target: "Target 95%" },
              { num: "03", title: "Version currency", desc: "Evidence revised within the last two school years.", target: "Target 90%" },
              { num: "04", title: "Audit readiness", desc: "Units passing internal QAO spot-checks without findings.", target: "Target 85%" },
            ].map((k) => (
              <div key={k.num} className="border border-gray-100 rounded-xl p-4 space-y-1.5">
                <p className="text-[10px] font-semibold text-teal uppercase tracking-widest">KPI {k.num}</p>
                <p className="text-sm font-semibold text-gray-800 leading-snug">{k.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{k.desc}</p>
                <p className="text-xs font-semibold text-gray-500">{k.target}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}

function StatCard({ label, value, sub, icon, accent }: { label: string; value: string; sub: string; icon: "rate" | "doc" | "folder"; accent: "gold" | "maroon" | "red" | "green" }) {
  const accentMap = { gold: "bg-gold/10 text-gold", maroon: "bg-maroon/10 text-maroon", red: "bg-red-50 text-red-500", green: "bg-green-50 text-green-600" };
  const icons = {
    rate: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    doc: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    folder: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h3.586a1 1 0 01.707.293L11 7h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>,
  };
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>{icons[icon]}</div>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

// ── Office-user dashboard helpers ────────────────────────────────────────────

function ouDaysSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function OUFolderProgressRow({ folder, unitId }: { folder: FolderStat; unitId: string }) {
  const status = folder.thisYearCount > 0 ? "submitted" : folder.activeDocumentCount > 0 ? "older" : "empty";
  const fillColor = status === "submitted" ? "#22c55e" : status === "older" ? "#c9a84c" : "#e5e7eb";
  const fillPct = status === "empty" ? 0
    : status === "submitted" ? Math.max(8, folder.activeDocumentCount > 0 ? (folder.thisYearCount / folder.activeDocumentCount) * 100 : 100)
    : 30;

  return (
    <Link href={`/repository/${unitId}/${folder.id}`} className="block group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-700 font-medium group-hover:text-maroon transition-colors truncate flex-1 mr-2">
          {folder.name}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">
            {folder.thisYearCount > 0
              ? `${folder.thisYearCount} filed this SY`
              : folder.activeDocumentCount > 0
              ? `${folder.activeDocumentCount} doc${folder.activeDocumentCount !== 1 ? "s" : ""} — needs update`
              : "No documents yet"}
          </span>
          {status === "submitted" ? (
            <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">Done</span>
          ) : status === "older" ? (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color: "#92690e", background: "rgba(201,168,76,0.12)" }}>Update</span>
          ) : (
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Empty</span>
          )}
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: fillColor }} />
      </div>
    </Link>
  );
}

function OUActivityItem({ item }: { item: RecentActivityItem }) {
  const isNew = item.version === 1;
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isNew ? "bg-green-50 text-green-600" : "bg-gold/10"}`}
        style={!isNew ? { color: "#c9a84c" } : {}}>
        {isNew ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
        ) : (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate">{item.title}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.folder_name}</p>
        <p className="text-[11px] text-gray-300 mt-0.5">{ouDaysSince(item.created_at)}</p>
      </div>
      {item.version > 1 && (
        <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">v{item.version}</span>
      )}
    </div>
  );
}

