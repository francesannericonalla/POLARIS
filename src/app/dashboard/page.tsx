import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getUnitSummaries, getUnitFolderStats, currentSchoolYear, type FolderStat } from "@/lib/data/dashboard";
import { AppShell } from "@/components/app-shell";
import Link from "next/link";

const BRANCH_LABEL: Record<string, string> = { academics: "Academics", administration: "Administration" };

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
  searchParams: Promise<{ branch?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (profile.role === "system_admin") redirect("/admin/accounts");

  const sy = currentSchoolYear();

  // ── Office user: show their own unit's dashboard ──────────────────────────
  if (profile.role === "office_user") {
    if (!profile.unit_id) redirect("/pending");

    const folderStats = await getUnitFolderStats(profile.unit_id);
    const totalDocs = folderStats.reduce((s, f) => s + f.activeDocumentCount, 0);
    const thisYearDocs = folderStats.reduce((s, f) => s + f.thisYearCount, 0);
    const foldersWithDocs = folderStats.filter((f) => f.thisYearCount > 0).length;
    const maxCount = Math.max(...folderStats.map((f) => f.activeDocumentCount), 1);

    // Determine branch from unit for KPI panel — fall back to administration
    const kpiCats = KPI_CATEGORIES.administration;

    return (
      <AppShell profile={profile} title="My Dashboard">
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-lg font-semibold text-gray-800">{profile.unit_name ?? "My Office"}</h1>
            <p className="text-sm text-gray-400 mt-0.5">School Year {sy} &mdash; Document Overview</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Total Documents" value={String(totalDocs)} sub="All active documents" icon="doc" accent="maroon" />
            <KpiCard label="Submitted This SY" value={String(thisYearDocs)} sub={`Uploaded in ${sy}`} icon="rate" accent="gold" />
            <KpiCard
              label="Folders Active"
              value={`${foldersWithDocs}/${folderStats.length}`}
              sub="Folders with submissions this SY"
              icon="folder"
              accent={foldersWithDocs === folderStats.length ? "green" : foldersWithDocs > 0 ? "gold" : "red"}
            />
          </div>

          {/* Folder bar chart */}
          <div className="card p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Documents per Folder</h2>
            {folderStats.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No folders set up for this unit yet.</p>
            ) : (
              <div className="space-y-3">
                {folderStats.map((f) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <Link
                      href={`/repository/${profile.unit_id}/${f.id}`}
                      className="text-xs text-gray-600 hover:text-maroon transition-colors w-40 shrink-0 truncate text-right"
                      title={f.name}
                    >
                      {f.name}
                    </Link>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-maroon transition-all"
                        style={{ width: `${Math.max((f.activeDocumentCount / maxCount) * 100, f.activeDocumentCount > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-6 text-right shrink-0">{f.activeDocumentCount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Folder detail table */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Folder</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">This SY</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">All Docs</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Last Upload</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {folderStats.map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-maroon/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/repository/${profile.unit_id}/${f.id}`} className="text-maroon font-medium hover:underline">
                        {f.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{f.thisYearCount}</td>
                    <td className="px-4 py-3 text-gray-400">{f.activeDocumentCount}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {f.lastUpdate ? new Date(f.lastUpdate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {f.thisYearCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                          No submission
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* KPI Framework */}
          <div className="card p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">KPI Framework Reference</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {kpiCats.map((cat) => (
                <div key={cat.num}>
                  <p className="text-xs font-semibold text-maroon mb-1">{cat.num}. {cat.title}</p>
                  <ul className="space-y-0.5 pl-3">
                    {cat.items.map((item) => (
                      <li key={item} className="text-xs text-gray-500 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── QAO: org-wide dashboard ───────────────────────────────────────────────
  const { branch } = await searchParams;
  const validBranch = branch === "academics" || branch === "administration" ? branch : undefined;
  const summaries = await getUnitSummaries(validBranch);

  const totalUnits = summaries.length;
  const withSubmissions = summaries.filter((u) => u.thisYearCount > 0).length;
  const noSubmissions = totalUnits - withSubmissions;
  const submissionRate = totalUnits > 0 ? Math.round((withSubmissions / totalUnits) * 100) : 0;
  const totalThisYear = summaries.reduce((s, u) => s + u.thisYearCount, 0);
  const maxDocs = Math.max(...summaries.map((u) => u.activeDocumentCount), 1);

  return (
    <AppShell profile={profile} title="QAO Dashboard">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Analytics & Reporting</h1>
          <p className="text-sm text-gray-400 mt-0.5">School Year {sy} &mdash; All Units</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Submission Rate" value={`${submissionRate}%`} sub={`${withSubmissions} of ${totalUnits} units submitted this SY`} icon="rate" accent="gold" />
          <KpiCard label="Active This SY" value={String(totalThisYear)} sub={`Documents uploaded in ${sy}`} icon="doc" accent="maroon" />
          <KpiCard label="No Submissions" value={String(noSubmissions)} sub="Units with no docs this school year" icon="alert" accent={noSubmissions > 0 ? "red" : "green"} />
        </div>

        <div className="flex items-center gap-1 border-b border-gray-200">
          <FilterTab label="All" href="/dashboard" active={!validBranch} />
          <FilterTab label="Academics" href="/dashboard?branch=academics" active={validBranch === "academics"} />
          <FilterTab label="Administration" href="/dashboard?branch=administration" active={validBranch === "administration"} />
        </div>

        <div className="card p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Document Count per Unit (All Time)</h2>
          <div className="space-y-2">
            {summaries
              .sort((a, b) => b.activeDocumentCount - a.activeDocumentCount)
              .slice(0, 15)
              .map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <Link href={`/repository/${u.id}`} className="text-xs text-gray-600 hover:text-maroon transition-colors w-36 shrink-0 truncate text-right" title={u.name}>
                    {u.name}
                  </Link>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${u.branch === "academics" ? "bg-maroon" : "bg-amber-400"}`}
                      style={{ width: `${Math.max((u.activeDocumentCount / maxDocs) * 100, u.activeDocumentCount > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right shrink-0">{u.activeDocumentCount}</span>
                </div>
              ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-maroon inline-block" /><span className="text-xs text-gray-400">Academics</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /><span className="text-xs text-gray-400">Administration</span></div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Office / Department</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Branch</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">This SY</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">All Docs</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Last Update</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-maroon/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/repository/${u.id}`} className="text-maroon font-medium hover:underline">{u.name}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${u.branch === "academics" ? "bg-maroon/10 text-maroon" : "bg-amber-50 text-amber-700"}`}>
                      {BRANCH_LABEL[u.branch]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-medium">{u.thisYearCount}</td>
                  <td className="px-4 py-3 text-gray-400">{u.activeDocumentCount}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.lastUpdate ? new Date(u.lastUpdate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    {u.thisYearCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Submitted</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />No submission</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">KPI Framework Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KpiColumn title="Academic" categories={KPI_CATEGORIES.academics} />
            <KpiColumn title="Administration" categories={KPI_CATEGORIES.administration} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function KpiColumn({ title, categories }: { title: string; categories: { num: number; title: string; items: string[] }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.num}>
            <p className="text-xs font-semibold text-maroon mb-1">{cat.num}. {cat.title}</p>
            <ul className="space-y-0.5 pl-3">
              {cat.items.map((item) => (
                <li key={item} className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterTab({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link href={href} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${active ? "border-gold text-maroon" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
      {label}
    </Link>
  );
}

function KpiCard({ label, value, sub, icon, accent }: { label: string; value: string; sub: string; icon: "rate" | "doc" | "alert" | "folder"; accent: "gold" | "maroon" | "red" | "green" }) {
  const accentMap = { gold: "bg-gold/10 text-gold", maroon: "bg-maroon/10 text-maroon", red: "bg-red-50 text-red-500", green: "bg-green-50 text-green-600" };
  const icons = {
    rate: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    doc: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    alert: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
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
