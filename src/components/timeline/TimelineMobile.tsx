import { Link } from 'react-router-dom'
import { DOMAIN_COLORS } from '../../lib/domain'
import { getGroupLabel } from '../../lib/timelineScale'
import { formatYearRange } from '../../lib/year'
import type { Item } from '../../types/item'

interface Props {
  items: Item[]
}

export function TimelineMobile({ items }: Props) {
  const sorted = [...items].sort((a, b) => a.year_start - b.year_start)

  const groups: { label: string; items: Item[] }[] = []
  for (const item of sorted) {
    const { key, label } = getGroupLabel(item.year_start)
    const last = groups[groups.length - 1]
    if (last && getGroupLabel(last.items[0].year_start).key === key) {
      last.items.push(item)
    } else {
      groups.push({ label, items: [item] })
    }
  }

  if (groups.length === 0) {
    return <p className="p-4 text-sm text-neutral-500">Nog geen items.</p>
  }

  return (
    <div className="h-full overflow-y-auto">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="sticky top-0 z-10 bg-[#FAFAF7] px-4 py-2 text-xs font-medium text-neutral-500 dark:bg-[#161614] dark:text-neutral-400">
            {group.label}
          </div>
          <div className="flex flex-col">
            {group.items.map((item) => (
              <Link
                key={item.id}
                to={`/item/${item.id}`}
                className="flex gap-3 border-b border-neutral-200/70 px-4 py-3 no-underline dark:border-neutral-800/70"
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: DOMAIN_COLORS[item.domain] }}
                />
                {item.thumbnail_url && (
                  <img
                    src={item.thumbnail_url}
                    alt=""
                    className="h-12 w-20 shrink-0 rounded-md object-cover"
                  />
                )}
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate font-serif text-sm text-[#1C1C1A] dark:text-[#F5F5F2]">
                    {item.title}
                  </p>
                  {item.author && (
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {item.author}
                    </p>
                  )}
                  <p className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                    {formatYearRange(item.year_start, item.year_end, item.date_precision)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
