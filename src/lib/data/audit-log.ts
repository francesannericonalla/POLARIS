import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuditLogEntry = {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

const ACTION_LABELS: Record<string, string> = {
  upload_document: "Uploaded document",
  upload_new_version: "Uploaded new version",
  archive_document: "Archived document",
  restore_document: "Restored document",
  approve_account: "Approved account",
  reject_account: "Rejected account",
  suspend_account: "Suspended account",
  reactivate_account: "Reactivated account",
  promote_to_admin: "Promoted to admin",
  revoke_admin: "Revoked admin",
  upsert_deadline: "Set/updated deadline",
  delete_deadline: "Deleted deadline",
};

export function labelForAction(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export async function getAuditLog(limit = 100, offset = 0): Promise<AuditLogEntry[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("audit_log")
    .select("id, actor_id, action, target_type, target_id, meta, created_at, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    actor_id: row.actor_id,
    actor_name: row.profiles?.full_name ?? null,
    actor_email: row.profiles?.email ?? null,
    action: row.action,
    target_type: row.target_type ?? null,
    target_id: row.target_id ?? null,
    meta: row.meta ?? null,
    created_at: row.created_at,
  }));
}

export async function getAuditLogCount(): Promise<number> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("audit_log")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}
