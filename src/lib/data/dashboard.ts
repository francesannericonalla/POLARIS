import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllUnits, type Unit } from "@/lib/data/units";

export type UnitSummary = Unit & {
  activeDocumentCount: number;
  thisYearCount: number;
  lastUpdate: string | null;
};

function currentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  // School year starts in June
  return now.getMonth() >= 5 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export async function getUnitSummaries(branch?: "academics" | "administration"): Promise<UnitSummary[]> {
  const admin = createAdminClient();
  const allUnits = await getAllUnits();
  const units = branch ? allUnits.filter((u) => u.branch === branch) : allUnits;
  const leafUnits = units.filter((u) => u.type !== "college");

  const { data: docs, error } = await admin
    .from("documents")
    .select("unit_id, created_at, school_year")
    .eq("is_latest", true)
    .eq("archived", false);
  if (error) throw error;

  const sy = currentSchoolYear();
  const byUnit = new Map<string, { count: number; thisYear: number; last: string | null }>();
  for (const d of docs as { unit_id: string; created_at: string; school_year: string }[]) {
    const entry = byUnit.get(d.unit_id) ?? { count: 0, thisYear: 0, last: null };
    entry.count += 1;
    if (d.school_year === sy) entry.thisYear += 1;
    if (!entry.last || d.created_at > entry.last) entry.last = d.created_at;
    byUnit.set(d.unit_id, entry);
  }

  return leafUnits.map((u) => ({
    ...u,
    activeDocumentCount: byUnit.get(u.id)?.count ?? 0,
    thisYearCount: byUnit.get(u.id)?.thisYear ?? 0,
    lastUpdate: byUnit.get(u.id)?.last ?? null,
  }));
}

export type FolderStat = {
  id: string;
  name: string;
  activeDocumentCount: number;
  thisYearCount: number;
  lastUpdate: string | null;
};

export async function getUnitFolderStats(unitId: string): Promise<FolderStat[]> {
  const admin = createAdminClient();
  const sy = currentSchoolYear();

  const [{ data: folders }, { data: docs }] = await Promise.all([
    admin.from("folders").select("id, name, sort_order").eq("unit_id", unitId).order("sort_order"),
    admin
      .from("documents")
      .select("folder_id, created_at, school_year")
      .eq("unit_id", unitId)
      .eq("is_latest", true)
      .eq("archived", false),
  ]);

  const byFolder = new Map<string, { count: number; thisYear: number; last: string | null }>();
  for (const d of (docs ?? []) as { folder_id: string; created_at: string; school_year: string }[]) {
    const entry = byFolder.get(d.folder_id) ?? { count: 0, thisYear: 0, last: null };
    entry.count += 1;
    if (d.school_year === sy) entry.thisYear += 1;
    if (!entry.last || d.created_at > entry.last) entry.last = d.created_at;
    byFolder.set(d.folder_id, entry);
  }

  return (folders ?? []).map((f: any) => ({
    id: f.id,
    name: f.name,
    activeDocumentCount: byFolder.get(f.id)?.count ?? 0,
    thisYearCount: byFolder.get(f.id)?.thisYear ?? 0,
    lastUpdate: byFolder.get(f.id)?.last ?? null,
  }));
}

export { currentSchoolYear };
