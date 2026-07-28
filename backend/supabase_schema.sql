-- Optional: Supabase tables are created automatically by SQLAlchemy on first API request
-- when using the backend DATABASE_URL pointed at Supabase Postgres.
--
-- If you prefer to create tables manually in Supabase SQL editor, use:

create table if not exists projects (
  id text primary key,
  user_id text not null,
  name text not null,
  craft_type text not null default 'knitting',
  created_at timestamp not null default now()
);

create index if not exists idx_projects_user_id on projects(user_id);

create table if not exists counters (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  label text not null,
  value integer not null default 0,
  type text not null default 'stitch'
);

create index if not exists idx_counters_project_id on counters(project_id);

create table if not exists pattern_items (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  row_number integer not null,
  instruction text not null,
  completed boolean not null default false,
  notes text not null default '',
  stitch_count integer
);

create index if not exists idx_pattern_items_project_id on pattern_items(project_id);

-- Enable Row Level Security if accessing Supabase directly from the client in the future.
-- For this app, the FastAPI backend uses a service role / direct DB connection.
