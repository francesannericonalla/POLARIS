import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Used in Server Components, Server Actions, and Route Handlers.
// Reads/writes the auth cookie so we know who is logged in. Still uses
// the anon key -- this client is for "who is this?", not for fetching
// confidential documents. Actual data access goes through
// lib/supabase/admin.ts after we've checked the caller's role.
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component during render -- the
            // middleware refreshes the session instead, so this is safe
            // to ignore.
          }
        },
      },
    }
  );
}
