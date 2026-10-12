import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import { AddItemForm } from '../components/AddItemForm'
import { Timeline } from '../components/timeline/Timeline'

export function Home() {
  const { items, loading, refresh } = useItems()
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-[#FAFAF7] text-[#1C1C1A] dark:bg-[#161614] dark:text-[#F5F5F2]">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5 dark:border-neutral-800">
        <h1 className="text-sm font-medium">Archief</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="rounded-lg bg-[#1C1C1A] px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-[#1C1C1A]"
          >
            + Item toevoegen
          </button>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
          >
            Uitloggen
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <Timeline items={items} loading={loading} />
      </main>

      {showAddForm && (
        <AddItemForm
          onClose={() => setShowAddForm(false)}
          onAdded={() => {
            setShowAddForm(false)
            refresh()
          }}
        />
      )}
    </div>
  )
}
