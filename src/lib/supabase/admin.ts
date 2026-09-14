import "server-only";
import { createClient } from "@supabase/supabase-js";

// This client uses the SUPABASE_SERVICE_ROLE_KEY, which bypasses Row
// Level Security entirely. It must never be imported into a Client
// Component or sent to the browser -- the "server-only" import above
// makes the build fail if that ever happens by accident.
//
// Every function that uses this client is responsible for checking
// who the caller is (getCurrentProfile) and whether they're allowed to
// do what they're asking, BEFORE touching the database or storage.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
