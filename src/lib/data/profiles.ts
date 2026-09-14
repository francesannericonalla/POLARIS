import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  role: "office_user" | "qao" | "system_admin";
  status: "pending" | "approved" | "rejected";
  unit_id: string | null;
  created_at: string;
  unit_name?: string;
};

export async function getProfilesByStatus(status: "pending" | "approved" | "rejected"): Promise<ProfileRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*, units(name)")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as any[]).map((p) => ({ ...p, unit_name: p.units?.name }));
}

export async function getAllProfiles(): Promise<ProfileRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*, units(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as any[]).map((p) => ({ ...p, unit_name: p.units?.name }));
}
