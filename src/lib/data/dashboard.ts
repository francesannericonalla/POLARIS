import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllUnits, type Unit } from "@/lib/data/units";

export type UnitSummary = Unit & {
  activeDocumentCount: number;
  thisYearCount: number;
  lastUpdate: string | null;
};

export function currentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() >= 5 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export function buildSchoolYearOptions(): string[] {
  const now = new Date();
  const currentStart = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  // From 2024 up to current
  const years: string[] = [];
  for (let y = 2024; y <= currentStart; y++) {
    years.push(`${y}-${y + 1}`);
  }
  return years.reverse(); // newest first
}

export const getUnitSummaries = unstable_cache(
  async (branch?: "academics" | "administration", schoolYear?: string): Promise<UnitSummary[]> => {
    const admin = createAdminClient();
    const sy = schoolYear || currentSchoolYear();

    // Run unit fetch + document fetch in parallel
    const [allUnits, { data: docs, error }] = await Promise.all([
      getAllUnits(),
      admin
        .from("documents")
        .select("unit_id, created_at, school_year")
        .eq("is_latest", true)
        .eq("archived", false),
    ]);

    if (error) throw error;

    const units = branch ? allUnits.filter((u) => u.branch === branch) : allUnits;
    const leafUnits = units.filter((u) => u.type !== "college");

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
  },
  ["unit-summaries"],
  { revalidate: 300, tags: ["documents", "units"] }
);

export type FolderStat = {
  id: string;
  name: string;
  activeDocumentCount: number;
  thisYearCount: number;
  lastUpdate: string | null;
};

export const getUnitFolderStats = unstable_cache(
  async (unitId: string): Promise<FolderStat[]> => {
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
  },
  ["unit-folder-stats"],
  { revalidate: 300, tags: ["documents"] }
);

export const getUnitFolderStatsByFilter = unstable_cache(
  async (
    unitId: string,
    opts: { schoolYear?: string; semester?: string } = {}
  ): Promise<FolderStat[]> => {
    const admin = createAdminClient();
    const sy = opts.schoolYear || currentSchoolYear();

    const [{ data: folders }, { data: allDocs }] = await Promise.all([
      admin.from("folders").select("id, name, sort_order").eq("unit_id", unitId).order("sort_order"),
      (() => {
        let q = admin
          .from("documents")
          .select("folder_id, created_at, school_year")
          .eq("unit_id", unitId)
          .eq("is_latest", true)
          .eq("archived", false);
        if (opts.schoolYear) q = q.eq("school_year", opts.schoolYear);
        if (opts.semester) q = (q as any).eq("semester", opts.semester);
        return q;
      })(),
    ]);

    const byFolder = new Map<string, { count: number; thisYear: number; last: string | null }>();
    for (const d of (allDocs ?? []) as { folder_id: string; created_at: string; school_year: string }[]) {
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
  },
  ["unit-folder-stats-filtered"],
  { revalidate: 300, tags: ["documents"] }
);

export type RecentActivityItem = {
  id: string;
  title: string;
  folder_name: string;
  school_year: string;
  semester: string;
  version: number;
  created_at: string;
  uploader_name: string;
};

export async function getRecentActivity(unitId: string, limit = 6): Promise<RecentActivityItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("documents")
    .select("id, title, school_year, semester, version, created_at, folders(name), profiles!documents_uploaded_by_fkey(full_name)")
    .eq("unit_id", unitId)
    .eq("archived", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    title: row.title,
    folder_name: row.folders?.name ?? "Unknown folder",
    school_year: row.school_year,
    semester: row.semester,
    version: row.version,
    created_at: row.created_at,
    uploader_name: row.profiles?.full_name ?? "Unknown",
  }));
}
