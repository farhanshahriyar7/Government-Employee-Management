-- Migration: create training and foreign information tables
-- This migration creates 5 tables for managing training and foreign-related data:
-- 1. domestic_trainings - Domestic training records
-- 2. foreign_trainings - Foreign training records
-- 3. foreign_travels - Foreign travel information
-- 4. foreign_postings - Foreign posting records
-- 5. lien_deputations - Lien/Deputation records

-- ============================================
-- 1. Domestic Trainings Table
-- ============================================
create table if not exists public.domestic_trainings (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_name text not null,
  institution_name text not null,
  duration text not null,
  funding_source text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups
create index if not exists idx_domestic_trainings_user_id on public.domestic_trainings(user_id);

-- RLS policies
alter table public.domestic_trainings enable row level security;

create policy "Users can view own domestic trainings"
  on public.domestic_trainings for select
  using (auth.uid() = user_id);

create policy "Users can insert own domestic trainings"
  on public.domestic_trainings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own domestic trainings"
  on public.domestic_trainings for update
  using (auth.uid() = user_id);

create policy "Users can delete own domestic trainings"
  on public.domestic_trainings for delete
  using (auth.uid() = user_id);

-- ============================================
-- 2. Foreign Trainings Table
-- ============================================
create table if not exists public.foreign_trainings (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_name text not null,
  institution_name text not null,
  country text not null,
  duration text not null,
  funding_source text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups
create index if not exists idx_foreign_trainings_user_id on public.foreign_trainings(user_id);

-- RLS policies
alter table public.foreign_trainings enable row level security;

create policy "Users can view own foreign trainings"
  on public.foreign_trainings for select
  using (auth.uid() = user_id);

create policy "Users can insert own foreign trainings"
  on public.foreign_trainings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own foreign trainings"
  on public.foreign_trainings for update
  using (auth.uid() = user_id);

create policy "Users can delete own foreign trainings"
  on public.foreign_trainings for delete
  using (auth.uid() = user_id);

-- ============================================
-- 3. Foreign Travels Table
-- ============================================
create table if not exists public.foreign_travels (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  purpose text not null,       -- workshop, seminar, studyTour, other
  duration text not null,
  country text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups
create index if not exists idx_foreign_travels_user_id on public.foreign_travels(user_id);

-- RLS policies
alter table public.foreign_travels enable row level security;

create policy "Users can view own foreign travels"
  on public.foreign_travels for select
  using (auth.uid() = user_id);

create policy "Users can insert own foreign travels"
  on public.foreign_travels for insert
  with check (auth.uid() = user_id);

create policy "Users can update own foreign travels"
  on public.foreign_travels for update
  using (auth.uid() = user_id);

create policy "Users can delete own foreign travels"
  on public.foreign_travels for delete
  using (auth.uid() = user_id);

-- ============================================
-- 4. Foreign Postings Table
-- ============================================
create table if not exists public.foreign_postings (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  designation text not null,
  institution_name text not null,
  country text not null,
  duration text not null,
  funding_source text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups
create index if not exists idx_foreign_postings_user_id on public.foreign_postings(user_id);

-- RLS policies
alter table public.foreign_postings enable row level security;

create policy "Users can view own foreign postings"
  on public.foreign_postings for select
  using (auth.uid() = user_id);

create policy "Users can insert own foreign postings"
  on public.foreign_postings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own foreign postings"
  on public.foreign_postings for update
  using (auth.uid() = user_id);

create policy "Users can delete own foreign postings"
  on public.foreign_postings for delete
  using (auth.uid() = user_id);

-- ============================================
-- 5. Lien/Deputations Table
-- ============================================
create table if not exists public.lien_deputations (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  designation text not null,
  institution_name text not null,
  country text not null,
  duration text not null,
  funding_source text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups
create index if not exists idx_lien_deputations_user_id on public.lien_deputations(user_id);

-- RLS policies
alter table public.lien_deputations enable row level security;

create policy "Users can view own lien deputations"
  on public.lien_deputations for select
  using (auth.uid() = user_id);

create policy "Users can insert own lien deputations"
  on public.lien_deputations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lien deputations"
  on public.lien_deputations for update
  using (auth.uid() = user_id);

create policy "Users can delete own lien deputations"
  on public.lien_deputations for delete
  using (auth.uid() = user_id);

-- ============================================
-- Triggers for updated_at timestamps
-- ============================================

-- Ensure the trigger function exists
create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Domestic trainings trigger
drop trigger if exists set_timestamp on public.domestic_trainings;
create trigger set_timestamp
  before update on public.domestic_trainings
  for each row execute function public.trigger_set_timestamp();

-- Foreign trainings trigger
drop trigger if exists set_timestamp on public.foreign_trainings;
create trigger set_timestamp
  before update on public.foreign_trainings
  for each row execute function public.trigger_set_timestamp();

-- Foreign travels trigger
drop trigger if exists set_timestamp on public.foreign_travels;
create trigger set_timestamp
  before update on public.foreign_travels
  for each row execute function public.trigger_set_timestamp();

-- Foreign postings trigger
drop trigger if exists set_timestamp on public.foreign_postings;
create trigger set_timestamp
  before update on public.foreign_postings
  for each row execute function public.trigger_set_timestamp();

-- Lien deputations trigger
drop trigger if exists set_timestamp on public.lien_deputations;
create trigger set_timestamp
  before update on public.lien_deputations
  for each row execute function public.trigger_set_timestamp();
