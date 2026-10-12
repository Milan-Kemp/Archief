-- year_start optioneel (filosofie/wetenschap: een stroming/onderwerp hoeft niet aan
-- één jaartal te hangen) + topic-veld voor groeperen per onderwerp/stroming.

alter table public.items alter column year_start drop not null;
alter table public.items add column if not exists topic text;

create index if not exists items_topic_idx on public.items (topic);
