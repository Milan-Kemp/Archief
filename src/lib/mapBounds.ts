import type { LatLngBoundsExpression } from 'leaflet'

// Alleen verticaal begrensd (Mercator kan de polen toch niet tonen), horizontaal
// onbegrensd zodat eindeloos zijwaarts slepen kan zoals bij Google Maps. Infinity
// als lng-grens is een bekende Leaflet-truc: de pixel-clamp wordt dan een no-op.
export const VERTICAL_MAX_BOUNDS: LatLngBoundsExpression = [
  [-85, -Infinity],
  [85, Infinity],
]
export const MIN_MAP_ZOOM = 2
// leaflet.markercluster vereist een eindige maxZoom op de Leaflet-kaart zelf
// (anders: "Map has no maxZoom specified") — zonder raster TileLayer stelt
// niets dit meer automatisch in.
export const MAX_MAP_ZOOM = 19
