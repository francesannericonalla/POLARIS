import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessUnitRepository } from "@/lib/permissions";
import { getUnitById } from "@/lib/data/units";
import { getFolderById, getDocumentsForFolder, getDistinctSchoolYears, getVersionHistory } from "@/lib/data/documents";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
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
    <AppShell profile={profile} title={folder.name} activeUnitId={unitId}>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
          <Link href={`/repository/${unitId}`} className="hover:text-maroon transition-colors">
            {unit.name}
          </Link>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 font-medium">{folder.name}</span>
        </div>

        {/* Header row with inline filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h1 className="text-lg font-semibold text-gray-800">{folder.name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterBar unitId={unitId} folderId={folderId} schoolYears={schoolYears} sy={sy} sem={sem} show={show} />
            <UploadModal
              folderId={folderId}
              schoolYears={schoolYears}
              triggerLabel="+ Upload File"
              triggerClassName="btn-primary"
            />
          </div>
        </div>

        {/* Document table */}
        <div className="card overflow-hidden mt-4">
          {visibleDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-400">No documents here yet for this filter.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Title</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">SY / Semester</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Version</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Uploaded By</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleDocuments.map((doc) => (
                  <tr key={doc.id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${doc.archived ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{doc.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{doc.file_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {doc.school_year} &middot; {doc.semester === "N/A" ? "Full Year" : doc.semester}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-500">v{doc.version}</span>
                      {doc.version > 1 && <VersionHistoryLink documentId={doc.id} />}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{doc.uploader_name}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <DownloadButton storagePath={doc.storage_path} />
                        {!doc.archived && (
                          <UploadModal
                            folderId={folderId}
                            schoolYears={schoolYears}
                            replacesId={doc.id}
                            replacesTitle={doc.title}
                            triggerLabel="New Version"
                            triggerClassName="text-xs font-medium text-gray-400 hover:text-maroon transition-colors"
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
