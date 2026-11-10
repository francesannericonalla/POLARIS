create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null, -- 'account_approved', 'account_rejected', 'document_uploaded'
  title text not null,
  body text not null,
  read boolean not null default false,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on notifications(user_id, read, created_at desc);

alter table notifications enable row level security;
