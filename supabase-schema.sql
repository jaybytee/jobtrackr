-- ============================================================
-- JobTrackr - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- JOBS TABLE
create table public.jobs (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  company       text not null,
  role          text not null,
  status        text not null default 'applied'
                  check (status in ('applied','interview','offer','rejected')),
  date_applied  date not null,
  job_link      text,
  notes         text,
  interview_date date,
  salary_range  text,
  location      text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- Row Level Security
alter table public.jobs enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own jobs"
  on public.jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert own jobs"
  on public.jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own jobs"
  on public.jobs for update
  using (auth.uid() = user_id);

create policy "Users can delete own jobs"
  on public.jobs for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_jobs_updated
  before update on public.jobs
  for each row execute function public.handle_updated_at();

-- Index for faster queries
create index jobs_user_id_idx on public.jobs (user_id);
create index jobs_status_idx on public.jobs (status);
