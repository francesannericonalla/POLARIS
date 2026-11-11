"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";
import { isSystemAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/data/notifications";
import { sendEmail, accountApprovedHtml, accountRejectedHtml } from "@/lib/email";

export async function approveAccount(userId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved" || !isSystemAdmin(profile)) throw new Error("Not authorized.");

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("unit_id, full_name, email, units(is_qao)")
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

  const targetName = (target as any)?.full_name ?? "User";
  const targetEmail = (target as any)?.email ?? "";
  await Promise.all([
    createNotification(userId, "account_approved", "Account Approved", "Your POLARIS account has been approved. You can now log in."),
    sendEmail(targetEmail, "Your POLARIS Account Has Been Approved", accountApprovedHtml(targetName)),
  ]);

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/accounts");
}

export async function rejectAccount(userId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved" || !isSystemAdmin(profile)) throw new Error("Not authorized.");

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", userId)
    .single();

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

  const targetName = (target as any)?.full_name ?? "User";
  const targetEmail = (target as any)?.email ?? "";
  await Promise.all([
    createNotification(userId, "account_rejected", "Account Not Approved", "Your POLARIS account request was not approved. Please contact the QAO office."),
    sendEmail(targetEmail, "POLARIS Account Request Update", accountRejectedHtml(targetName)),
  ]);

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/accounts");
}

export async function suspendAccount(userId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved" || !isSystemAdmin(profile)) throw new Error("Not authorized.");
  if (userId === profile.id) throw new Error("Cannot suspend your own account.");

  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("status").eq("id", userId).single();
  if (!target || target.status !== "approved") throw new Error("Only approved accounts can be suspended.");

  const { error } = await admin
    .from("profiles")
    .update({ status: "suspended" })
    .eq("id", userId);

  if (error) throw error;

  await admin.from("audit_log").insert({
    actor_id: profile.id,
    action: "suspend_account",
    target_type: "profile",
    target_id: userId,
  });

  revalidatePath("/admin/accounts");
}

export async function reactivateAccount(userId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved" || !isSystemAdmin(profile)) throw new Error("Not authorized.");

  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("status").eq("id", userId).single();
  if (!target || target.status !== "suspended") throw new Error("Only suspended accounts can be reactivated.");

  const { error } = await admin
    .from("profiles")
    .update({ status: "approved" })
    .eq("id", userId);

  if (error) throw error;

  await admin.from("audit_log").insert({
    actor_id: profile.id,
    action: "reactivate_account",
    target_type: "profile",
    target_id: userId,
  });

  revalidatePath("/admin/accounts");
}

export async function promoteToAdmin(userId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved" || !isSystemAdmin(profile)) throw new Error("Not authorized.");
  if (userId === profile.id) throw new Error("Cannot change your own role.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: "system_admin" })
    .eq("id", userId);

  if (error) throw error;

  await admin.from("audit_log").insert({
    actor_id: profile.id,
    action: "promote_to_admin",
    target_type: "profile",
    target_id: userId,
  });

  revalidatePath("/admin/accounts");
}

export async function revokeAdmin(userId: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved" || !isSystemAdmin(profile)) throw new Error("Not authorized.");
  if (userId === profile.id) throw new Error("Cannot change your own role.");

  const admin = createAdminClient();

  // Determine correct role from unit assignment
  const { data: target } = await admin
    .from("profiles")
    .select("unit_id, units(is_qao)")
    .eq("id", userId)
    .single();

  const isQaoUnit = (target as any)?.units?.is_qao ?? false;
  const downgradedRole = isQaoUnit ? "qao" : "office_user";

  const { error } = await admin
    .from("profiles")
    .update({ role: downgradedRole })
    .eq("id", userId);

  if (error) throw error;

  await admin.from("audit_log").insert({
    actor_id: profile.id,
    action: "revoke_admin",
    target_type: "profile",
    target_id: userId,
    meta: { reverted_to: downgradedRole },
  });

  revalidatePath("/admin/accounts");
}
