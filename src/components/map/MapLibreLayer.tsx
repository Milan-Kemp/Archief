import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { setWorkerUrl } from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import '@maplibre/maplibre-gl-leaflet'

// MapLibre zoekt zijn worker-bestand standaard relatief aan de plek van de
// gebundelde JS-chunk — die staat er niet, dus zonder dit faalt de worker
// alleen in de productiebuild (dev server serveert node_modules direct).
setWorkerUrl(maplibreWorkerUrl)

interface Props {
  styleUrl: string
}

// Vector tiles (OpenFreeMap) getekend via MapLibre GL, bovenop de gewone
// Leaflet-kaart — zo blijven clustering, markers en popups van react-leaflet
// werken terwijl de tegels zelf door MapLibre gerenderd worden.
export function MapLibreLayer({ styleUrl }: Props) {
  const map = useMap()

  useEffect(() => {
    const layer = L.maplibreGL({ style: styleUrl })
    layer.addTo(map)
    return () => {
      map.removeLayer(layer)
    }
  }, [map, styleUrl])

  return null
}
