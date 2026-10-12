-- Landen aanklikken op een wereldkaart i.p.v. vrije tekst in `region`.
-- countries = array van ISO 3166-1 alpha-2 codes.

alter table public.items add column if not exists countries text[] not null default '{}';

create index if not exists items_countries_idx on public.items using gin (countries);

-- Best-effort migratie van de oude vrije-tekst `region`-waarden. Alleen exacte,
-- veelvoorkomende landnamen worden herkend; de rest blijft leeg staan en moet
-- handmatig opnieuw gekozen worden op de kaart. `region` blijft in de tabel
-- staan (ongebruikt door de UI) zodat er niets verloren gaat.
update public.items set countries = array['NL'] where countries = '{}' and lower(trim(region)) in ('nederland', 'netherlands', 'holland');
update public.items set countries = array['BE'] where countries = '{}' and lower(trim(region)) in ('belgië', 'belgie', 'belgium');
update public.items set countries = array['FR'] where countries = '{}' and lower(trim(region)) in ('frankrijk', 'france');
update public.items set countries = array['DE'] where countries = '{}' and lower(trim(region)) in ('duitsland', 'germany');
update public.items set countries = array['GR'] where countries = '{}' and lower(trim(region)) in ('griekenland', 'greece');
update public.items set countries = array['IT'] where countries = '{}' and lower(trim(region)) in ('italië', 'italie', 'italy', 'rome');
update public.items set countries = array['ES'] where countries = '{}' and lower(trim(region)) in ('spanje', 'spain');
update public.items set countries = array['GB'] where countries = '{}' and lower(trim(region)) in ('engeland', 'verenigd koninkrijk', 'uk', 'united kingdom', 'groot-brittannië', 'groot-brittannie');
update public.items set countries = array['US'] where countries = '{}' and lower(trim(region)) in ('vs', 'verenigde staten', 'usa', 'united states', 'amerika');
update public.items set countries = array['CN'] where countries = '{}' and lower(trim(region)) in ('china');
update public.items set countries = array['EG'] where countries = '{}' and lower(trim(region)) in ('egypte', 'egypt');
update public.items set countries = array['TR'] where countries = '{}' and lower(trim(region)) in ('turkije', 'turkey', 'ottomaanse rijk', 'byzantium', 'constantinopel');
