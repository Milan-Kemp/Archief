import type { Domain } from '../types/item'

export const DOMAIN_LABELS: Record<Domain, string> = {
  history: 'Geschiedenis',
  philosophy: 'Filosofie',
  science: 'Wetenschap',
}

export const DOMAIN_COLORS: Record<Domain, string> = {
  history: '#B2554B',
  philosophy: '#4F6F93',
  science: '#5C8A5C',
}

export const DOMAINS: Domain[] = ['history', 'philosophy', 'science']
