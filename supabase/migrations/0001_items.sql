-- Fase 1: tabel items + RLS
-- Uitvoeren in Supabase SQL editor (of via supabase CLI migratie).

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('video', 'book', 'article')),
  url text,
  title text not null,
  author text,
  thumbnail_url text,
  domain text not null check (domain in ('history', 'philosophy', 'science')),
  year_start integer not null,
  year_end integer,
  date_precision text not null check (date_precision in ('exact', 'decade', 'century', 'era')),
  region text,
  people text[] not null default '{}',
  tags text[] not null default '{}',
  notes text not null default '',
  status text not null default 'to_watch' check (status in ('to_watch', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_user_id_idx on public.items (user_id);
create index if not exists items_domain_idx on public.items (domain);

-- updated_at automatisch bijhouden
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row
  execute function public.set_updated_at();

-- RLS: verplicht aan, zonder dit is de anon key een open deur (zie SPEC risico 1)
alter table public.items enable row level security;

drop policy if exists "items_select_own" on public.items;
create policy "items_select_own" on public.items
  for select using (user_id = auth.uid());

drop policy if exists "items_insert_own" on public.items;
create policy "items_insert_own" on public.items
  for insert with check (user_id = auth.uid());

drop policy if exists "items_update_own" on public.items;
create policy "items_update_own" on public.items
  for update using (user_id = auth.uid());

drop policy if exists "items_delete_own" on public.items;
create policy "items_delete_own" on public.items
  for delete using (user_id = auth.uid());
