import { getAllUnits, buildUnitTree } from "@/lib/data/units";
import SignupForm from "./signup-form";
import { PolarisLogo } from "@/components/polaris-logo";

// This page reads live data from Supabase (the unit list for the
// dropdown), so it must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const units = await getAllUnits();
  const tree = buildUnitTree(units);

  return (
    <div className="min-h-screen flex items-center justify-center bg-maroon-dark py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-gold" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full border border-gold" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="flex flex-col items-center mb-8">
          <PolarisLogo size={44} />
          <h1 className="text-xl font-bold text-gold tracking-widest uppercase mt-3">POLARIS</h1>
          <p className="text-white/50 text-xs tracking-wide mt-1">CIT-U Quality Assurance Office</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Create your account</h2>
          <p className="text-xs text-gray-400 mb-6">
            For CIT-U academic and administrative staff. QAO will review your account before you can submit documents.
          </p>
          <SignupForm tree={tree} />
        </div>
      </div>
    </div>
  );
}
