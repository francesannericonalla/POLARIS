import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessUnitRepository } from "@/lib/permissions";
import { getUnitById } from "@/lib/data/units";
import { getFoldersForUnit, getDocumentCountsForUnit, getDocumentCountsForUnitThisSY, getSemestersPerFolderThisSY } from "@/lib/data/documents";
import { currentSchoolYear, buildSchoolYearOptions } from "@/lib/data/dashboard";
import { AppShell } from "@/components/app-shell";
import { RepositoryClientView, type FolderItem } from "./repository-client-view";

export default async function UnitRepositoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ unitId: string }>;
  searchParams: Promise<{ sy?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "approved") redirect("/pending");

  const { unitId } = await params;
  const unit = await getUnitById(unitId);
  if (!unit) notFound();
  if (!canAccessUnitRepository(profile, unitId)) redirect("/dashboard");

  const { sy: syParam } = await searchParams;
  const defaultSY = currentSchoolYear();
  const sy = syParam || defaultSY;
  const syOptions = buildSchoolYearOptions();

  const [folders, counts, thisYearCounts, semestersPerFolder] = await Promise.all([
    getFoldersForUnit(unitId),
    getDocumentCountsForUnit(unitId),
    getDocumentCountsForUnitThisSY(unitId, sy),
    getSemestersPerFolderThisSY(unitId, sy),
  ]);

  const standardFolders = folders.filter((f) => !f.is_qao_exclusive);
  const exclusiveFolders = folders.filter((f) => f.is_qao_exclusive);

  function toFolderItems(raw: { id: string; name: string }[]): FolderItem[] {
    return raw.map((f) => {
      const total = counts[f.id] ?? 0;
      const thisSY = thisYearCounts[f.id] ?? 0;
      const status = thisSY > 0 ? "filed" : total > 0 ? "outdated" : "missing";
      return { id: f.id, name: f.name, totalCount: total, thisYearCount: thisSY, status, semesters: semestersPerFolder[f.id] ?? [] };
    });
  }

  const standardItems = toFolderItems(standardFolders);
  const exclusiveItems = toFolderItems(exclusiveFolders);

  return (
    <AppShell profile={profile} title={unit.name} activeUnitId={unitId} activeHref={`/repository/${unitId}`}>
      <div className="p-6 md:p-8 space-y-6" style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Page header ── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color: "#A0A8B4" }}>
            Document Repository
          </p>
          <h1 className="font-poppins text-[28px] font-bold leading-tight" style={{ color: "var(--ou-heading)" }}>
            {unit.name}
          </h1>
          <p className="text-[13.5px] mt-1.5" style={{ color: "#788397" }}>
            Manage and access your department&apos;s compliance documents.
          </p>
        </div>

        {/* ── Standard folders ── */}
        <RepositoryClientView folders={standardItems} unitId={unitId} sy={sy} syOptions={syOptions} />

        {/* ── QAO-exclusive folders ── */}
        {exclusiveItems.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "#A0A8B4" }}>
                QAO-Exclusive Folders
              </p>
              <div className="flex-1 h-px" style={{ background: "#E8EAF0" }} />
            </div>
            <RepositoryClientView folders={exclusiveItems} unitId={unitId} sy={sy} syOptions={syOptions} />
          </div>
        )}

      </div>
    </AppShell>
  );
}
