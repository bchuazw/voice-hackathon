-- Run this once in the Supabase SQL editor for a new project.
-- Free-tier compatible. Adjust if you want RLS / multi-user.

create extension if not exists vector;

create table if not exists thoughts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  transcript text not null,
  classification jsonb not null,
  integration_result jsonb,
  conversation_id text,
  embedding vector(1536),
  captured_at timestamptz not null default now(),
  resurfaced_at timestamptz
);

create index if not exists thoughts_captured_at_idx on thoughts (captured_at desc);
create index if not exists thoughts_user_idx on thoughts (user_id);

-- For server-side use only. Set service-role key in .env.local; do not expose to browser.
