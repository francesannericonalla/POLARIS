import "server-only";
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

export async function getFoldersForUnit(unitId: string): Promise<Folder[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("folders")
    .select("id, unit_id, name, is_qao_exclusive, sort_order")
    .eq("unit_id", unitId)
    .order("sort_order");

  if (error) throw error;
  return data as Folder[];
}

export async function getFolderById(id: string): Promise<Folder | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("folders")
    .select("id, unit_id, name, is_qao_exclusive, sort_order")
    .eq("id", id)
    .single();
  return data as Folder | null;
}

// Counts of active (non-archived, latest-version) documents per folder,
// used for the folder-grid cards and the basic dashboard counts.
export async function getDocumentCountsForUnit(unitId: string): Promise<Record<string, number>> {
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
}

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

// Full version chain for one document lineage, newest first.
export async function getVersionHistory(documentId: string): Promise<DocumentRow[]> {
  const admin = createAdminClient();
  const versions: DocumentRow[] = [];
  let currentId: string | null = documentId;

  // Walk backward from the given version through previous_version_id.
  // (Version chains are short in practice -- a handful of corrections
  // per document -- so a simple loop is clearer than a recursive SQL CTE.)
  while (currentId) {
    const { data }: { data: DocumentRow | null } = await admin.from("documents").select("*").eq("id", currentId).single();
    if (!data) break;
    versions.push(data as DocumentRow);
    currentId = data.previous_version_id;
  }

  return versions;
}

export async function getDistinctSchoolYears(unitId: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("documents").select("school_year").eq("unit_id", unitId);
  if (error) throw error;
  return Array.from(new Set((data as { school_year: string }[]).map((d) => d.school_year))).sort().reverse();
}
