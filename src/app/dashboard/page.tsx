import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getUnitSummaries } from "@/lib/data/dashboard";
import { AppShell } from "@/components/app-shell";
import Link from "next/link";

const BRANCH_LABEL: Record<string, string> = { academics: "Academics", administration: "Administration" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (profile.role === "system_admin") redirect("/admin/accounts");
  if (profile.role === "office_user") {
    if (!profile.unit_id) redirect("/pending");
    redirect(`/repository/${profile.unit_id}`);
  }

  const { branch } = await searchParams;
  const validBranch = branch === "academics" || branch === "administration" ? branch : undefined;
  const summaries = await getUnitSummaries(validBranch);

  const totalDocs = summaries.reduce((sum, u) => sum + u.activeDocumentCount, 0);
  const unitsWithDocs = summaries.filter((u) => u.activeDocumentCount > 0).length;

  return (
    <AppShell profile={profile} title="QAO Dashboard — All Offices">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterLink label="All" href="/dashboard" active={!validBranch} />
          <FilterLink label="Academics" href="/dashboard?branch=academics" active={validBranch === "academics"} />
          <FilterLink
            label="Administration"
            href="/dashboard?branch=administration"
            active={validBranch === "administration"}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard label="Offices/Departments Tracked" value={String(summaries.length)} />
          <KpiCard label="Units With At Least 1 Submission" value={String(unitsWithDocs)} />
          <KpiCard label="Total Active Documents" value={String(totalDocs)} />
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-maroon text-white text-left">
                <th className="px-4 py-3 font-semibold">Office / Department</th>
                <th className="px-4 py-3 font-semibold">Branch</th>
                <th className="px-4 py-3 font-semibold">Active Documents</th>
                <th className="px-4 py-3 font-semibold">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((u, i) => (
                <tr key={u.id} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-4 py-3">
                    <Link href={`/repository/${u.id}`} className="text-maroon-dark font-medium hover:underline">
                      {u.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{BRANCH_LABEL[u.branch]}</td>
                  <td className="px-4 py-3">{u.activeDocumentCount}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.lastUpdate ? new Date(u.lastUpdate).toLocaleDateString() : "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Showing active document counts only. Completion status and KPI scoring are not yet enabled{" "}
          {"\u2014"} pending the checklist and data-source decisions from the QAO planning meeting.
        </p>
      </div>
    </AppShell>
  );
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`text-xs font-semibold px-4 py-2 rounded-full border ${
        active ? "bg-maroon text-white border-maroon" : "border-gray-300 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5 border-l-4 border-l-gold">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-maroon-dark mt-2">{value}</div>
    </div>
  );
}
