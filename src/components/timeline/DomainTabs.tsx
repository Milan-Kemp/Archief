import { DOMAIN_COLORS, DOMAIN_LABELS, DOMAINS } from '../../lib/domain'
import type { Domain } from '../../types/item'

export type Tab = 'all' | Domain

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

export function DomainTabs({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <TabButton active={active === 'all'} onClick={() => onChange('all')}>
        Alles
      </TabButton>
      {DOMAINS.map((domain) => (
        <TabButton key={domain} active={active === domain} onClick={() => onChange(domain)}>
          <span
            className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: DOMAIN_COLORS[domain] }}
          />
          {DOMAIN_LABELS[domain]}
        </TabButton>
      ))}
    </div>
  )
}

function TabButton({
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
      className={`rounded-full px-3 py-1.5 transition-colors duration-150 ${
        active
          ? 'bg-[#1C1C1A] text-white dark:bg-white dark:text-[#1C1C1A]'
          : 'text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800'
      }`}
    >
      {children}
    </button>
  )
}
