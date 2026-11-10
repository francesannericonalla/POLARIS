-- Compliance deadlines: QAO sets a submission deadline per school year per semester.
-- One active deadline per (school_year, semester) combination.
create table compliance_deadlines (
  id uuid primary key default gen_random_uuid(),
  school_year text not null,
  semester text not null check (semester in ('1st', '2nd', 'Summer')),
  deadline_date date not null,
  label text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_year, semester)
);

alter table compliance_deadlines enable row level security;
