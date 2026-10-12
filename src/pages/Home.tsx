import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import { ItemForm } from '../components/ItemForm'
import { Timeline } from '../components/timeline/Timeline'
import { WorldMap } from '../components/map/WorldMap'

type MainView = 'timeline' | 'map'

export function Home() {
  const { items, loading, refresh } = useItems()
  const [showAddForm, setShowAddForm] = useState(false)
  const [mainView, setMainView] = useState<MainView>('timeline')

  return (
    <div className="flex h-screen flex-col bg-[#FAFAF7] text-[#1C1C1A] dark:bg-[#161614] dark:text-[#F5F5F2]">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium">Archief</h1>
          <div className="flex items-center gap-1 rounded-full bg-neutral-200/60 p-0.5 text-xs dark:bg-neutral-800">
            <MainViewButton active={mainView === 'timeline'} onClick={() => setMainView('timeline')}>
              Tijdlijn
            </MainViewButton>
            <MainViewButton active={mainView === 'map'} onClick={() => setMainView('map')}>
              Kaart
            </MainViewButton>
          </div>
        </div>
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
        {mainView === 'timeline' ? (
          <Timeline items={items} loading={loading} />
        ) : (
          <WorldMap items={items} />
        )}
      </main>

      {showAddForm && (
        <ItemForm
          onClose={() => setShowAddForm(false)}
          onSaved={() => {
            setShowAddForm(false)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function MainViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 transition-colors duration-150 ${
        active
          ? 'bg-[#1C1C1A] text-white dark:bg-white dark:text-[#1C1C1A]'
          : 'text-neutral-600 dark:text-neutral-400'
      }`}
    >
      {children}
    </button>
  )
}
