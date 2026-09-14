import { getAllUnits, buildUnitTree } from "@/lib/data/units";
import SignupForm from "./signup-form";

// This page reads live data from Supabase (the unit list for the
// dropdown), so it must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const units = await getAllUnits();
  const tree = buildUnitTree(units);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-lg mx-4 card p-8 shadow-md">
        <h1 className="text-2xl font-bold text-maroon text-center">Create your POLARIS account</h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          For CIT-U academic and administrative staff. QAO will review your account before you can submit documents.
        </p>
        <SignupForm tree={tree} />
      </div>
    </div>
  );
}
