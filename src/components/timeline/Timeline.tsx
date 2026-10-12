import { useState } from 'react'
import type { Item } from '../../types/item'
import { DomainTabs, type Tab } from './DomainTabs'
import { TimelineDesktop } from './TimelineDesktop'
import { TimelineMobile } from './TimelineMobile'

interface Props {
  items: Item[]
  loading: boolean
}

export function Timeline({ items, loading }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const visibleItems = activeTab === 'all' ? items : items.filter((i) => i.domain === activeTab)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
        <DomainTabs active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-neutral-500">Laden...</p>
        ) : visibleItems.length === 0 ? (
          <p className="p-4 text-sm text-neutral-500">Nog geen items in dit domein.</p>
        ) : (
          <>
            <div className="hidden h-full md:block">
              <TimelineDesktop items={visibleItems} activeTab={activeTab} />
            </div>
            <div className="h-full md:hidden">
              <TimelineMobile items={visibleItems} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
