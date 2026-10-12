import { DOMAIN_COLORS } from '../../lib/domain'
import { formatYearRange } from '../../lib/year'
import type { Item } from '../../types/item'

interface Props {
  item: Item
  width: number
}

export function ItemCard({ item, width }: Props) {
  return (
    <div
      className="absolute flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      style={{ width, borderLeft: `3px solid ${DOMAIN_COLORS[item.domain]}` }}
    >
      {item.thumbnail_url && (
        <img src={item.thumbnail_url} alt="" className="h-20 w-full object-cover" />
      )}
      <div className="flex flex-col gap-0.5 p-2">
        <p className="truncate font-serif text-sm leading-tight text-[#1C1C1A] dark:text-[#F5F5F2]">
          {item.title}
        </p>
        {item.author && (
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{item.author}</p>
        )}
        <p className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
          {formatYearRange(item.year_start, item.year_end, item.date_precision)}
        </p>
      </div>
    </div>
  )
}
