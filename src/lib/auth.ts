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

  // Profile row itself is small and permitted by RLS for the owner,
  // but we use the admin client here too so behavior is identical
  // whether or not RLS is in place -- one code path, not two.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name, role, status, unit_id")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}
