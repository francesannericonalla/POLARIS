import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessUnitRepository } from "@/lib/permissions";
import { getUnitById } from "@/lib/data/units";
import { getFolderById, getDocumentsForFolder, getDistinctSchoolYears, getVersionHistory } from "@/lib/data/documents";
import { AppShell } from "@/components/app-shell";
import { UploadModal } from "@/components/upload-modal";
import { DownloadButton } from "@/components/download-button";
import { ArchiveButton } from "@/components/archive-button";

export default async function FolderPage({
  params,
  searchParams,
}: {
  params: Promise<{ unitId: string; folderId: string }>;
  searchParams: Promise<{ sy?: string; sem?: string; show?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");

  const { unitId, folderId } = await params;
  const [unit, folder] = await Promise.all([getUnitById(unitId), getFolderById(folderId)]);
  if (!unit || !folder || folder.unit_id !== unitId) notFound();
  if (!canAccessUnitRepository(profile, unitId)) redirect("/dashboard");

  const { sy, sem, show } = await searchParams;
  const includeArchived = show === "all" || show === "archived";

  const [documents, schoolYears] = await Promise.all([
    getDocumentsForFolder(folderId, { schoolYear: sy, semester: sem, includeArchived }),
    getDistinctSchoolYears(unitId),
  ]);

  const visibleDocuments =
    show === "archived" ? documents.filter((d) => d.archived) : documents.filter((d) => show === "all" || !d.archived);

  return (
    <AppShell profile={profile} title={`${unit.name} — ${folder.name}`} activeUnitId={unitId}>
      <div className="p-6 max-w-6xl mx-auto">
        <Link href={`/repository/${unitId}`} className="text-xs text-maroon font-semibold hover:underline">
          {"\u2190"} Back to {unit.name}
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-5">
          <h1 className="text-lg font-bold text-maroon-dark">{folder.name}</h1>
          <UploadModal
            folderId={folderId}
            schoolYears={schoolYears}
            triggerLabel="+ Upload File"
            triggerClassName="btn-primary text-sm"
          />
        </div>

        <FilterBar unitId={unitId} folderId={folderId} schoolYears={schoolYears} sy={sy} sem={sem} show={show} />

        <div className="card overflow-hidden mt-4">
          {visibleDocuments.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">
              No documents {includeArchived ? "" : "uploaded"} here yet for this filter.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">SY / Semester</th>
                  <th className="px-4 py-3 font-semibold">Version</th>
                  <th className="px-4 py-3 font-semibold">Uploaded By</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleDocuments.map((doc) => (
                  <tr key={doc.id} className={`border-t border-gray-100 ${doc.archived ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{doc.title}</div>
                      <div className="text-xs text-gray-400">{doc.file_name}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {doc.school_year} &middot; {doc.semester}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      v{doc.version}
                      {doc.version > 1 && <VersionHistoryLink documentId={doc.id} />}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doc.uploader_name}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <DownloadButton storagePath={doc.storage_path} />
                        {!doc.archived && (
                          <UploadModal
                            folderId={folderId}
                            schoolYears={schoolYears}
                            replacesId={doc.id}
                            replacesTitle={doc.title}
                            triggerLabel="New Version"
                            triggerClassName="text-maroon font-semibold text-xs hover:underline"
                          />
                        )}
                        <ArchiveButton documentId={doc.id} archived={doc.archived} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function FilterBar({
  unitId,
  folderId,
  schoolYears,
  sy,
  sem,
  show,
}: {
  unitId: string;
  folderId: string;
  schoolYears: string[];
  sy?: string;
  sem?: string;
  show?: string;
}) {
  return (
    <form method="GET" className="card p-3 flex flex-wrap gap-3 items-center text-sm">
      <select name="sy" defaultValue={sy ?? ""} className="input-field w-auto">
        <option value="">All School Years</option>
        {schoolYears.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <select name="sem" defaultValue={sem ?? ""} className="input-field w-auto">
        <option value="">All Semesters</option>
        <option value="1st">1st Semester</option>
        <option value="2nd">2nd Semester</option>
        <option value="Summer">Summer</option>
      </select>
      <select name="show" defaultValue={show ?? "active"} className="input-field w-auto">
        <option value="active">Active Only</option>
        <option value="archived">Archived Only</option>
        <option value="all">Show All</option>
      </select>
      <button type="submit" className="btn-secondary text-xs">
        Apply Filters
      </button>
    </form>
  );
}

async function VersionHistoryLink({ documentId }: { documentId: string }) {
  const history = await getVersionHistory(documentId);
  if (history.length <= 1) return null;
  return (
    <details className="inline-block ml-1 align-middle">
      <summary className="text-xs text-maroon cursor-pointer inline">({history.length - 1} older)</summary>
      <ul className="mt-1 text-xs text-gray-500 space-y-0.5">
        {history.slice(1).map((v) => (
          <li key={v.id}>
            v{v.version} &middot; {new Date(v.created_at).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </details>
  );
}
