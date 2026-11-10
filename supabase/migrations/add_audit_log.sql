create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_actor_idx on audit_log(actor_id, created_at desc);
create index audit_log_created_idx on audit_log(created_at desc);

alter table audit_log enable row level security;
