import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import type L from 'leaflet'
import { reverseGeocode, searchPlaces, type GeocodeResult } from '../lib/nominatim'
import { pointIcon } from '../lib/markerIcon'
import { useTileLayer, TILE_ATTRIBUTION } from '../lib/useTileLayer'
import type { LocationPoint } from '../types/location'

interface Draft extends LocationPoint {
  key: string
}

interface Props {
  initialPoints: LocationPoint[]
  onChange: (points: LocationPoint[]) => void
}

export function LocationPicker({ initialPoints, onChange }: Props) {
  const [points, setPoints] = useState<Draft[]>(() =>
    initialPoints.map((p) => ({ ...p, key: crypto.randomUUID() })),
  )
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [searching, setSearching] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const tileUrl = useTileLayer()

  useEffect(() => {
    onChange(points.map((p) => ({ lat: p.lat, lng: p.lng, name: p.name })))
  }, [points])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    const found = await searchPlaces(query)
    setSearching(false)
    setResults(found)
  }

  function flyTo(result: GeocodeResult) {
    mapRef.current?.flyTo([result.lat, result.lng], 10)
    setResults([])
    setQuery('')
  }

  function handleMapClick(lat: number, lng: number) {
    const key = crypto.randomUUID()
    setPoints((prev) => [...prev, { key, lat, lng, name: 'Naam ophalen...' }])
    reverseGeocode(lat, lng).then((name) => {
      setPoints((prev) => prev.map((p) => (p.key === key ? { ...p, name } : p)))
    })
  }

  function removePoint(key: string) {
    setPoints((prev) => prev.filter((p) => p.key !== key))
  }

  function renamePoint(key: string, name: string) {
    setPoints((prev) => prev.map((p) => (p.key === key ? { ...p, name } : p)))
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek een plaats..."
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-neutral-700"
        >
          {searching ? '...' : 'Zoek'}
        </button>
      </form>

      {results.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-lg border border-neutral-200 p-1 text-sm dark:border-neutral-800">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => flyTo(r)}
                className="w-full truncate rounded px-2 py-1 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-neutral-400">Klik exact op de kaart om een punt te plaatsen.</p>

      <div
        className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700"
        style={{ height: 260 }}
      >
        <MapContainer
          center={[20, 10]}
          zoom={2}
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url={tileUrl} attribution={TILE_ATTRIBUTION} />
          <ClickHandler onClick={handleMapClick} />
          {points.map((p) => (
            <Marker key={p.key} position={[p.lat, p.lng]} icon={pointIcon()}>
              <Popup>
                <button
                  type="button"
                  onClick={() => removePoint(p.key)}
                  className="text-xs text-red-600 underline"
                >
                  Verwijderen
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {points.length > 0 && (
        <ul className="flex flex-col gap-1">
          {points.map((p) => (
            <li key={p.key} className="flex items-center gap-2">
              <input
                type="text"
                value={p.name}
                onChange={(e) => renamePoint(p.key, e.target.value)}
                className="flex-1 rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-800 dark:bg-neutral-900"
              />
              <button
                type="button"
                onClick={() => removePoint(p.key)}
                className="text-xs text-neutral-400 hover:text-red-600"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
  })
  return null
}
