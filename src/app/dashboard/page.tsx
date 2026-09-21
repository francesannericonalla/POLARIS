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
import { AppShell } from "@/components/app-shell";
import Link from "next/link";
import { DashboardFilterBar } from "./dashboard-filter-bar";
import { OfficeUserSYFilter } from "./office-user-sy-filter";

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

    return (
      <AppShell profile={profile} title="My Dashboard" activeHref="/dashboard">
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-7">

          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">My Dashboard</p>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
                {profile.unit_name ?? "My Office"}
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Suspense fallback={<div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />}>
                <OfficeUserSYFilter sy={sy ?? ""} syOptions={syOptions} />
              </Suspense>
              <Link
                href={`/repository/${profile.unit_id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-maroon hover:bg-maroon-dark rounded-lg px-4 py-2 transition-colors"
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
            <OUStatCard
              label="Total Documents"
              value={totalDocs}
              sub="All active files"
              color="maroon"
            />
            <OUStatCard
              label={`Filed SY ${displaySY}`}
              value={thisYearDocs}
              sub={lastUpload ? `Last upload ${ouDaysSince(lastUpload)}` : "No uploads yet"}
              color="gold"
            />
            <OUStatCard
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
                <span className="text-xs text-gray-400">SY {displaySY}</span>
              </div>
              <div className="px-5 py-4 space-y-5">
                {folderStats.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No folders configured yet.</p>
                ) : (
                  folderStats.map((f) => <OUFolderRow key={f.id} folder={f} unitId={profile.unit_id!} />)
                )}
              </div>
              {folderStats.length > 0 && (
                <div className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Filed this SY</span>
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
                    {recentActivity.map((item) => <OUActivityItem key={item.id} item={item} />)}
                  </div>
                )}
              </div>
              {recentActivity.length > 0 && (
                <div className="px-5 py-3">
                  <Link href={`/repository/${profile.unit_id}`} className="text-xs font-semibold text-maroon hover:underline">
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
                    const status = f.thisYearCount > 0 ? "submitted" : f.activeDocumentCount > 0 ? "older" : "empty";
                    return (
                      <tr key={f.id} className="hover:bg-maroon/[0.018] transition-colors">
                        <td className="px-5 py-3.5">
                          <Link href={`/repository/${profile.unit_id}/${f.id}`} className="font-medium text-gray-800 hover:text-maroon transition-colors">
                            {f.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-center text-gray-700">{f.thisYearCount}</td>
                        <td className="px-4 py-3.5 text-center text-gray-400">{f.activeDocumentCount}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">{f.lastUpdate ? ouDaysSince(f.lastUpdate) : "—"}</td>
                        <td className="px-4 py-3.5">
                          {status === "submitted" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block shrink-0" />Filed
                            </span>
                          ) : status === "older" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#b07d2a" }}>
                              <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: "#c9a84c" }} />Outdated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block shrink-0" />Empty
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Link
                            href={`/repository/${profile.unit_id}/${f.id}`}
                            className="inline-flex items-center justify-center w-16 text-xs font-semibold text-maroon border border-maroon/25 hover:bg-maroon hover:text-white hover:border-maroon rounded-md py-1 transition-colors"
                          >
                            {f.thisYearCount === 0 ? "Upload" : "View"}
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

  // ── QAO: university-wide dashboard ──────────────────────────────────────────
  const { branch, sy, search } = await searchParams;
  const validBranch = branch === "academics" || branch === "administration" ? branch : undefined;
  const activeSY = sy || defaultSY;
  const searchQ = (search ?? "").toLowerCase().trim();
  const syOptions = buildSchoolYearOptions();

  const [allSummaries, folderStats] = await Promise.all([
    getUnitSummaries(validBranch, activeSY),
    getFolderSubmissionStats(activeSY),
  ]);

  const summaries = searchQ
    ? allSummaries.filter((u) => u.name.toLowerCase().includes(searchQ))
    : allSummaries;

  const totalUnits = allSummaries.length;
  const withSubmissions = allSummaries.filter((u) => u.thisYearCount > 0).length;
  const noSubmissions = totalUnits - withSubmissions;
  const submissionRate = totalUnits > 0 ? Math.round((withSubmissions / totalUnits) * 100) : 0;
  const totalDocsThisSY = allSummaries.reduce((s, u) => s + u.thisYearCount, 0);
  const totalDocsAcademics = allSummaries.filter((u) => u.branch === "academics").reduce((s, u) => s + u.thisYearCount, 0);
  const totalDocsAdmin = allSummaries.filter((u) => u.branch === "administration").reduce((s, u) => s + u.thisYearCount, 0);

  const barData = [...allSummaries]
    .sort((a, b) => b.thisYearCount - a.thisYearCount)
    .slice(0, 12);
  const maxBar = Math.max(...barData.map((u) => u.thisYearCount), 1);

  function abbrev(name: string) {
    const STOPS = ["of", "and", "the", "&"];
    return name
      .split(" ")
      .filter((w) => !STOPS.includes(w.toLowerCase()))
      .slice(0, 4)
      .map((w) => (w.length > 10 ? w.slice(0, 9) + "…" : w))
      .join(" ");
  }

  function daysSince(dateStr: string | null): string {
    if (!dateStr) return "Never";
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  const R = 36, CIRC = 2 * Math.PI * R;
  const rateOffset = CIRC - (submissionRate / 100) * CIRC;
  const ringColor = submissionRate >= 80 ? "#16a34a" : submissionRate >= 50 ? "#B8892B" : "#ef4444";

  return (
    <AppShell profile={profile} title="University Dashboard">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">QAO Dashboard</p>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
              University Overview
            </h1>
          </div>
          <Suspense fallback={<div className="h-9 w-72 bg-gray-100 rounded-lg animate-pulse" />}>
            <DashboardFilterBar sy={activeSY} branch={branch ?? ""} search={search ?? ""} syOptions={syOptions} />
          </Suspense>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Submission rate */}
          <div className="card p-5">
            <div className="flex items-center gap-1.5 mb-4">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ringColor }} />
              <span className="text-xs font-medium text-gray-500">Submission Rate</span>
            </div>
            <div className="flex items-end gap-4">
              <p className="text-3xl font-bold text-gray-900">{submissionRate}%</p>
              <div className="relative w-10 h-10 mb-0.5 shrink-0">
                <svg width="40" height="40" viewBox="0 0 88 88" className="-rotate-90">
                  <circle cx="44" cy="44" r={R} fill="none" stroke="#f0f0f0" strokeWidth="10" />
                  <circle cx="44" cy="44" r={R} fill="none" stroke={ringColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={rateOffset} />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{withSubmissions} of {totalUnits} offices filed</p>
          </div>

          {/* Documents this SY */}
          <div className="card p-5">
            <div className="flex items-center gap-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-maroon shrink-0" />
              <span className="text-xs font-medium text-gray-500">Documents · SY {activeSY}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{totalDocsThisSY.toLocaleString()}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-sm bg-maroon inline-block" />{totalDocsAcademics} Academics
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-sm bg-gold inline-block" />{totalDocsAdmin} Admin
              </span>
            </div>
          </div>

          {/* Pending offices */}
          <div className="card p-5">
            <div className="flex items-center gap-1.5 mb-4">
              <span className={`w-2 h-2 rounded-full shrink-0 ${noSubmissions > 0 ? "bg-red-400" : "bg-green-500"}`} />
              <span className="text-xs font-medium text-gray-500">No Submissions Yet</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{noSubmissions}</p>
            <p className="text-xs text-gray-400">
              {noSubmissions === 0 ? "All offices have filed" : `${noSubmissions} office${noSubmissions !== 1 ? "s" : ""} still pending`}
            </p>
          </div>
        </div>

        {/* Bar chart + units table */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

          {/* Bar chart */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                Documents per office
                <span className="ml-2 text-xs font-normal text-gray-400">SY {activeSY}</span>
              </h2>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] text-gray-400"><span className="w-2.5 h-2.5 rounded-sm bg-maroon inline-block" />Academics</span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-400"><span className="w-2.5 h-2.5 rounded-sm bg-gold inline-block" />Admin</span>
              </div>
            </div>
            <div className="p-5">
              {barData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No submissions for this period.</p>
              ) : (
                <div className="space-y-2.5">
                  {barData.map((u) => (
                    <Link
                      key={u.id}
                      href={`/dashboard/office/${u.id}`}
                      className="flex items-center gap-3 group rounded-lg py-0.5 hover:bg-gray-50 transition-colors -mx-1 px-1"
                    >
                      <span className="text-xs text-gray-500 group-hover:text-maroon transition-colors w-32 shrink-0 truncate text-right leading-tight">
                        {abbrev(u.name)}
                      </span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-md overflow-hidden">
                        <div
                          className={`h-full rounded-md transition-all ${u.branch === "academics" ? "bg-maroon" : "bg-gold"}`}
                          style={{ width: `${Math.max((u.thisYearCount / maxBar) * 100, u.thisYearCount > 0 ? 2 : 0)}%`, opacity: 0.85 }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 w-5 text-right shrink-0">{u.thisYearCount}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Units table */}
          <div className="card overflow-hidden flex flex-col">
            <div className="px-4 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">All Offices</h2>
              <span className="text-[11px] text-gray-400">
                {searchQ ? `${summaries.length} result${summaries.length !== 1 ? "s" : ""}` : `${totalUnits} total`}
              </span>
            </div>
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 400 }}>
              {summaries.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No results.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10 border-b border-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Office</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Filed</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {summaries.map((u) => (
                      <tr key={u.id} className="hover:bg-maroon/[0.02] transition-colors group">
                        <td className="px-4 py-2.5">
                          <Link href={`/dashboard/office/${u.id}`} className="block">
                            <span className="text-xs font-medium text-gray-800 group-hover:text-maroon transition-colors leading-tight block">{u.name}</span>
                            <span className="text-[10px] text-gray-400">
                              {u.branch === "academics" ? "Academics" : "Admin"}
                              {u.lastUpdate ? ` · ${daysSince(u.lastUpdate)}` : ""}
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-sm font-bold text-gray-800">{u.thisYearCount}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          {u.thisYearCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Filed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Folder coverage */}
        <FolderCoverageSection stats={folderStats} activeSY={activeSY} branch={validBranch} />

        {/* KPI framework */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-semibold text-gray-800">KPI Framework</h2>
            <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Reference only</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { num: "01", title: "Documentation completeness", desc: "All required folders have a current-year submission.", target: "100%" },
              { num: "02", title: "Submission timeliness", desc: "Documents filed before the semestral cut-off.", target: "95%" },
              { num: "03", title: "Version currency", desc: "Evidence revised within the last two school years.", target: "90%" },
              { num: "04", title: "Audit readiness", desc: "Units passing QAO spot-checks without findings.", target: "85%" },
            ].map((k) => (
              <div key={k.num} className="rounded-xl border border-gray-100 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal uppercase tracking-widest">KPI {k.num}</span>
                  <span className="text-xs font-bold text-gray-800">{k.target}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-snug">{k.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{k.desc}</p>
              </div>
            ))}
          </div>
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

function OUStatCard({ label, value, sub, color }: {
  label: string;
  value: string | number;
  sub: string;
  color: "maroon" | "gold" | "green" | "red";
}) {
  const dot = {
    maroon: "bg-maroon",
    gold:   "bg-gold",
    green:  "bg-green-500",
    red:    "bg-red-400",
  }[color];

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

function OUFolderRow({ folder, unitId }: { folder: FolderStat; unitId: string }) {
  const status = folder.thisYearCount > 0 ? "filed" : folder.activeDocumentCount > 0 ? "outdated" : "empty";
  const bar = { filed: { color: "#22c55e", pct: 100 }, outdated: { color: "#c9a84c", pct: 40 }, empty: { color: "#e5e7eb", pct: 0 } }[status];

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

function OUActivityItem({ item }: { item: RecentActivityItem }) {
  const isNew = item.version === 1;
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isNew ? "bg-green-50 text-green-600" : "bg-gold/10"}`}
        style={!isNew ? { color: "#c9a84c" } : {}}>
        {isNew ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.folder_name}</p>
        <p className="text-[11px] text-gray-300 mt-0.5">{ouDaysSince(item.created_at)}</p>
      </div>
      {item.version > 1 && (
        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">v{item.version}</span>
      )}
    </div>
  );
}

