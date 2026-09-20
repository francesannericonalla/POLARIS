"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";
import { canUploadToUnit, canAccessUnitRepository } from "@/lib/permissions";
import { getFolderById, BUCKET } from "@/lib/data/documents";
import { revalidatePath } from "next/cache";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel",
  "image/jpeg",
  "image/png",
];

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // Supabase free-tier storage cap per file

export type UploadState = { error?: string; success?: boolean };

export async function uploadDocument(_prev: UploadState, formData: FormData): Promise<UploadState> {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved") return { error: "Not authorized." };

  const folderId = String(formData.get("folder_id") || "");
  const schoolYear = String(formData.get("school_year") || "");
  const semester = String(formData.get("semester") || "");
  const title = String(formData.get("title") || "").trim();
  const file = formData.get("file") as File | null;
  const replacesId = formData.get("replaces_id") ? String(formData.get("replaces_id")) : null;

  const folder = await getFolderById(folderId);
  if (!folder) return { error: "Folder not found." };
  if (!canUploadToUnit(profile, folder.unit_id)) return { error: "Not authorized for this office." };

  if (!file || file.size === 0) return { error: "Please choose a file." };
  if (file.size > MAX_SIZE_BYTES) return { error: "File is larger than the 50 MB limit." };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only PDF, Word, Excel, JPG, and PNG files are allowed." };
  }
  const VALID_SEMESTERS = ["1st", "2nd", "Summer", "N/A"];
  if (!schoolYear) return { error: "Please select the school year." };
  if (!semester || !VALID_SEMESTERS.includes(semester)) return { error: "Please select a valid semester." };
  if (!title) return { error: "Please give the document a short title." };

  const admin = createAdminClient();

  // If this is a new version of an existing document, confirm the
  // previous version belongs to the same folder before chaining it.
  let version = 1;
  let previousVersionId: string | null = null;
  if (replacesId) {
    const { data: prev } = await admin.from("documents").select("*").eq("id", replacesId).single();
    if (!prev || prev.folder_id !== folderId) return { error: "Original document not found." };
    version = prev.version + 1;
    previousVersionId = prev.id;
  }

  const path = `${folder.unit_id}/${folderId}/${crypto.randomUUID()}-${file.name}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadErr } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadErr) return { error: `Upload failed: ${uploadErr.message}` };

  const { data: inserted, error: insertErr } = await admin
    .from("documents")
    .insert({
      folder_id: folderId,
      unit_id: folder.unit_id,
      title,
      file_name: file.name,
      storage_path: path,
      mime_type: file.type,
      file_size: file.size,
      school_year: schoolYear,
      semester,
      version,
      previous_version_id: previousVersionId,
      is_latest: true,
      uploaded_by: profile.id,
    })
    .select()
    .single();

  if (insertErr) {
    await admin.storage.from(BUCKET).remove([path]); // don't leave an orphaned file
    return { error: "Could not save document record." };
  }

  // Mark the old version as no longer the latest.
  if (previousVersionId) {
    await admin.from("documents").update({ is_latest: false }).eq("id", previousVersionId);
  }

  await admin.from("audit_log").insert({
    actor_id: profile.id,
    action: replacesId ? "upload_new_version" : "upload_document",
    target_type: "document",
    target_id: inserted.id,
  });

  // Revalidate both the folder page and any dashboards showing doc counts.
  revalidatePath(`/repository/${folder.unit_id}/${folderId}`);
  revalidatePath(`/repository/${folder.unit_id}`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/office/${folder.unit_id}`);
  return { success: true };
}

export async function archiveDocument(documentId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved") throw new Error("Not authorized.");

  const admin = createAdminClient();
  const { data: doc } = await admin.from("documents").select("unit_id, folder_id").eq("id", documentId).single();
  if (!doc) throw new Error("Document not found.");
  if (!canAccessUnitRepository(profile, doc.unit_id)) throw new Error("Not authorized.");

  // Soft-delete only -- the row and the underlying file are never
  // removed. This just hides it from the default active-files view.
  await admin.from("documents").update({ archived: true }).eq("id", documentId);
  await admin.from("audit_log").insert({
    actor_id: profile.id,
    action: "archive_document",
    target_type: "document",
    target_id: documentId,
  });

  revalidatePath(`/repository/${doc.unit_id}/${doc.folder_id}`);
  revalidatePath(`/repository/${doc.unit_id}`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/office/${doc.unit_id}`);
}

export async function restoreDocument(documentId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved") throw new Error("Not authorized.");

  const admin = createAdminClient();
  const { data: doc } = await admin.from("documents").select("unit_id, folder_id").eq("id", documentId).single();
  if (!doc) throw new Error("Document not found.");
  if (!canAccessUnitRepository(profile, doc.unit_id)) throw new Error("Not authorized.");

  await admin.from("documents").update({ archived: false }).eq("id", documentId);
  await admin.from("audit_log").insert({
    actor_id: profile.id,
    action: "restore_document",
    target_type: "document",
    target_id: documentId,
  });

  revalidatePath(`/repository/${doc.unit_id}/${doc.folder_id}`);
  revalidatePath(`/repository/${doc.unit_id}`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/office/${doc.unit_id}`);
}

export async function getSignedDownloadUrl(storagePath: string): Promise<string | null> {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved") return null;

  const admin = createAdminClient();

  // Confirm this file actually belongs to a unit the caller can access
  // before handing out a signed URL for it.
  const { data: doc } = await admin
    .from("documents")
    .select("unit_id")
    .eq("storage_path", storagePath)
    .single();
  if (!doc || !canAccessUnitRepository(profile, doc.unit_id)) return null;

  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 5);
  if (error) return null;
  return data.signedUrl;
}
