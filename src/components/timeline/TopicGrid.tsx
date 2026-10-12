import { ItemCard } from './ItemCard'
import type { Item } from '../../types/item'

interface Props {
  items: Item[]
}

const NO_TOPIC_LABEL = 'Zonder onderwerp'

export function TopicGrid({ items }: Props) {
  const groups = new Map<string, Item[]>()
  for (const item of items) {
    const key = item.topic?.trim() || NO_TOPIC_LABEL
    const group = groups.get(key)
    if (group) group.push(item)
    else groups.set(key, [item])
  }

  const sortedGroups = [...groups.entries()].sort(([a], [b]) => {
    if (a === NO_TOPIC_LABEL) return 1
    if (b === NO_TOPIC_LABEL) return -1
    return a.localeCompare(b, 'nl')
  })

  for (const [, groupItems] of sortedGroups) {
    groupItems.sort((a, b) => (a.year_start ?? Infinity) - (b.year_start ?? Infinity))
  }

  if (sortedGroups.length === 0) {
    return <p className="p-4 text-sm text-neutral-500">Nog geen items in dit domein.</p>
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      {sortedGroups.map(([topic, groupItems]) => (
        <div key={topic} className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {topic} <span className="tabular-nums text-neutral-400">({groupItems.length})</span>
          </h2>
          <div className="flex flex-wrap gap-4">
            {groupItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
