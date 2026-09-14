import { getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logout } from "@/lib/actions/auth-actions";

export default async function PendingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status === "approved") redirect("/dashboard");

  const rejected = profile.status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card p-10 max-w-md text-center shadow-md">
        <h1 className="text-2xl font-bold text-maroon mb-2">POLARIS</h1>
        {rejected ? (
          <>
            <p className="text-red-600 font-semibold mb-2">Your account request was not approved.</p>
            <p className="text-sm text-gray-500">Please contact the Quality Assurance Office for more information.</p>
          </>
        ) : (
          <>
            <p className="text-gray-700 font-semibold mb-2">Your account is awaiting QAO approval.</p>
            <p className="text-sm text-gray-500">
              You&apos;ll be able to view and submit documents for your office once QAO confirms your account.
            </p>
          </>
        )}
        <form action={logout} className="mt-6">
          <button type="submit" className="btn-secondary">
            Log Out
          </button>
        </form>
      </div>
    </div>
  );
}
