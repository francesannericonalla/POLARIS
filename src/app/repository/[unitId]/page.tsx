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

  const submittedCount = standardFolders.filter((f) => (thisYearCounts[f.id] ?? 0) > 0).length;
  const submissionRate = standardFolders.length > 0
    ? Math.round((submittedCount / standardFolders.length) * 100)
    : 0;
  const rateColor = submissionRate === 100 ? "#16a34a" : submissionRate >= 50 ? "#B8892B" : "#ef4444";

  return (
    <AppShell profile={profile} title={unit.name} activeUnitId={unitId} activeHref={`/repository/${unitId}`}>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Document Repository</p>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
              {unit.name}
            </h1>
          </div>
          {/* SY submission summary pill */}
          <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">SY {sy} Progress</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">{submittedCount}/{standardFolders.length}</span>
                <span className="text-xs text-gray-400">folders submitted</span>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="w-9 h-9 shrink-0">
              <svg width="36" height="36" viewBox="0 0 88 88" className="-rotate-90">
                <circle cx="44" cy="44" r="36" fill="none" stroke="#f0f0f0" strokeWidth="10" />
                <circle
                  cx="44" cy="44" r="36" fill="none"
                  stroke={rateColor} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={String(2 * Math.PI * 36)}
                  strokeDashoffset={String(2 * Math.PI * 36 - (submissionRate / 100) * 2 * Math.PI * 36)}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Standard folders */}
        <FolderGrid folders={standardFolders} counts={counts} thisYearCounts={thisYearCounts} unitId={unitId} />

        {exclusiveFolders.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-bold text-gold uppercase tracking-widest">QAO-Exclusive Folders</h2>
              <div className="flex-1 h-px bg-gold/20" />
            </div>
            <FolderGrid folders={exclusiveFolders} counts={counts} thisYearCounts={thisYearCounts} unitId={unitId} />
          </div>
        )}
      </div>
    </AppShell>
  );
}

type SubmissionStatus = "submitted" | "pending" | "no-files";

function getStatus(allTime: number, thisSY: number): SubmissionStatus {
  if (thisSY > 0) return "submitted";
  if (allTime > 0) return "pending";
  return "no-files";
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

        const statusStyles = {
          submitted: {
            dot: "bg-green-500",
            label: "Filed",
            labelCls: "text-green-700",
            iconBg: "bg-green-50 text-green-600 group-hover:bg-green-500 group-hover:text-white",
          },
          pending: {
            dot: "bg-amber-400",
            label: "Pending this SY",
            labelCls: "text-amber-700",
            iconBg: "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
          },
          "no-files": {
            dot: "bg-gray-300",
            label: "No files",
            labelCls: "text-gray-400",
            iconBg: "bg-maroon/[0.06] text-maroon group-hover:bg-maroon group-hover:text-white",
          },
        }[status];

        return (
          <Link
            key={folder.id}
            href={`/repository/${unitId}/${folder.id}`}
            className="card p-5 hover:shadow-md hover:border-maroon/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${statusStyles.iconBg}`}>
                <FolderIcon />
              </div>
              {/* Status dot + label */}
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${statusStyles.labelCls}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusStyles.dot}`} />
                {statusStyles.label}
              </span>
            </div>

            <p className="font-semibold text-gray-800 text-sm leading-snug mb-3">{folder.name}</p>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{count} {count === 1 ? "file" : "files"} total</span>
              {thisSY > 0 && (
                <span className="text-green-600 font-semibold">{thisSY} this SY</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function FolderIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}
