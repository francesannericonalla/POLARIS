import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isSystemAdmin } from "@/lib/permissions";
import { getAllProfiles } from "@/lib/data/profiles";
import { Topbar } from "@/components/topbar";

const STATUS_STYLE: Record<string, string> = {
  approved: "bg-green-50 text-green-700 border border-green-100",
  pending: "bg-amber-50 text-amber-700 border border-amber-100",
  rejected: "bg-red-50 text-red-600 border border-red-100",
};

export default async function AccountsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (!isSystemAdmin(profile)) redirect("/dashboard");

  const profiles = await getAllProfiles();

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5]">
      <Topbar
        title="System Administration"
        userName={profile.full_name}
        role={profile.role}
        idNumber={profile.id_number}
        unitName={profile.unit_name}
        navLinks={[
          { label: "Account Approvals", href: "/admin/approvals" },
          { label: "All Accounts", href: "/admin/accounts" },
        ]}
      />
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-gray-800">All Accounts</h1>
            <p className="text-sm text-gray-400 mt-0.5">Read-only view. Document contents are not accessible from this role.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            System Administrator accounts manage user accounts and system configuration only. Document contents are not accessible from this role, by design.
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Unit</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.full_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.email}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.unit_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{p.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${STATUS_STYLE[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
