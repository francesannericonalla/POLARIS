import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type Folder = {
  id: string;
  unit_id: string;
  name: string;
  is_qao_exclusive: boolean;
  sort_order: number;
};

export type DocumentRow = {
  id: string;
  folder_id: string;
  unit_id: string;
  title: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  school_year: string;
  semester: string;
  version: number;
  previous_version_id: string | null;
  is_latest: boolean;
  archived: boolean;
  uploaded_by: string;
  created_at: string;
  uploader_name?: string;
};

export const BUCKET = "documents";

export const getFoldersForUnit = unstable_cache(
  async (unitId: string): Promise<Folder[]> => {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("folders")
      .select("id, unit_id, name, is_qao_exclusive, sort_order")
      .eq("unit_id", unitId)
      .order("sort_order");

    if (error) throw error;
    return data as Folder[];
  },
  ["folders-for-unit"],
  { revalidate: 300, tags: ["folders"] }
);

export async function getFolderById(id: string): Promise<Folder | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("folders")
    .select("id, unit_id, name, is_qao_exclusive, sort_order")
    .eq("id", id)
    .single();
  return data as Folder | null;
}

export const getDocumentCountsForUnit = unstable_cache(
  async (unitId: string): Promise<Record<string, number>> => {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("documents")
      .select("folder_id")
      .eq("unit_id", unitId)
      .eq("is_latest", true)
      .eq("archived", false);

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data as { folder_id: string }[]) {
      counts[row.folder_id] = (counts[row.folder_id] ?? 0) + 1;
    }
    return counts;
  },
  ["document-counts-for-unit"],
  { revalidate: 300, tags: ["documents"] }
);

export const getDocumentCountsForUnitThisSY = unstable_cache(
  async (unitId: string, schoolYear: string): Promise<Record<string, number>> => {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("documents")
      .select("folder_id")
      .eq("unit_id", unitId)
      .eq("is_latest", true)
      .eq("archived", false)
      .eq("school_year", schoolYear);

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data as { folder_id: string }[]) {
      counts[row.folder_id] = (counts[row.folder_id] ?? 0) + 1;
    }
    return counts;
  },
  ["document-counts-for-unit-this-sy"],
  { revalidate: 300, tags: ["documents"] }
);

type ListOptions = {
  schoolYear?: string;
  semester?: string;
  includeArchived?: boolean;
};

export async function getDocumentsForFolder(
  folderId: string,
  opts: ListOptions = {}
): Promise<DocumentRow[]> {
  const admin = createAdminClient();
  let query = admin
    .from("documents")
    .select("*, profiles!documents_uploaded_by_fkey(full_name)")
    .eq("folder_id", folderId)
    .eq("is_latest", true)
    .order("created_at", { ascending: false });

  if (!opts.includeArchived) query = query.eq("archived", false);
  if (opts.schoolYear) query = query.eq("school_year", opts.schoolYear);
  if (opts.semester) query = query.eq("semester", opts.semester);

  const { data, error } = await query;
  if (error) throw error;

  return (data as any[]).map((row) => ({
    ...row,
    uploader_name: row.profiles?.full_name ?? "Unknown",
  }));
}

export async function getVersionHistory(documentId: string): Promise<DocumentRow[]> {
  const admin = createAdminClient();
  const { data: target } = await admin
    .from("documents")
    .select("folder_id, title")
    .eq("id", documentId)
    .single();
  if (!target) return [];

  const { data } = await admin
    .from("documents")
    .select("id, version, created_at, previous_version_id")
    .eq("folder_id", target.folder_id)
    .eq("title", target.title)
    .order("version", { ascending: false });

  return (data ?? []) as DocumentRow[];
}

// Returns a map of documentId → version history for all docs in a folder,
// fetched in two queries instead of one per document (avoids N+1).
export async function getVersionHistoriesForFolder(
  folderId: string
): Promise<Map<string, DocumentRow[]>> {
  const admin = createAdminClient();

  // Get all docs in this folder (all versions, not just latest)
  const { data } = await admin
    .from("documents")
    .select("id, title, version, created_at, previous_version_id, is_latest, storage_path, uploaded_by, profiles!documents_uploaded_by_fkey(full_name)")
    .eq("folder_id", folderId)
    .order("version", { ascending: false });

  const rows = ((data ?? []) as any[]).map((row) => ({
    ...row,
    uploader_name: row.profiles?.full_name ?? "Unknown",
    profiles: undefined,
  })) as (DocumentRow & { is_latest: boolean })[];

  // Group all versions by title (same title = same lineage)
  const byTitle = new Map<string, DocumentRow[]>();
  for (const row of rows) {
    const list = byTitle.get(row.title) ?? [];
    list.push(row);
    byTitle.set(row.title, list);
  }

  // Map latest-version doc id → full history array
  const result = new Map<string, DocumentRow[]>();
  for (const row of rows) {
    if (row.is_latest) {
      result.set(row.id, byTitle.get(row.title) ?? [row]);
    }
  }
  return result;
}

export async function getDistinctSchoolYears(unitId: string): Promise<string[]> {
  const admin = createAdminClient();
  // Use distinct at the query level to avoid fetching all rows + deduping in JS
  const { data, error } = await (admin as any)
    .from("documents")
    .select("school_year")
    .eq("unit_id", unitId)
    .eq("is_latest", true)
    .order("school_year", { ascending: false });
  if (error) throw error;
  // Supabase JS doesn't expose .distinct(), so deduplicate the compact result set
  const seen = new Set<string>();
  const years: string[] = [];
  for (const row of (data as { school_year: string }[])) {
    if (!seen.has(row.school_year)) {
      seen.add(row.school_year);
      years.push(row.school_year);
    }
  }
  return years;
}
