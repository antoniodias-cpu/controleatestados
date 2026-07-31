-- Execute no SQL Editor do Supabase
-- Tabela opcional para dados complementares do usuario
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "profile_select_own"
on public.user_profiles
for select
using (auth.uid() = id);

create policy "profile_insert_own"
on public.user_profiles
for insert
with check (auth.uid() = id);

create policy "profile_update_own"
on public.user_profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
