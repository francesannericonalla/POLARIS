-- ============================================================
-- POLARIS database schema
-- Run this once in the Supabase SQL Editor on a fresh project.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- UNITS: colleges, departments, and administration offices.
-- A "college" has no parent and branch = 'academics'.
-- A "department" has a college as its parent.
-- An "office" has no parent and branch = 'administration'.
-- ------------------------------------------------------------
create table units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('college', 'department', 'office')),
  branch text not null check (branch in ('academics', 'administration')),
  parent_id uuid references units(id) on delete cascade,
  is_qao boolean not null default false, -- true only for the QAO-Administration unit
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index units_parent_idx on units(parent_id);
create index units_branch_idx on units(branch);

-- ------------------------------------------------------------
-- FOLDERS: the standardized repository categories.
-- Seeded per-unit (every department/office gets the same 7,
-- plus QAO-Administration gets extra QAO-exclusive folders).
-- ------------------------------------------------------------
create table folders (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  name text not null,
  is_qao_exclusive boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (unit_id, name)
);

create index folders_unit_idx on folders(unit_id);

-- ------------------------------------------------------------
-- PROFILES: one row per auth user. Mirrors auth.users, adds our
-- own app-specific fields (role, approval status, home unit).
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'office_user' check (role in ('office_user', 'qao', 'system_admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  unit_id uuid references units(id),
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create index profiles_unit_idx on profiles(unit_id);
create index profiles_status_idx on profiles(status);

-- ------------------------------------------------------------
-- DOCUMENTS: uploaded files, with version chaining and
-- archive (soft-delete) instead of hard deletion.
-- ------------------------------------------------------------
create table documents (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references folders(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade, -- denormalized for fast filtering
  title text not null,               -- user-facing label, carried across versions
  file_name text not null,           -- original uploaded filename for this version
  storage_path text not null,        -- path inside the Supabase Storage bucket
  mime_type text not null,
  file_size bigint not null,
  school_year text not null,         -- e.g. "2025-2026"
  semester text not null check (semester in ('1st', '2nd', 'Summer')),
  version int not null default 1,
  previous_version_id uuid references documents(id),
  is_latest boolean not null default true,
  archived boolean not null default false,
  uploaded_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create index documents_folder_idx on documents(folder_id);
create index documents_unit_idx on documents(unit_id);
create index documents_latest_idx on documents(folder_id, is_latest, archived);

-- ------------------------------------------------------------
-- AUDIT LOG: who did what, for accountability (especially for
-- System Administrator actions, since that role has no standing
-- access to document contents).
-- ------------------------------------------------------------
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- The app talks to the database through the service-role key from
-- trusted server code (see src/lib/supabase/admin.ts), which
-- bypasses RLS by design. These policies are a defense-in-depth
-- backstop in case a table is ever queried with the anon/browser
-- key: by default, nothing is readable or writable.
-- ------------------------------------------------------------
alter table units enable row level security;
alter table folders enable row level security;
alter table profiles enable row level security;
alter table documents enable row level security;
alter table audit_log enable row level security;

-- Authenticated users may read their own profile row directly
-- (used right after login to check approval status/role).
create policy "read own profile" on profiles
  for select using (auth.uid() = id);

-- No other policies are defined -- everything else (units, folders,
-- documents, audit_log, and writes to profiles) is only reachable
-- through server actions using the service-role key.
