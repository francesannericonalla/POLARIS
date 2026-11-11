import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type ComplianceDeadline = {
  id: string;
  school_year: string;
  semester: "1st" | "2nd" | "Summer";
  deadline_date: string;
  label: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export async function getDeadlinesForSchoolYear(schoolYear: string): Promise<ComplianceDeadline[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("compliance_deadlines")
    .select("*")
    .eq("school_year", schoolYear)
    .order("semester");
  return (data ?? []) as ComplianceDeadline[];
}

