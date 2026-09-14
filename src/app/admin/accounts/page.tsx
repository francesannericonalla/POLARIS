import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isSystemAdmin } from "@/lib/permissions";
import { getAllProfiles } from "@/lib/data/profiles";
import { Topbar } from "@/components/topbar";

const STATUS_STYLE: Record<string, string> = {
  approved: "bg-green-50 text-green-700",
  pending: "bg-yellow-50 text-yellow-700",
  rejected: "bg-red-50 text-red-700",
};

export default async function AccountsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (!isSystemAdmin(profile)) redirect("/dashboard");

  const profiles = await getAllProfiles();

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar title="System Administration — Accounts" userName={profile.full_name} />
      <main className="flex-1 bg-[#F1F1F3] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md px-4 py-3 mb-6">
            System Administrator accounts manage user accounts and system configuration only. Document contents are
            not accessible from this role, by design.
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-maroon text-white text-left">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Unit</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p, i) => (
                  <tr key={p.id} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3">{p.full_name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.email}</td>
                    <td className="px-4 py-3 text-gray-500">{p.unit_name ?? "\u2014"}</td>
                    <td className="px-4 py-3 text-gray-500">{p.role}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[p.status]}`}>
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
