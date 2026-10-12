import type { LatLngBoundsExpression } from 'leaflet'

// Voorkomt grijze balken en een herhalende wereld bij uitzoomen/pannen.
export const WORLD_MAX_BOUNDS: LatLngBoundsExpression = [
  [-85, -180],
  [85, 180],
]
export const MIN_MAP_ZOOM = 2
// leaflet.markercluster vereist een eindige maxZoom op de Leaflet-kaart zelf
// (anders: "Map has no maxZoom specified") — zonder raster TileLayer stelt
// niets dit meer automatisch in.
export const MAX_MAP_ZOOM = 19
