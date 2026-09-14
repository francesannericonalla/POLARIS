import { createBrowserClient } from "@supabase/ssr";

// Used inside Client Components. Only ever talks to Supabase with the
// public anon key, which is safe to expose to the browser. Row-level
// access to real data still happens through our own server actions,
// which run with a privileged key that never reaches the browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