// ── Folder coverage section ───────────────────────────────────────────────────

function FolderCoverageSection({
  stats,
  activeSY,
  branch,
}: {
  stats: FolderSubmissionStat[];
  activeSY: string;
  branch?: "academics" | "administration";
}) {
  const academicsStats = stats.filter((s) => s.branch === "academics");
  const adminStats = stats.filter((s) => s.branch === "administration");

  const showAcademics = !branch || branch === "academics";
  const showAdmin = !branch || branch === "administration";

  if (academicsStats.length === 0 && adminStats.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-gray-800">
          Folder Coverage
          <span className="ml-2 text-xs font-normal text-gray-400">SY {activeSY}</span>
        </h2>
      </div>
      <div className={`grid gap-4 ${showAcademics && showAdmin ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {showAcademics && academicsStats.length > 0 && (
          <FolderCoveragePanel
            title="Academics"
            subtitle={`${academicsStats[0]?.total ?? 0} departments`}
            stats={academicsStats}
            accentColor="bg-maroon"
          />
        )}
        {showAdmin && adminStats.length > 0 && (
          <FolderCoveragePanel
            title="Administration"
            subtitle={`${adminStats[0]?.total ?? 0} offices`}
            stats={adminStats}
            accentColor="bg-gold"
          />
        )}
      </div>
    </div>
  );
}

function FolderCoveragePanel({
  title,
  subtitle,
  stats,
  accentColor,
}: {
  title: string;
  subtitle: string;
  stats: FolderSubmissionStat[];
  accentColor: string;
}) {
  return (
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
          return (
            <div key={s.folder_name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-700 truncate mr-3">{s.folder_name}</span>
                <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: pct === 0 ? "#9ca3af" : barColor }}>
                  {s.submitted}<span className="font-normal text-gray-300"> / {s.total}</span>
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
