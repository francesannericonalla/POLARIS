import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "office_user" | "qao" | "system_admin";
  status: "pending" | "approved" | "rejected";
  unit_id: string | null;
  id_number: string | null;
  unit_name: string | null;
};

// The one place that answers "who is making this request, and are
// they allowed in at all?". Every server action / page that touches
// real data should call this first.
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name, role, status, unit_id, id_number")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  let unit_name: string | null = null;
  if ((profile as any).unit_id) {
    const { data: unit } = await admin
      .from("units")
      .select("name")
      .eq("id", (profile as any).unit_id)
      .single();
    unit_name = unit?.name ?? null;
  }

  return { ...(profile as any), unit_name } as Profile;
}
