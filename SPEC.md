# Tijdlijn: persoonlijke kennistijdlijn

Spec voor Claude Code. Lees dit volledig voordat je begint. Bouw in de volgorde van "Bouwvolgorde" en stop na elke fase zodat Milan kan testen.

---

## 1. Het echte doel

Op papier is dit een app om YouTube-video's, boeken en artikelen op te slaan met notities. Dat is niet het doel. Dat kan Notion of Raindrop ook.

Het doel is drie dingen:

1. **Zien waar kennis in de tijd zit.** Niet "wat heb ik opgeslagen" maar "wat weet ik over de 17e eeuw, en waar zitten de gaten". De tijdlijn is de hoofdweergave, niet een lijst.
2. **Verbanden tussen domeinen zien.** Wat gebeurde er in de filosofie terwijl de Dertigjarige Oorlog liep? Wat wist men van astronomie in de tijd van de Romeinen? De killer feature is één tijdlijn waar geschiedenis, filosofie en wetenschap naast elkaar staan.
3. **Researchdatabase voor een historisch YouTube-kanaal.** Notities moeten later bruikbaar zijn als bron voor scripts. Dus: bron en tijdstempel in de video bewaren, niet alleen losse gedachten.

Secundair: het is een portfolioproject. Code moet netjes en leesbaar zijn, met een README die de architectuur uitlegt.

**Toetsvraag bij elke feature:** helpt dit bij één van de drie doelen hierboven? Zo niet, niet bouwen.

---

## 2. Stack

