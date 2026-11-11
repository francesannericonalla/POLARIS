"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/data/notifications";

const SEM_LABEL: Record<string, string> = {
  "1st": "1st Semester",
  "2nd": "2nd Semester",
  "Summer": "Summer",
};

export async function upsertDeadline(
  schoolYear: string,
  semester: "1st" | "2nd" | "Summer",
  deadlineDate: string,
  label: string | null
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved" || profile.role !== "qao") throw new Error("Unauthorized");

  const admin = createAdminClient();

  // Check if a row already exists for this school_year + semester
  const { data: existing } = await admin
    .from("compliance_deadlines")
    .select("id")
    .eq("school_year", schoolYear)
    .eq("semester", semester)
    .single();

  let error;
  if (existing) {
    ({ error } = await admin
      .from("compliance_deadlines")
      .update({
        deadline_date: deadlineDate,
        label: label || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id));
  } else {
    ({ error } = await admin
      .from("compliance_deadlines")
      .insert({
        school_year: schoolYear,
        semester,
        deadline_date: deadlineDate,
        label: label || null,
        created_by: profile.id,
      }));
  }

  if (error) throw new Error(error.message);

  await admin.from("audit_log").insert({
    actor_id: profile.id,
    action: "upsert_deadline",
    target_type: "compliance_deadline",
    meta: { school_year: schoolYear, semester, deadline_date: deadlineDate },
  });

  // Notify all office users
  const { data: officeUsers } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "office_user")
    .eq("status", "approved");

  if (officeUsers && officeUsers.length > 0) {
    const dateFormatted = new Date(deadlineDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const semLabel = SEM_LABEL[semester] ?? semester;
    await Promise.all(
      officeUsers.map((u: any) =>
        createNotification(
          u.id,
          "deadline_set",
          "Submission Deadline Set",
          `The ${semLabel} deadline for SY ${schoolYear} has been set to ${dateFormatted}.`
        )
      )
    );
  }

  revalidatePath("/dashboard");
}

export async function deleteDeadline(schoolYear: string, semester: "1st" | "2nd" | "Summer") {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved" || profile.role !== "qao") throw new Error("Unauthorized");

  const admin = createAdminClient();
  const { error } = await admin
    .from("compliance_deadlines")
    .delete()
    .eq("school_year", schoolYear)
    .eq("semester", semester);

  if (error) throw new Error(error.message);

  await admin.from("audit_log").insert({
    actor_id: profile.id,
    action: "delete_deadline",
    target_type: "compliance_deadline",
    meta: { school_year: schoolYear, semester },
  });

  revalidatePath("/dashboard");
}
