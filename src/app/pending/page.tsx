import { getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logout } from "@/lib/actions/auth-actions";
import { PolarisLogo } from "@/components/polaris-logo";

export default async function PendingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status === "approved") redirect("/dashboard");

  const rejected = profile.status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-maroon-dark relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-gold" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full border border-gold" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="flex flex-col items-center mb-8">
          <PolarisLogo size={44} />
          <h1 className="text-xl font-bold text-gold tracking-widest uppercase mt-3">POLARIS</h1>
          <p className="text-white/50 text-xs tracking-wide mt-1">CIT-U Quality Assurance Office</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {rejected ? (
            <>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-800 font-semibold mb-2">Account Not Approved</p>
              <p className="text-sm text-gray-500">Please contact the Quality Assurance Office for more information.</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-800 font-semibold mb-2">Awaiting QAO Approval</p>
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
    </div>
  );
}
