import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessUnitRepository } from "@/lib/permissions";
import { getUnitById } from "@/lib/data/units";
import { getFoldersForUnit, getDocumentCountsForUnit } from "@/lib/data/documents";
import { AppShell } from "@/components/app-shell";

export default async function UnitRepositoryPage({ params }: { params: Promise<{ unitId: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");

  const { unitId } = await params;
  const unit = await getUnitById(unitId);
  if (!unit) notFound();
  if (!canAccessUnitRepository(profile, unitId)) redirect("/dashboard");

  const [folders, counts] = await Promise.all([getFoldersForUnit(unitId), getDocumentCountsForUnit(unitId)]);
  const standardFolders = folders.filter((f) => !f.is_qao_exclusive);
  const exclusiveFolders = folders.filter((f) => f.is_qao_exclusive);

  return (
    <AppShell profile={profile} title={unit.name} activeUnitId={unitId}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-800">{unit.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Document Repository</p>
        </div>

        <FolderGrid folders={standardFolders} counts={counts} unitId={unitId} />

        {exclusiveFolders.length > 0 && (
          <>
            <div className="flex items-center gap-3 mt-10 mb-4">
              <h2 className="text-xs font-bold text-gold uppercase tracking-widest">QAO-Exclusive Folders</h2>
              <div className="flex-1 h-px bg-gold/20" />
            </div>
            <FolderGrid folders={exclusiveFolders} counts={counts} unitId={unitId} />
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

function FolderGrid({
  folders,
  counts,
  unitId,
}: {
  folders: { id: string; name: string }[];
  counts: Record<string, number>;
  unitId: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {folders.map((folder) => {
        const count = counts[folder.id] ?? 0;
        return (
          <Link
            key={folder.id}
            href={`/repository/${unitId}/${folder.id}`}
            className="card p-5 hover:shadow-md hover:border-maroon/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-maroon/8 text-maroon flex items-center justify-center group-hover:bg-maroon group-hover:text-white transition-colors">
                <FolderIcon />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                count > 0 ? "bg-maroon/10 text-maroon" : "bg-gray-100 text-gray-400"
              }`}>
                {count} {count === 1 ? "file" : "files"}
              </span>
            </div>
            <div className="font-semibold text-gray-800 text-sm leading-snug">{folder.name}</div>
          </Link>
        );
      })}
    </div>
  );
}
