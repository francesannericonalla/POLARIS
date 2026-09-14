import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isSystemAdmin } from "@/lib/permissions";
import { getProfilesByStatus } from "@/lib/data/profiles";
import { AppShell } from "@/components/app-shell";
import { approveAccount, rejectAccount } from "@/lib/actions/approval-actions";

export default async function ApprovalsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");
  if (!isSystemAdmin(profile)) redirect("/dashboard");

  const pending = await getProfilesByStatus("pending");

  return (
    <AppShell profile={profile} title="Account Approvals">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-800">Pending Account Requests</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            New signups wait here until a QAO account confirms they are a real CIT-U employee.
          </p>
        </div>

        {pending.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-400">No pending account requests right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="card p-4 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-gold">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-800 text-sm">{p.full_name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.email}</div>
                  <div className="text-xs text-maroon mt-1 font-medium">{p.unit_name ?? "No unit selected"}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <form
                    action={async () => {
                      "use server";
                      await approveAccount(p.id);
                    }}
                  >
                    <button type="submit" className="btn-primary text-xs px-3 py-1.5">
                      Approve
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await rejectAccount(p.id);
                    }}
                  >
                    <button type="submit" className="btn-danger text-xs px-3 py-1.5">
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