| Onderdeel | Keuze | Waarom |
|---|---|---|
| Frontend | React + Vite + TypeScript | Statische build, past op GitHub Pages |
| Styling | Tailwind CSS | Snel, consistente spacing |
| Routing | React Router met **HashRouter** | GitHub Pages ondersteunt geen SPA-routing (zie risico's) |
| Data | Supabase (Postgres + Auth) | Gratis, synct pc en telefoon |
| Tijdlijn | Eigen component (geen library), zie sectie 6 | Libraries kunnen diepe tijd niet aan |
| PWA | `vite-plugin-pwa` | Installeerbaar op telefoon |
| Hosting | GitHub Pages via GitHub Actions | Bekende workflow |
| Notities | Markdown, render met `react-markdown` | Simpel, exporteerbaar |
| Kaart | `react-leaflet` + `react-leaflet-cluster`, vector-tegels van OpenFreeMap (via `@maplibre/maplibre-gl-leaflet`), Nominatim voor geocoding | Gratis, geen API-key, geen watermerk, echte interactieve kaart met zoom/pan en clustering |

Geen andere dependencies toevoegen zonder het eerst te vragen.

---

## 3. Datamodel (Supabase)

### Tabel `items`

| Kolom | Type | Notitie |
|---|---|---|
| `id` | uuid, PK | default `gen_random_uuid()` |
| `user_id` | uuid | FK naar `auth.users`, default `auth.uid()` |
| `type` | text | `video` / `book` / `article` |
| `url` | text, nullable | Boeken hebben niet altijd een url |
| `title` | text | |
| `author` | text, nullable | Kanaal bij video, auteur bij boek |
| `thumbnail_url` | text, nullable | |
| `domain` | text | `history` / `philosophy` / `science` |
| `topic` | text, nullable | Onderwerp/stroming, bv. "Stoïcisme", "Kwantummechanica". Los van jaartal, voor groeperen per topic |
| `year_start` | integer, nullable | Negatief = v.Chr. **Geen Date-type**, zie risico's. Optioneel: niet elk onderwerp hangt aan één jaartal (zie risico 8) |
| `year_end` | integer, nullable | Null = één moment |
| `date_precision` | text | `exact` / `decade` / `century` / `era` |
| `region` | text, nullable | **Legacy.** Oud vrij tekstveld. Blijft in de tabel staan voor oude data maar wordt niet meer getoond of bewerkt |
| `people` | text[] | |
| `tags` | text[] | |
| `notes` | text | Markdown |
| `status` | text | `to_watch` / `done` |
| `created_at` | timestamptz | Leerlog-datum, automatisch |
| `updated_at` | timestamptz | |

### Tabel `item_locations`

Losse puntlocaties per item, voor de kaartweergave. Eén item kan meerdere punten hebben (bv. een video over "de Peloponnesische Oorlog" met zowel Athene als Sparta).

| Kolom | Type | Notitie |
|---|---|---|
| `id` | uuid, PK | default `gen_random_uuid()` |
| `item_id` | uuid | FK naar `items`, on delete cascade |
| `lat` | double precision | |
| `lng` | double precision | |
| `name` | text | Plaatsnaam, automatisch via Nominatim reverse geocoding bij het klikken, handmatig overschrijfbaar |
| `created_at` | timestamptz | |

RLS via een `exists`-check op de bijbehorende `items`-rij (zelfde eigenaar-regel, geen directe `user_id` kolom nodig).

### Tabel `notes_timestamps` (fase 3)

Losse notities gekoppeld aan een moment in een video, voor het YouTube-researchdoel.

| Kolom | Type |
|---|---|
| `id` | uuid |
| `item_id` | uuid, FK naar `items`, on delete cascade |
| `seconds` | integer |
| `text` | text |

### Row Level Security (verplicht)

RLS aan op **alle** tabellen. Policy: `user_id = auth.uid()` voor select, insert, update, delete. Zie risico 1.

---

## 4. Features

### Fase 1: MVP (eerste versie die bruikbaar is)

- Inloggen met magic link (e-mail), geen wachtwoord
- Item toevoegen: url plakken, bij YouTube automatisch titel, kanaal en thumbnail ophalen
- Velden invullen: domein, topic (onderwerp/stroming), jaar start/eind (optioneel), precisie, landen, personen, tags, notities
- **Tijdlijnweergave** (hoofdscherm), met tabs: Alles / Geschiedenis / Filosofie / Wetenschap
  - Alles en Geschiedenis: alleen tijdlijn, en alleen items met een jaartal (anders is er niets om te positioneren)
  - Filosofie: schakelaar tijdlijn ↔ per onderwerp gegroepeerd (standaard tijdlijn)
  - Wetenschap: schakelaar tijdlijn ↔ per onderwerp gegroepeerd, standaard per onderwerp (grid), tijdlijn als optie
- **Kaartweergave**, als tweede hoofdweergave naast de tijdlijn, met dezelfde domein-tabs:
  - Echte interactieve kaart (zoom/pan), items als kleine thumbnail-markers, clustering bij uitzoomen
  - Klik op een marker opent een popup met het kaartje van het item en een link naar de detailpagina
  - Bij item toevoegen/bewerken: zoeken op plaatsnaam (Nominatim) en exact klikken om een punt te plaatsen, plaatsnaam automatisch ingevuld via reverse geocoding, meerdere punten per item mogelijk
- Item openen: notities lezen en bewerken, video embedded afspelen, velden bewerken
- Werkt op telefoonbreedte

### Fase 2: bruikbaar maken

- PWA-installatie (manifest, icons, service worker)
- Zoeken in titels en notities
- Filteren op tags, regio, personen
- Leerlog-weergave: wat heb ik wanneer toegevoegd (sorteren op `created_at`)
- "Te bekijken"-lijst (status `to_watch`)
- Export naar JSON (backup, zie risico 4)

### Fase 3: pas na 2 weken echt gebruiken

- Tijdstempel-notities bij video's (klik op tijdstempel springt naar dat punt in de embed)
- Gaten-weergave: welke eeuwen zijn leeg
- Claude API die transcript leest en periode, personen, tags voorstelt (via Supabase Edge Function, API-key nooit in de frontend)

**Niet bouwen:** sociale features, delen, likes, kaarten, grafieken, gamification, AI-chat. Pas toevoegen als Milan er expliciet om vraagt.

---

## 5. Design

### Richting

Clean en rustig, maar niet kaal. Het moet voelen als een studieruimte, niet als een SaaS-dashboard en niet als een kunstproject. Inhoud (thumbnails, titels, notities) is de visuele interesse, de interface zelf blijft op de achtergrond.

### Referenties en wat we eruit halen

- **Readwise Reader:** interface die wegvalt tijdens het lezen, ruime marges, notities met een regelbreedte van rond de 65 tekens. Overnemen voor de detailpagina van een item.
- **Raindrop.io:** kaarten met thumbnail, titel en bron, georganiseerd in collecties. Overnemen voor itemkaarten op de tijdlijn.
- **Linear (timeline view):** strakke filterbalk bovenaan, hoge informatiedichtheid zonder rommelig te worden, subtiele kleurcodes. Overnemen voor de filters en tabs.
- **Notion:** typografie en witruimte als structuur in plaats van lijnen en boxen.

### Concreet

- **Kleuren:** warm off-white achtergrond (`#FAFAF7`), bijna-zwarte tekst (`#1C1C1A`), grijze secundaire tekst. Per domein één gedempte accentkleur, alleen gebruikt als dunne balk of stip, nooit als vlakvulling:
  - Geschiedenis: gedempt rood/terracotta
  - Filosofie: gedempt blauw
  - Wetenschap: gedempt groen
- **Dark mode:** ja, via `prefers-color-scheme`. Achtergrond `#161614`, geen puur zwart.
- **Typografie:** sans-serif voor UI (Inter), serif voor notities en titels op de detailpagina (bijv. Source Serif 4). Die combinatie geeft karakter zonder stylized te worden.
- **Kaarten:** thumbnail links of boven, titel, auteur, jaartal. Lichte rand of subtiele schaduw, niet allebei. Afronding 8px.
- **Spacing:** 4px-grid, ruim. Liever minder per scherm dan krap.
- **Niet doen:** gradients, glassmorphism, animaties behalve korte overgangen (150ms), emoji in de UI, iconen bij elk label.
- **Jaartallen:** `tabular-nums` zodat ze netjes uitlijnen. Weergave: `1618 tot 1648`, `ca. 500 v.Chr.`, `3e eeuw v.Chr.`

### Tijdlijn-layout

- **Desktop:** horizontale as met eeuwen, items als kaarten erboven/eronder. Bij "Alles" drie rijen (één per domein) zodat je verbanden ziet op dezelfde verticale lijn. Dit is de belangrijkste weergave van de app. Alleen items met een jaartal komen hierop; items zonder jaartal tel je apart, zodat ze niet stilletjes verdwijnen.
- **Mobiel:** verticale tijdlijn, gegroepeerd per eeuw met sticky eeuwkoppen. Domein als gekleurde stip links.
- **Per onderwerp (grid):** voor Filosofie en Wetenschap, als alternatief voor de tijdlijn (bij Wetenschap de standaardweergave). Items gegroepeerd op `topic`, als kaartjes in een grid per groep — net als collecties in Raindrop.io. Items zonder topic vallen in een groep "Zonder onderwerp" onderaan. Hier mogen items zonder jaartal ook getoond worden, dat is precies waarvoor dit bestaat (zie risico 8).

### Kaartweergave

- Tweede hoofdweergave naast de tijdlijn (schakelaar in de header), met dezelfde domein-tabs erboven.
- Echte kaart (react-leaflet), vector-tegels van OpenFreeMap getekend via MapLibre GL (`@maplibre/maplibre-gl-leaflet`, zodat Leaflet's clustering/markers/popups blijven werken): stijl "liberty" in light mode, "dark" in dark mode (volgt `prefers-color-scheme`, net als de rest van de app). Gratis, geen API-key, geen watermerk — in tegenstelling tot CARTO's gratis tegels.
- Minimale/maximale zoom en wereldwijde `maxBounds` ingesteld zodat er geen grijze balken of herhalende wereld te zien zijn bij uitzoomen of pannen. Een expliciete `maxZoom` op de Leaflet-kaart is ook verplicht voor `leaflet.markercluster` — zonder raster-tegellaag stelt niets dat meer automatisch in, en zonder `maxZoom` crasht clustering direct met "Map has no maxZoom specified".
- MapLibre laadt zijn tile-parsing worker standaard relatief aan de URL van de eigen gebundelde JS-bestand. Na een Vite-build klopt dat pad niet meer (de worker wordt niet apart meegebundeld), dus de worker-URL wordt expliciet gezet via `maplibregl.setWorkerUrl(...)` met een Vite `?url`-import van het workerbestand, zodat het als los asset wordt meegebouwd. Dit faalt alleen in de productiebuild, niet in `npm run dev` — dus **altijd testen met `npm run build && npm run preview`**, niet alleen met de dev-server.
- Items staan op hun punt(en) als kleine marker: thumbnail als die er is, anders een gekleurde stip in de domeinkleur. Bij uitzoomen clusteren markers die dicht bij elkaar liggen tot een getal, zodat de kaart niet dichtslibt.
- Klik op een marker opent een popup met het kaartje (dezelfde kaartjes als de tijdlijn/topic-grid) — dat kaartje is zelf de link naar de detailpagina.
- Bij item toevoegen/bewerken: zoekbalk boven de kaart (Nominatim geocoding) om naar een plaats te springen, daarna exact klikken op de kaart om een punt te plaatsen. Plaatsnaam wordt automatisch ingevuld via Nominatim reverse geocoding (overschrijfbaar), meerdere punten per item kunnen, elk apart verwijderbaar. Nominatim staat max. 1 verzoek/seconde toe — alle geocoding-aanroepen lopen door één gedeelde rij die dat afdwingt, app-breed.
- Landcodes (`countries`) zijn vervangen door deze losse puntlocaties en de kolom is verwijderd; er was nog geen data om te migreren.

---

## 6. Wat er fout kan gaan

Gesorteerd op ernst. Los de bovenste vier op voordat je verder gaat.

### 1. Supabase-sleutel staat publiek op GitHub Pages
De `anon key` komt in de frontend-build en is voor iedereen zichtbaar. Dat is op zich normaal bij Supabase, **maar alleen veilig als RLS aan staat**. Zonder RLS kan iedereen al je data lezen en verwijderen.
**Oplossing:** RLS op alle tabellen vanaf de eerste migratie. Test het: log uit, probeer data op te vragen, moet leeg terugkomen. Nooit de `service_role` key in de frontend.

### 2. Datums vóór het jaar 0 en diepe tijd
JavaScript `Date` en de meeste tijdlijn-libraries (vis-timeline, TimelineJS) gaan raar om met v.Chr., kennen geen jaar 0, en breken compleet bij astronomische tijd (oerknal, 13,8 miljard jaar geleden).
**Oplossing:** jaren opslaan als integer, nooit als `Date`. Eigen tijdlijncomponent bouwen. Voor de wetenschap-tab een schaal die per tijdperk werkt (bijv. kosmisch / geologisch / prehistorie / historisch) in plaats van lineair, anders staat alles van de afgelopen 5000 jaar op één pixel.

### 3. GitHub Pages en routing
GitHub Pages geeft een 404 als je een url als `/item/123` direct opent of ververst.
**Oplossing:** `HashRouter` (`/#/item/123`). Lelijkere url, werkt altijd. Ook `base` in `vite.config.ts` op de reponaam zetten.

### 4. Data kwijt
Supabase free tier pauzeert een project na een week zonder activiteit. Data blijft bewaard en je zet het met één klik weer aan, maar er zijn op free tier geen automatische backups die je zelf kunt terugzetten.
**Oplossing:** JSON-export in fase 2. Optioneel later: GitHub Action die wekelijks exporteert naar een private repo.

### 5. YouTube-metadata ophalen werkt niet
De YouTube oEmbed-endpoint kan CORS-fouten geven vanuit de browser. Geen API-key nodig, maar test het eerst.
**Oplossing:** thumbnail altijd via `https://img.youtube.com/vi/{id}/hqdefault.jpg` (werkt zonder CORS). Voor titel: eerst oEmbed proberen, bij CORS-fout via een Supabase Edge Function. Altijd handmatig invullen mogelijk maken als fallback. Video-id parsen uit alle url-varianten: `youtube.com/watch?v=`, `youtu.be/`, `/shorts/`, `/live/`, met extra parameters zoals `&t=` of `?si=`.

### 6. Delen vanaf telefoon werkt niet op iPhone
Ideaal is: in de YouTube-app op "Delen" tikken en de app kiezen. Dat heet de Web Share Target API en werkt op Android, **niet op iOS**.
**Oplossing:** op iOS is de flow: link kopiëren, app openen, plakken. Maak dat zo snel mogelijk: grote "Plak link"-knop die het klembord uitleest. Op Android wel share target in het manifest zetten.

### 7. Invoeren kost te veel moeite
Het grootste risico is niet technisch. Als een item toevoegen meer dan 30 seconden kost, stopt Milan met gebruiken en is de app dood.
**Oplossing:** alleen titel en domein zijn verplicht. Jaartal is optioneel (zie risico 8), al het andere mag later. Jaartal-invoer moet snel: typ `-500` of `500 v.Chr.` of `1600s`, de app snapt het. Precisie standaard op `century` voor vage dingen.

### 8. Dingen die niet in één jaartal passen
Een video over "de geschiedenis van Rome" beslaat 1200 jaar. Een filosofieboek over stoïcisme raakt aan 300 v.Chr. en 180 n.Chr. Een video kan meerdere periodes behandelen. En sommige onderwerpen horen helemaal niet bij één jaartal: een filosofische stroming of een natuurkunde-topic is iets om op onderwerp te verzamelen, niet om op een as te pinnen.
**Oplossing:** fase 1 houdt het bij start + eind. Lange periodes tonen als balk in plaats van punt. Voor onderwerpen zonder vast jaartal: `year_start` is optioneel en er is een `topic`-veld om op onderwerp/stroming te groeperen in plaats van op tijd (Filosofie en Wetenschap, zie sectie 5). Als meerdere periodes per item vaak voorkomt na gebruik, in fase 3 een aparte `periods`-tabel. Niet vooraf bouwen.

### 9. Scope creep
Dit is een project dat zich leent om eindeloos aan te sleutelen. Zie de "Niet bouwen"-lijst.
**Oplossing:** na fase 1 twee weken alleen gebruiken, niet bouwen. Wat dan irriteert, bepaalt fase 2.

### 10. Embedded video's werken niet
Sommige video's staan embedding niet toe (vooral muziek en sommige documentaires).
**Oplossing:** bij embed-fout terugvallen op thumbnail met link naar YouTube.

### 11. PWA-cache toont oude versie
Service workers kunnen een oude build blijven tonen na een update.
**Oplossing:** `registerType: 'autoUpdate'` in `vite-plugin-pwa`, en een kleine melding "Nieuwe versie, herlaad".

---

## 7. Bouwvolgorde

1. Vite + React + TS + Tailwind opzetten, GitHub Actions deploy naar Pages werkend krijgen met een lege pagina. **Stop, laat Milan testen.**
2. Supabase-project, tabel `items` met RLS, magic link login. Test RLS (zie risico 1). **Stop.**
3. Item toevoegen met YouTube-metadata en snelle jaartal-invoer. **Stop.**
4. Tijdlijnweergave desktop + mobiel, tabs per domein. **Stop.**
5. Detailpagina met notities (markdown) en embedded video. **Stop. Fase 1 klaar.**
6. Fase 2-features, één voor één.

Bij elke stap: kort zeggen wat er gebouwd is en wat Milan moet testen. Geen lange uitleg.

---

## 8. Instellingen die Milan zelf moet doen

- Supabase-account en project aanmaken, `URL` en `anon key` in `.env.local` en als GitHub Secrets
- In Supabase Auth de GitHub Pages-url toevoegen als redirect-url (anders werkt magic link niet)
- GitHub Pages aanzetten op de repo met bron "GitHub Actions"
