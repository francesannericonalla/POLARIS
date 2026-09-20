import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessUnitRepository, canUploadToUnit } from "@/lib/permissions";
import { getUnitById } from "@/lib/data/units";
import {
  getFolderById,
  getDocumentsForFolder,
  getDistinctSchoolYears,
  getVersionHistoriesForFolder,
  type DocumentRow,
} from "@/lib/data/documents";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { UploadModal } from "@/components/upload-modal";
import { DownloadButton } from "@/components/download-button";
import { ArchiveButton } from "@/components/archive-button";
import { formatDate } from "@/lib/date-utils";

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
  const activeTab: "active" | "archived" = show === "archived" ? "archived" : "active";
  const includeArchived = activeTab === "archived";

  const [allDocuments, schoolYears, versionHistories] = await Promise.all([
    getDocumentsForFolder(folderId, { schoolYear: sy, semester: sem, includeArchived: true }),
    getDistinctSchoolYears(unitId),
    getVersionHistoriesForFolder(folderId),
  ]);

  // Filter documents for the active tab, then apply SY/semester filters
  const baseFiltered = allDocuments.filter((d) =>
    activeTab === "archived" ? d.archived : !d.archived
  );
  // SY/sem filtering already done server-side via getDocumentsForFolder opts,
  // but we passed includeArchived:true and filter tabs client-side by archived flag.
  // Re-apply SY/sem here since we fetch all and split by tab.
  const visibleDocuments = baseFiltered.filter((d) => {
    if (sy && d.school_year !== sy) return false;
    if (sem && d.semester !== sem) return false;
    return true;
  });

  const canUpload = canUploadToUnit(profile, unitId);

  const activeCount = allDocuments.filter((d) => !d.archived).length;
  const archivedCount = allDocuments.filter((d) => d.archived).length;

  return (
    <AppShell profile={profile} title={folder.name} activeUnitId={unitId} activeHref={`/repository/${unitId}`}>
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

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h1 className="text-lg font-semibold text-gray-800">{folder.name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterBar unitId={unitId} folderId={folderId} schoolYears={schoolYears} sy={sy} sem={sem} />
            {canUpload && (
              <UploadModal
                folderId={folderId}
                schoolYears={schoolYears}
                triggerLabel="Upload File"
                triggerClassName="btn-primary"
              />
            )}
          </div>
        </div>

        {/* Active / Archived tabs */}
        <div className="flex items-center gap-1 mb-4">
          <TabLink
            href={buildTabHref(unitId, folderId, "active", sy, sem)}
            active={activeTab === "active"}
            label="Active"
            count={activeCount}
          />
          <TabLink
            href={buildTabHref(unitId, folderId, "archived", sy, sem)}
            active={activeTab === "archived"}
            label="Archived"
            count={archivedCount}
          />
        </div>

        {/* Document list */}
        <div className="card overflow-hidden">
          {visibleDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-400">
                {activeTab === "archived" ? "No archived documents." : "No documents here yet for this filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {visibleDocuments.map((doc) => {
                const history = versionHistories.get(doc.id) ?? [];
                return (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    history={history}
                    folderId={folderId}
                    schoolYears={schoolYears}
                    canUpload={canUpload}
                    isArchived={activeTab === "archived"}
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}

function buildTabHref(unitId: string, folderId: string, tab: string, sy?: string, sem?: string) {
  const params = new URLSearchParams();
  if (tab === "archived") params.set("show", "archived");
  if (sy) params.set("sy", sy);
  if (sem) params.set("sem", sem);
  const qs = params.toString();
  return `/repository/${unitId}/${folderId}${qs ? `?${qs}` : ""}`;
}

function TabLink({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-maroon text-white"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
      <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
        active ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
      }`}>
        {count}
      </span>
    </Link>
  );
}

function DocumentRow({
  doc,
  history,
  folderId,
  schoolYears,
  canUpload,
  isArchived,
}: {
  doc: DocumentRow;
  history: DocumentRow[];
  folderId: string;
  schoolYears: string[];
  canUpload: boolean;
  isArchived: boolean;
}) {
  const hasHistory = history.length > 1;

  return (
    <div className={`px-5 py-4 ${isArchived ? "opacity-60" : ""}`}>
      {/* Main row */}
      <div className="flex items-start gap-4">
        {/* File type icon */}
        <div className="w-9 h-9 rounded-lg bg-maroon/8 text-maroon flex items-center justify-center shrink-0 mt-0.5">
          <FileIcon mimeType={doc.mime_type} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm">{doc.title}</span>
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
              {doc.school_year} · {doc.semester === "N/A" ? "Full Year" : `${doc.semester} sem`}
            </span>
            <VersionPill version={doc.version} />
            {isArchived && (
              <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                Archived
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
            <span className="truncate max-w-[200px]" title={doc.file_name}>{doc.file_name}</span>
            <span>·</span>
            <span>{doc.uploader_name}</span>
            <span>·</span>
            <span>{formatDate(doc.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <DownloadButton storagePath={doc.storage_path} />
          {!isArchived && canUpload && (
            <UploadModal
              folderId={folderId}
              schoolYears={schoolYears}
              replacesId={doc.id}
              replacesTitle={doc.title}
              triggerLabel="New Version"
              triggerClassName="text-xs font-medium text-gray-400 hover:text-maroon transition-colors px-2 py-1.5 rounded hover:bg-gray-50"
            />
          )}
          <ArchiveButton documentId={doc.id} archived={doc.archived} />
        </div>
      </div>

      {/* Version history — expandable */}
      {hasHistory && (
        <VersionHistoryTable history={history} />
      )}
    </div>
  );
}

function VersionPill({ version }: { version: number }) {
  if (version === 1) {
    return (
      <span className="text-[11px] font-medium text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
        v1
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium text-maroon bg-maroon/8 border border-maroon/15 px-1.5 py-0.5 rounded">
      v{version} · Updated
    </span>
  );
}

function VersionHistoryTable({ history }: { history: DocumentRow[] }) {
  return (
    <details className="mt-3 ml-13 group" style={{ marginLeft: "52px" }}>
      <summary className="text-xs text-maroon cursor-pointer select-none inline-flex items-center gap-1.5 hover:text-maroon/80 transition-colors">
        <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
        {history.length - 1} previous version{history.length - 1 !== 1 ? "s" : ""}
      </summary>
      <div className="mt-2 rounded-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2 text-left font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Version</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Uploaded by</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Date</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {history.map((v, i) => (
              <tr key={v.id} className={i === 0 ? "bg-maroon/[0.02]" : ""}>
                <td className="px-3 py-2">
                  <span className={`font-semibold ${i === 0 ? "text-maroon" : "text-gray-500"}`}>
                    v{v.version}
                    {i === 0 && <span className="ml-1 text-[10px] text-maroon/60 font-normal">(current)</span>}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-500">{v.uploader_name ?? "—"}</td>
                <td className="px-3 py-2 text-gray-400">{formatDate(v.created_at)}</td>
                <td className="px-3 py-2 text-right">
                  <DownloadButton storagePath={v.storage_path} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/pdf") {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M10 3v18M3 3h18v18H3z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

