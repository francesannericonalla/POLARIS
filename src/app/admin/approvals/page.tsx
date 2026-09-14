import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isQao } from "@/lib/permissions";
import { getProfilesByStatus } from "@/lib/data/profiles";
import { AppShell } from "@/components/app-shell";
import { approveAccount, rejectAccount } from "@/lib/actions/approval-actions";

export default async function ApprovalsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (!isQao(profile)) redirect("/dashboard");

  const pending = await getProfilesByStatus("pending");

  return (
    <AppShell profile={profile} title="Account Approvals">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-lg font-bold text-maroon-dark mb-1">Pending Account Requests</h1>
        <p className="text-sm text-gray-500 mb-6">
          New office/department signups wait here until a QAO account confirms they're a real CIT-U employee.
        </p>

        {pending.length === 0 ? (
          <div className="card p-10 text-center text-sm text-gray-400">No pending account requests right now.</div>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-800">{p.full_name}</div>
                  <div className="text-xs text-gray-500">{p.email}</div>
                  <div className="text-xs text-maroon mt-1">{p.unit_name ?? "No unit selected"}</div>
                </div>
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await approveAccount(p.id);
                    }}
                  >
                    <button type="submit" className="btn-primary text-xs">
                      Approve
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await rejectAccount(p.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary text-xs">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
