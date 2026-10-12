-- Vervangt landcodes door losse punten (lat/lng/naam) op een echte kaart.
-- Milan heeft nog geen landen ingevuld, dus geen migratiepad nodig: de kolom
-- mag vervallen.

drop index if exists items_countries_idx;
alter table public.items drop column if exists countries;

create table if not exists public.item_locations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists item_locations_item_id_idx on public.item_locations (item_id);

alter table public.item_locations enable row level security;

drop policy if exists "item_locations_select_own" on public.item_locations;
create policy "item_locations_select_own" on public.item_locations
  for select using (
    exists (select 1 from public.items where items.id = item_locations.item_id and items.user_id = auth.uid())
  );

drop policy if exists "item_locations_insert_own" on public.item_locations;
create policy "item_locations_insert_own" on public.item_locations
  for insert with check (
    exists (select 1 from public.items where items.id = item_locations.item_id and items.user_id = auth.uid())
  );

drop policy if exists "item_locations_update_own" on public.item_locations;
create policy "item_locations_update_own" on public.item_locations
  for update using (
    exists (select 1 from public.items where items.id = item_locations.item_id and items.user_id = auth.uid())
  );

drop policy if exists "item_locations_delete_own" on public.item_locations;
create policy "item_locations_delete_own" on public.item_locations
  for delete using (
    exists (select 1 from public.items where items.id = item_locations.item_id and items.user_id = auth.uid())
  );
