-- Execute no SQL Editor do Supabase
-- Estrutura para listar usuarios cadastrados
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  cidade text not null default '',
  email text unique not null,
  senha_mask text not null default '********',
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "profile_select_own" on public.user_profiles;
drop policy if exists "profile_insert_own" on public.user_profiles;
drop policy if exists "profile_update_own" on public.user_profiles;

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

create or replace function public.sync_user_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, nome, cidade, email, senha_mask)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    coalesce(new.raw_user_meta_data->>'cidade', ''),
    coalesce(new.email, ''),
    '********'
  )
  on conflict (id) do update
  set
    nome = excluded.nome,
    cidade = excluded.cidade,
    email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.sync_user_profile_from_auth();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row
execute function public.sync_user_profile_from_auth();

insert into public.user_profiles (id, nome, cidade, email, senha_mask)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'nome', ''),
  coalesce(u.raw_user_meta_data->>'cidade', ''),
  coalesce(u.email, ''),
  '********'
from auth.users u
on conflict (id) do update
set
  nome = excluded.nome,
  cidade = excluded.cidade,
  email = excluded.email;

-- Tabela de atestados
create table if not exists public.atestados (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  nome_completo text not null,
  turma text not null,
  turno text not null,
  data_entrega date not null,
  data_inicio date not null,
  data_termino date not null,
  hora_inicio time not null,
  hora_termino time not null,
  motivo text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_atestados_user_created_at
on public.atestados (user_id, created_at desc);

alter table public.atestados enable row level security;

drop policy if exists "atestados_select_own" on public.atestados;
drop policy if exists "atestados_insert_own" on public.atestados;
drop policy if exists "atestados_update_own" on public.atestados;
drop policy if exists "atestados_delete_own" on public.atestados;

create policy "atestados_select_own"
on public.atestados
for select
using (auth.uid() = user_id);

create policy "atestados_insert_own"
on public.atestados
for insert
with check (auth.uid() = user_id);

create policy "atestados_update_own"
on public.atestados
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "atestados_delete_own"
on public.atestados
for delete
using (auth.uid() = user_id);
