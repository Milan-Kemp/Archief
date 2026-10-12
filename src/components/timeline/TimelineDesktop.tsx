import { useMemo } from 'react'
import { DOMAIN_COLORS, DOMAIN_LABELS, DOMAINS } from '../../lib/domain'
import { buildScale, getYearRange } from '../../lib/timelineScale'
import { assignLanes } from '../../lib/timelineLayout'
import { AXIS_HEIGHT, BAR_HEIGHT, CARD_HEIGHT, CARD_WIDTH, LANE_HEIGHT, ROW_GAP } from '../../lib/timelineConstants'
import { ItemCard } from './ItemCard'
import type { DatedItem, Domain } from '../../types/item'
import type { Tab } from './DomainTabs'

interface Props {
  items: DatedItem[]
  activeTab: Tab
}

export function TimelineDesktop({ items, activeTab }: Props) {
  const years = items.flatMap((item) => [item.year_start, item.year_end ?? item.year_start])
  const { min, max } = getYearRange(years)
  const scale = useMemo(() => buildScale(min, max), [min, max])

  const rows: { domain: Domain; items: DatedItem[] }[] =
    activeTab === 'all'
      ? DOMAINS.map((domain) => ({ domain, items: items.filter((i) => i.domain === domain) }))
      : [{ domain: activeTab, items }]

  const rowLayouts = rows.map((row) => {
    const entries = row.items.map((item) => {
      const x = scale.toX(item.year_start)
      const barWidth = item.year_end !== null ? scale.toX(item.year_end) - x : 0
      return { id: item.id, x, width: Math.max(CARD_WIDTH, barWidth) }
    })
    const { laneOf, laneCount } = assignLanes(entries, 16)
    return { ...row, laneOf, laneCount: Math.max(laneCount, 1) }
  })

  const contentWidth = scale.totalWidth + CARD_WIDTH

  return (
    <div className="h-full overflow-auto">
      <div className="relative min-w-full" style={{ width: contentWidth }}>
        {rowLayouts.map((row) => (
          <div key={row.domain} className="relative border-b border-neutral-200/70 dark:border-neutral-800/70">
            {activeTab === 'all' && (
              <div className="sticky left-0 z-20 inline-flex items-center gap-1.5 bg-[#FAFAF7] px-3 py-1.5 text-xs font-medium text-neutral-500 dark:bg-[#161614] dark:text-neutral-400">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: DOMAIN_COLORS[row.domain] }}
                />
                {DOMAIN_LABELS[row.domain]}
              </div>
            )}
            <div
              className="relative overflow-hidden"
              style={{ height: row.laneCount * LANE_HEIGHT + ROW_GAP }}
            >
              {row.items.map((item) => {
                const x = scale.toX(item.year_start)
                const barWidth = item.year_end !== null ? scale.toX(item.year_end) - x : 0
                const lane = row.laneOf.get(item.id) ?? 0
                const top = lane * LANE_HEIGHT + 8
                return (
                  <div key={item.id} className="absolute" style={{ left: x, top }}>
                    {barWidth > 0 && (
                      <div
                        className="absolute rounded-full"
                        style={{
                          top: CARD_HEIGHT - BAR_HEIGHT - 2,
                          left: 0,
                          width: Math.max(barWidth, CARD_WIDTH),
                          height: BAR_HEIGHT,
                          backgroundColor: DOMAIN_COLORS[item.domain],
                          opacity: 0.5,
                        }}
                      />
                    )}
                    <ItemCard item={item} />
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div className="sticky bottom-0 bg-[#FAFAF7] dark:bg-[#161614]" style={{ height: AXIS_HEIGHT }}>
          <div className="relative h-full border-t border-neutral-200 dark:border-neutral-800">
            {scale.ticks.map((tick) => (
              <div
                key={tick.x}
                className="absolute top-0 flex h-full flex-col items-start"
                style={{ left: tick.x }}
              >
                <div className="h-2 w-px bg-neutral-300 dark:bg-neutral-700" />
                <span className="mt-1 whitespace-nowrap text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                  {tick.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
