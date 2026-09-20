import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessUnitRepository } from "@/lib/permissions";
import { getUnitById } from "@/lib/data/units";
import { getFoldersForUnit, getDocumentCountsForUnit, getDocumentCountsForUnitThisSY } from "@/lib/data/documents";
import { currentSchoolYear } from "@/lib/data/dashboard";
import { AppShell } from "@/components/app-shell";

export default async function UnitRepositoryPage({ params }: { params: Promise<{ unitId: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");

  const { unitId } = await params;
  const unit = await getUnitById(unitId);
  if (!unit) notFound();
  if (!canAccessUnitRepository(profile, unitId)) redirect("/dashboard");

  const sy = currentSchoolYear();
  const [folders, counts, thisYearCounts] = await Promise.all([
    getFoldersForUnit(unitId),
    getDocumentCountsForUnit(unitId),
    getDocumentCountsForUnitThisSY(unitId, sy),
  ]);

  const standardFolders = folders.filter((f) => !f.is_qao_exclusive);
  const exclusiveFolders = folders.filter((f) => f.is_qao_exclusive);

  // Summary stats for the header
  const submittedCount = standardFolders.filter((f) => (thisYearCounts[f.id] ?? 0) > 0).length;

  return (
    <AppShell profile={profile} title={unit.name} activeUnitId={unitId} activeHref={`/repository/${unitId}`}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">{unit.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Document Repository</p>
          </div>
          {/* SY submission summary */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">SY {sy}:</span>
            <span className={`font-semibold ${submittedCount === standardFolders.length ? "text-green-600" : submittedCount > 0 ? "text-amber-600" : "text-gray-400"}`}>
              {submittedCount}/{standardFolders.length} folders submitted
            </span>
          </div>
        </div>

        <FolderGrid folders={standardFolders} counts={counts} thisYearCounts={thisYearCounts} unitId={unitId} />

        {exclusiveFolders.length > 0 && (
          <>
            <div className="flex items-center gap-3 mt-10 mb-4">
              <h2 className="text-xs font-bold text-gold uppercase tracking-widest">QAO-Exclusive Folders</h2>
              <div className="flex-1 h-px bg-gold/20" />
            </div>
            <FolderGrid folders={exclusiveFolders} counts={counts} thisYearCounts={thisYearCounts} unitId={unitId} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function FolderIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

type SubmissionStatus = "submitted" | "pending" | "no-files";

function getStatus(allTime: number, thisSY: number): SubmissionStatus {
  if (thisSY > 0) return "submitted";
  if (allTime > 0) return "pending";
  return "no-files";
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  if (status === "submitted") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Submitted
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        Pending this SY
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
      No files
    </span>
  );
}

function FolderGrid({
  folders,
  counts,
  thisYearCounts,
  unitId,
}: {
  folders: { id: string; name: string }[];
  counts: Record<string, number>;
  thisYearCounts: Record<string, number>;
  unitId: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {folders.map((folder) => {
        const count = counts[folder.id] ?? 0;
        const thisSY = thisYearCounts[folder.id] ?? 0;
        const status = getStatus(count, thisSY);

        return (
          <Link
            key={folder.id}
            href={`/repository/${unitId}/${folder.id}`}
            className="card p-5 hover:shadow-md hover:border-maroon/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                ${status === "submitted" ? "bg-green-50 text-green-600 group-hover:bg-green-500 group-hover:text-white" :
                  status === "pending" ? "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white" :
                  "bg-maroon/8 text-maroon group-hover:bg-maroon group-hover:text-white"}`}>
                <FolderIcon />
              </div>
              <StatusBadge status={status} />
            </div>
            <div className="font-semibold text-gray-800 text-sm leading-snug mb-2">{folder.name}</div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{count} {count === 1 ? "file" : "files"} total</span>
              {thisSY > 0 && <span className="text-green-600 font-medium">{thisSY} this SY</span>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
