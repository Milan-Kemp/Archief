# Archief

Persoonlijke kennistijdlijn. Zie [SPEC.md](./SPEC.md) voor het volledige plan.

## Stack

React + Vite + TypeScript, Tailwind CSS, Supabase. Hosting op GitHub Pages via GitHub Actions.

## Setup

1. Maak een Supabase-project aan.
2. Run de SQL in `supabase/migrations/0001_items.sql` in de Supabase SQL editor.
3. Kopieer `.env.local.example` naar `.env.local` en vul `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` in (Project Settings → API).
4. In Supabase **Authentication → URL Configuration**: zet de GitHub Pages-url (`https://<user>.github.io/Archief/`) als Site URL / Redirect URL, anders werkt de magic link niet.
5. Zet `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` ook als GitHub Actions secrets (Settings → Secrets and variables → Actions), zodat de build op GitHub Pages ze heeft.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
