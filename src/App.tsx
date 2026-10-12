import { useEffect, useState } from 'react'
import { useAuth } from './lib/useAuth'
import { supabase } from './lib/supabase'
import { Login } from './components/Login'

function App() {
  const { session, loading } = useAuth()
  const [itemCount, setItemCount] = useState<number | null>(null)

  useEffect(() => {
    if (!session) return
    supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => setItemCount(count ?? 0))
  }, [session])

  if (loading) return null

  if (!session) return <Login />

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAFAF7] text-[#1C1C1A] dark:bg-[#161614] dark:text-[#F5F5F2]">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Ingelogd als {session.user.email}
      </p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {itemCount === null ? 'Items laden...' : `${itemCount} items in archief`}
      </p>
      <button
        type="button"
        onClick={() => supabase.auth.signOut()}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
      >
        Uitloggen
      </button>
    </div>
  )
}

export default App
