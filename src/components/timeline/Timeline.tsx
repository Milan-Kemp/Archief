import { useEffect, useState } from 'react'
import type { DatedItem, Item } from '../../types/item'
import { DomainTabs, type Tab } from './DomainTabs'
import { TimelineDesktop } from './TimelineDesktop'
import { TimelineMobile } from './TimelineMobile'
import { TopicGrid } from './TopicGrid'

interface Props {
  items: Item[]
  loading: boolean
}

const TOPIC_VIEW_DEFAULT: Partial<Record<Tab, boolean>> = {
  philosophy: false,
  science: true,
}

function isDated(item: Item): item is DatedItem {
  return item.year_start !== null
}

export function Timeline({ items, loading }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [topicView, setTopicView] = useState(false)

  useEffect(() => {
    setTopicView(TOPIC_VIEW_DEFAULT[activeTab] ?? false)
  }, [activeTab])

  const visibleItems = activeTab === 'all' ? items : items.filter((i) => i.domain === activeTab)
  const datedItems = visibleItems.filter(isDated)
  const undatedCount = visibleItems.length - datedItems.length
  const showTopicToggle = activeTab === 'philosophy' || activeTab === 'science'
  const useTopicGrid = showTopicToggle && topicView

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
        <DomainTabs active={activeTab} onChange={setActiveTab} />
        {showTopicToggle && (
          <div className="flex items-center gap-1 rounded-full bg-neutral-200/60 p-0.5 text-xs dark:bg-neutral-800">
            <ViewToggleButton active={!topicView} onClick={() => setTopicView(false)}>
              Tijdlijn
            </ViewToggleButton>
            <ViewToggleButton active={topicView} onClick={() => setTopicView(true)}>
              Per onderwerp
            </ViewToggleButton>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-neutral-500">Laden...</p>
        ) : visibleItems.length === 0 ? (
          <p className="p-4 text-sm text-neutral-500">Nog geen items in dit domein.</p>
        ) : useTopicGrid ? (
          <TopicGrid items={visibleItems} />
        ) : (
          <div className="flex h-full flex-col">
            {undatedCount > 0 && (
              <p className="px-4 py-1.5 text-xs text-neutral-400">
                {undatedCount} item{undatedCount > 1 ? 's' : ''} zonder jaartal, niet op de tijdlijn.
              </p>
            )}
            {datedItems.length === 0 ? (
              <p className="p-4 text-sm text-neutral-500">Geen items met een jaartal in dit domein.</p>
            ) : (
              <div className="flex-1 overflow-hidden">
                <div className="hidden h-full md:block">
                  <TimelineDesktop items={datedItems} activeTab={activeTab} />
                </div>
                <div className="h-full md:hidden">
                  <TimelineMobile items={datedItems} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ViewToggleButton({
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
