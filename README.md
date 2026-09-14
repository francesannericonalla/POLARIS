# POLARIS

**P**erformance and **O**rganization **L**eadership **A**nalytics, **R**eporting, and **I**nstitutional **S**tewardship

A document repository portal for CIT-U's Quality Assurance Office. Every college/department and
administration office submits its required documents here; QAO can see everything, offices only see
their own.

This is the **core system** (auth, roles, repository, upload/version/archive, basic dashboard). It
intentionally does **not** yet include: KPI auto-extraction from Excel templates, Complete/Pending
completion status, or notifications — those are still pending decisions from the QAO planning
meeting (see the System Proposal document, Sections 7.1 and 11).

---

## 1. Tech stack

- **Next.js 14** (App Router, TypeScript) — deployed on Vercel
- **Supabase** — Postgres database, Auth, and Storage
- **Tailwind CSS** — styling, using CIT-U's maroon/gold palette

## 2. One-time Supabase setup

1. Create a new project at [supabase.com](https://supabase.com) (the free tier works to start —
   see the note on limits below).
2. Open the **SQL Editor** and run `supabase/schema.sql` (creates all tables + locks down RLS).
3. Then run `supabase/seed.sql` in the same SQL Editor (populates the College of Engineering &
   Architecture departments, all 32 administration offices, and their standard folders — exactly
   as confirmed in the proposal). **Add the remaining colleges the same way** once Sir Hanz
   finalizes the list — copy the pattern inside the `do $$ ... $$` block.
4. Go to **Storage** and create a new bucket named exactly `documents`. Set it to **Private** (not
   public) — the app hands out short-lived signed URLs for downloads instead.
5. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep this secret — never commit it,
     never put it in a `NEXT_PUBLIC_*` variable)

## 3. Create the initial QAO + System Administrator accounts

There's no public way to become a QAO account — they're seeded directly. Edit the account list in
`scripts/seed-accounts.mjs` with real names/emails, then run once from your machine:

```bash
npm install
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node scripts/seed-accounts.mjs
```

This creates 3 QAO accounts and 1 System Administrator account with a temporary password
(`ChangeMe!12345` by default — change it in the script, and have each person change their password
after first login). Regular office/department staff create their own accounts through `/signup`
and wait for a QAO account to approve them at `/admin/approvals`.

## 4. Local development

```bash
npm install
cp .env.local.example .env.local   # fill in the 3 Supabase values from step 2
npm run dev
```

Visit `http://localhost:3000`.

## 5. Deploying to Vercel

1. Push this project to a GitHub repo.
2. In Vercel, **Import Project** from that repo.
3. Under **Environment Variables**, add the same 3 values from step 2
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Deploy. Vercel will run `next build` automatically — no other configuration needed.

## 6. Known limitations (Supabase free tier)

- **1 GB total file storage**, 50 MB max per individual file. Fine for early testing/demo; a
  semester of real uploads across many offices will likely exceed this. Supabase Pro ($25/mo)
  raises both.
- **500 MB database.** Document *metadata* is tiny (a row per file, not the file itself), so this
  should last a long time even on free tier.
- **Free projects auto-pause after 7 days with no activity.** Not a concern once staff are using it
  regularly; only matters if the project sits completely idle (e.g., over a long break).

## 7. How the core decisions were implemented

- **No hard deletion** — `documents.archived` is a soft-delete flag. Nothing is ever removed from
  the database or from Storage. QAO can always see archived files and full version history.
- **Versioning** — uploading a "new version" of an existing document inserts a *new* row with
  `previous_version_id` pointing at the old one, and flips the old row's `is_latest` to `false`.
  The full chain is always walkable.
- **Confidentiality** — all real data access goes through server-side code using the Supabase
  **service role key**, which never reaches the browser. Every function checks the caller's role
  and unit (`src/lib/permissions.ts`) before returning anything. Office users can only ever see
  their own unit; QAO can see everything; System Administrator can see accounts but not document
  contents.
- **Signup → approval flow** — new accounts start as `status = 'pending'` and can log in but see
  only a "waiting for approval" screen (`/pending`) until a QAO account approves them at
  `/admin/approvals`.

## 8. What's deliberately not built yet

See Section 11 ("Open Items") of the System Proposal document. In short: KPI number extraction from
Excel templates, and Complete/Pending completion status, both depend on decisions still pending
from the QAO planning meeting. The dashboard currently shows simple, defensible counts (active
documents per office) instead of inventing logic for those.
