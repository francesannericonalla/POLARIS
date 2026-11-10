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
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { UploadModal } from "@/components/upload-modal";
import { BulkDocumentList } from "./bulk-document-list";

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

  const [allDocuments, schoolYears, versionHistoriesMap] = await Promise.all([
    getDocumentsForFolder(folderId, { schoolYear: sy, semester: sem, includeArchived: true }),
    getDistinctSchoolYears(unitId),
    getVersionHistoriesForFolder(folderId),
  ]);

  const baseFiltered = allDocuments.filter((d) =>
    activeTab === "archived" ? d.archived : !d.archived
  );
  const visibleDocuments = baseFiltered.filter((d) => {
    if (sy && d.school_year !== sy) return false;
    if (sem && d.semester !== sem) return false;
    return true;
  });

  const canUpload = canUploadToUnit(profile, unitId);
  const activeCount = allDocuments.filter((d) => !d.archived).length;
  const archivedCount = allDocuments.filter((d) => d.archived).length;

  // Convert Map to plain object for client component serialization
  const versionHistories: Record<string, DocumentRow[]> = {};
  for (const [k, v] of versionHistoriesMap.entries()) {
    versionHistories[k] = v;
  }

  return (
    <AppShell profile={profile} title={folder.name} activeUnitId={unitId} activeHref={`/repository/${unitId}`}>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href={`/repository/${unitId}`} className="hover:text-maroon transition-colors font-medium">
            {unit.name}
          </Link>
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-semibold">{folder.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Folder</p>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
              {folder.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Suspense fallback={<div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />}>
              <FilterBar unitId={unitId} folderId={folderId} schoolYears={schoolYears} sy={sy} sem={sem} />
            </Suspense>
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
        <div className="flex items-center gap-1">
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

        {/* Document list with bulk actions */}
        <BulkDocumentList
          documents={visibleDocuments}
          versionHistories={versionHistories}
          folderId={folderId}
          schoolYears={schoolYears}
          canUpload={canUpload}
          isArchived={activeTab === "archived"}
        />

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
        active ? "bg-maroon text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
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
