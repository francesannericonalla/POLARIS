// One-time setup script: creates the initial QAO staff accounts and
// the System Administrator account. Run locally with:
//
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-accounts.mjs
//
// Edit the ACCOUNTS list below first with real names/emails.
// Everyone gets a temporary password they should change on first login.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ACCOUNTS = [
  { email: "hanz@cit.edu", full_name: "Hanz (QAO)", role: "qao" },
  { email: "qao.staff2@cit.edu", full_name: "QAO Staff 2", role: "qao" },
  { email: "qao.staff3@cit.edu", full_name: "QAO Staff 3", role: "qao" },
  { email: "mis.admin@cit.edu", full_name: "MIS System Administrator", role: "system_admin" },
];

const TEMP_PASSWORD = "ChangeMe!12345"; // change immediately after first login

async function main() {
  const { data: qaoUnit, error: unitErr } = await supabase
    .from("units")
    .select("id")
    .eq("is_qao", true)
    .single();

  if (unitErr || !qaoUnit) {
    console.error("Could not find the QAO unit -- did you run seed.sql first?", unitErr);
    process.exit(1);
  }

  for (const account of ACCOUNTS) {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: account.email,
      password: TEMP_PASSWORD,
      email_confirm: true,
    });

    if (createErr) {
      console.error(`Failed to create ${account.email}:`, createErr.message);
      continue;
    }

    const { error: profileErr } = await supabase.from("profiles").insert({
      id: created.user.id,
      email: account.email,
      full_name: account.full_name,
      role: account.role,
      status: "approved",
      unit_id: account.role === "qao" ? qaoUnit.id : null,
      approved_at: new Date().toISOString(),
    });

    if (profileErr) {
      console.error(`Created auth user but failed to create profile for ${account.email}:`, profileErr.message);
    } else {
      console.log(`Created ${account.role}: ${account.email} (temp password: ${TEMP_PASSWORD})`);
    }
  }
}

main();
