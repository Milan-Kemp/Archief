export interface GeocodeResult {
  lat: number
  lng: number
  name: string
}

// Nominatim usage policy: max 1 request/second, app-wide (niet per component).
let queue: Promise<void> = Promise.resolve()
let lastRequestAt = 0

function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const wait = Math.max(0, lastRequestAt + 1000 - Date.now())
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
    lastRequestAt = Date.now()
    return fn()
  }
  const result = queue.then(run, run)
  queue = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

export function searchPlaces(query: string): Promise<GeocodeResult[]> {
  return throttled(async () => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`,
    )
    if (!res.ok) return []
    const data: Array<{ lat: string; lon: string; display_name: string }> = await res.json()
    return data.map((d) => ({ lat: Number(d.lat), lng: Number(d.lon), name: d.display_name }))
  })
}

export function reverseGeocode(lat: number, lng: number): Promise<string> {
  return throttled(async () => {
    const fallback = `${lat.toFixed(3)}, ${lng.toFixed(3)}`
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&zoom=12&lat=${lat}&lon=${lng}`,
      )
      if (!res.ok) return fallback
      const data = await res.json()
      return shortenAddress(data) ?? data.display_name ?? fallback
    } catch {
      return fallback
    }
  })
}

function shortenAddress(data: { address?: Record<string, string> }): string | null {
  const address = data.address
  if (!address) return null
  const place = address.city ?? address.town ?? address.village ?? address.municipality ?? address.county
  if (place && address.country) return `${place}, ${address.country}`
  return address.country ?? place ?? null
}
