"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";
import { isSystemAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function approveAccount(userId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !isSystemAdmin(profile)) throw new Error("Not authorized.");

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("unit_id, units(is_qao)")
    .eq("id", userId)
    .single();

  const isQaoUnit = (target as any)?.units?.is_qao ?? false;
  const correctRole = isQaoUnit ? "qao" : "office_user";

  const { error } = await admin
    .from("profiles")
    .update({ status: "approved", role: correctRole, approved_by: profile.id, approved_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;

  await admin.from("audit_log").insert({
    actor_id: profile.id,
    action: "approve_account",
    target_type: "profile",
    target_id: userId,
  });

  revalidatePath("/admin/approvals");
}

export async function rejectAccount(userId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !isSystemAdmin(profile)) throw new Error("Not authorized.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ status: "rejected", approved_by: profile.id, approved_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;

  await admin.from("audit_log").insert({
    actor_id: profile.id,
    action: "reject_account",
    target_type: "profile",
    target_id: userId,
  });

  revalidatePath("/admin/approvals");
}
