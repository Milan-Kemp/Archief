import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session)
      })
      .catch((error) => {
        // Een kapotte/verlopen magic-link-redirect mag de app niet voor altijd
        // op "laden" laten hangen — val terug op uitgelogd, zodat de
        // loginpagina verschijnt in plaats van een wit scherm.
        console.error('Auth sessie ophalen mislukt:', error)
        setSession(null)
      })
      .finally(() => {
        setLoading(false)
      })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return { session, loading }
}
