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
    <AppShell profile={profile} title={`${unit.name} — My Repository`} activeUnitId={unitId}>
      <div className="p-6 max-w-6xl mx-auto">
        <FolderGrid folders={standardFolders} counts={counts} unitId={unitId} />

        {exclusiveFolders.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-maroon-dark uppercase tracking-wide mt-8 mb-3">
              QAO-Exclusive Folders
            </h2>
            <FolderGrid folders={exclusiveFolders} counts={counts} unitId={unitId} />
          </>
        )}
      </div>
    </AppShell>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {folders.map((folder) => (
        <Link
          key={folder.id}
          href={`/repository/${unitId}/${folder.id}`}
          className="card p-5 hover:shadow-md hover:border-gold transition-all"
        >
          <div className="w-9 h-9 bg-gold rounded-md flex items-center justify-center text-white text-lg mb-4">
            {"\u{1F4C1}"}
          </div>
          <div className="font-semibold text-maroon-dark text-sm mb-1">{folder.name}</div>
          <div className="text-xs text-gray-400">{counts[folder.id] ?? 0} files</div>
        </Link>
      ))}
    </div>
  );
}
