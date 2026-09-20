# POLARIS

**P**erformance and **O**rganization **L**eadership **A**nalytics, **R**eporting, and **I**nstitutional **S**tewardship

A document repository and compliance tracking portal for CIT-U's Quality Assurance Office. Every college/department and administration office submits its required documents here; QAO can monitor submission status across all 40+ offices, offices can only see their own.

---

## Tech stack

- **Next.js 14** (App Router, TypeScript) — deployed on Vercel
- **Supabase** — Postgres database, Auth, and Storage
- **Tailwind CSS** — CIT-U maroon/gold palette, Manrope + Poppins fonts

---

## Roles

| Role | What they can do |
|---|---|
| **office_user** | Upload, version, and archive documents for their own unit. See their own submission status dashboard. |
| **qao** | Read-only access to all units' repositories, dashboards, and version histories. Archive/restore any document. Cannot upload on behalf of offices. |
| **system_admin** | Manage user accounts and approvals only. No access to document contents. |

---

## 1. One-time Supabase setup

1. Create a new project at [supabase.com](https://supabase.com) (free tier works).
2. Open the **SQL Editor** and run `supabase/schema.sql` (creates all tables and RLS policies).
3. Run `supabase/seed.sql` in the same SQL Editor — this populates all 6 colleges with their programs and standard folders:
   - College of Engineering & Architecture
   - College of Management, Business & Accountancy
   - College of Arts, Sciences & Education
   - College of Nursing & Allied Health Sciences
   - College of Computer Studies
   - College of Criminal Justice
4. Go to **Storage** and create a bucket named exactly `documents`. Set it to **Private** — the app generates short-lived signed URLs for downloads.
5. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ keep secret — never commit, never use `NEXT_PUBLIC_`

---

## 2. Seed QAO and System Administrator accounts

There's no public signup for QAO or System Admin — they're created directly. Edit `scripts/seed-accounts.mjs` with real names/emails, then run once:

```bash
npm install
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node scripts/seed-accounts.mjs
```

Default temporary password is `ChangeMe!12345` — change it in the script and have each person reset after first login. Office staff register themselves at `/signup` and wait for QAO approval.

---

## 3. Local development

```bash
npm install
cp .env.local.example .env.local   # fill in the 3 Supabase values
npm run dev
```

Visit `http://localhost:3000`.

---

## 4. Deploying to Vercel

1. Push to a GitHub repo.
2. In Vercel, **Import Project** from that repo.
3. Add the 3 environment variables under **Environment Variables**.
4. Deploy — Vercel runs `next build` automatically.

Merging a branch into `main` triggers a Production deployment automatically.

---

## 5. How the system works

### Submission compliance tracking
Every program/department has the same set of standard folders (BUYLO, Balance Scorecard, Accreditation Documents, SDG Aligned Projects, Faculty Evaluation, Research Undertakings, ISO Documents). The system tracks whether each folder has at least one document filed for the current school year, producing a per-folder **Submitted / Pending / No files** status without any manual input.

### Document versioning
Uploading a "new version" inserts a new row with `previous_version_id` pointing at the old one and flips `is_latest` to `false` on the previous row. The full version chain is always walkable. Both the office user and QAO can download any historical version.

### No hard deletions
`documents.archived` is the only removal path — a soft-delete flag. Nothing is ever removed from the database or from Storage. Archived documents are hidden from the default view but visible under the Archived tab, and can be restored at any time.

### Permission model
All data access is server-side using the Supabase service role key, which never reaches the browser. Every function in `src/lib/permissions.ts` checks the caller's role and unit_id before returning data.

- `canAccessUnitRepository` — QAO: any unit. office_user: own unit only. system_admin: never.
- `canUploadToUnit` — office_user of that unit only. QAO cannot upload on behalf of offices.
- `canArchiveDocument` — delegates to `canAccessUnitRepository` (QAO can archive/restore any unit).

### Signup → approval flow
New accounts start as `status = 'pending'` and land on a waiting screen (`/pending`) after login. A QAO account approves them at `/admin/approvals`, at which point they can access their dashboard and repository.

---

## 6. Supabase free tier limits

- **1 GB file storage**, 50 MB max per file — fine for early use; a full semester across all offices may exceed this. Supabase Pro ($25/mo) raises both limits.
- **500 MB database** — document metadata is tiny, this should last a long time.
- **Projects pause after 7 days of no activity** — not a concern once staff are actively using the system.
