import L from 'leaflet'
import { DOMAIN_COLORS } from './domain'
import type { Item } from '../types/item'

export function pointIcon(color = '#A6763D'): L.DivIcon {
  const el = document.createElement('div')
  el.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.35);`
  return L.divIcon({ html: el, className: '', iconSize: [12, 12], iconAnchor: [6, 6] })
}

export function itemMarkerIcon(item: Item): L.DivIcon {
  const color = DOMAIN_COLORS[item.domain]

  if (!item.thumbnail_url) return pointIcon(color)

  const el = document.createElement('div')
  const img = document.createElement('img')
  img.src = item.thumbnail_url
  img.style.cssText = `width:32px;height:32px;object-fit:cover;border-radius:6px;border:2px solid ${color};box-shadow:0 1px 3px rgba(0,0,0,0.35);display:block;`
  el.appendChild(img)

  return L.divIcon({ html: el, className: '', iconSize: [32, 32], iconAnchor: [16, 32] })
}
