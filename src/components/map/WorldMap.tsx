import { useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import worldAtlas from 'world-atlas/countries-110m.json'
import { numericToAlpha2, countryName } from '../../lib/countries'
import { DOMAIN_COLORS } from '../../lib/domain'
import { DomainTabs, type Tab } from '../timeline/DomainTabs'
import { ItemCard } from '../timeline/ItemCard'
import type { Item } from '../../types/item'

interface Props {
  items: Item[]
}

const NEUTRAL_FILL = '#D7D5CF'
const EMPTY_FILL = '#E8E6E1'
const ALL_TAB_ACCENT = '#A6763D'

export function WorldMap({ items }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  const visibleItems = activeTab === 'all' ? items : items.filter((i) => i.domain === activeTab)

  const countsByCountry = new Map<string, Item[]>()
  for (const item of visibleItems) {
    for (const code of item.countries) {
      const bucket = countsByCountry.get(code)
      if (bucket) bucket.push(item)
      else countsByCountry.set(code, [item])
    }
  }
  const maxCount = Math.max(1, ...Array.from(countsByCountry.values(), (v) => v.length))
  const accent = activeTab === 'all' ? ALL_TAB_ACCENT : DOMAIN_COLORS[activeTab]

  const selectedItems = selectedCountry
    ? (countsByCountry.get(selectedCountry) ?? [])
    : []

  function handleClick(alpha2: string | null, count: number) {
    if (!alpha2 || count === 0) return
    setSelectedCountry((current) => (current === alpha2 ? null : alpha2))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
        <DomainTabs
          active={activeTab}
          onChange={(tab) => {
            setActiveTab(tab)
            setSelectedCountry(null)
          }}
        />
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <span>minder</span>
          <span
            className="h-2 w-16 rounded-full"
            style={{ background: `linear-gradient(to right, ${EMPTY_FILL}, ${accent})` }}
          />
          <span>meer</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-[#F3F2EE] dark:border-neutral-800 dark:bg-neutral-900">
          <ComposableMap width={800} height={420} projectionConfig={{ scale: 130 }}>
            <Geographies geography={worldAtlas as never}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const alpha2 = typeof geo.id === 'string' ? numericToAlpha2(geo.id) : null
                  const count = alpha2 ? countsByCountry.get(alpha2)?.length ?? 0 : 0
                  const ratio = count > 0 ? Math.round((count / maxCount) * 85) + 15 : 0
                  const isSelected = alpha2 !== null && alpha2 === selectedCountry
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleClick(alpha2, count)}
                      className={count > 0 ? 'country-geo' : 'country-geo-disabled'}
                      fill={
                        count > 0
                          ? `color-mix(in srgb, ${accent} ${ratio}%, ${NEUTRAL_FILL})`
                          : EMPTY_FILL
                      }
                      stroke={isSelected ? '#1C1C1A' : '#F3F2EE'}
                      strokeWidth={isSelected ? 1.2 : 0.4}
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        {selectedCountry && (
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {countryName(selectedCountry)}{' '}
                <span className="tabular-nums text-neutral-400">({selectedItems.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className="text-xs text-neutral-500 underline hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                Sluiten
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              {selectedItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
