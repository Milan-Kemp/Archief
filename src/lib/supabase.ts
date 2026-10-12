import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Zie .env.local.example.',
  )
}

// PKCE i.p.v. de implicit-flow default: de magic-link code komt dan in een
// query-param (?code=...) terecht, niet in de URL-hash. Anders botst Supabase's
// eigen hash-opschoning (window.location.hash = '') met HashRouter, wat na het
// inloggen een wit scherm gaf.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    // Expliciet (zijn al de default): sessie overleeft het sluiten van de
    // browser (localStorage) en ververst zichzelf op de achtergrond.
    persistSession: true,
    autoRefreshToken: true,
  },
})
