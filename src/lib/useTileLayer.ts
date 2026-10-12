import { useEffect, useState } from 'react'

const LIGHT_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const DARK_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://carto.com/attributions">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export function useTileLayer(): string {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isDark ? DARK_URL : LIGHT_URL
}
