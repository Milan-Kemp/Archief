import { Link } from 'react-router-dom'
import { DOMAIN_COLORS } from '../../lib/domain'
import { CARD_HEIGHT, CARD_WIDTH } from '../../lib/timelineConstants'
import { formatYearRange } from '../../lib/year'
import type { Item } from '../../types/item'

interface Props {
  item: Item
}

export function ItemCard({ item }: Props) {
  return (
    <Link
      to={`/item/${item.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white no-underline shadow-sm transition-shadow duration-150 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderLeft: `3px solid ${DOMAIN_COLORS[item.domain]}`,
      }}
    >
      {item.thumbnail_url && (
        <img src={item.thumbnail_url} alt="" className="h-20 w-full shrink-0 object-cover" />
      )}
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden p-2">
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
    </Link>
  )
}
