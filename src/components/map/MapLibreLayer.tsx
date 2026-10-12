import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import '@maplibre/maplibre-gl-leaflet'

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
