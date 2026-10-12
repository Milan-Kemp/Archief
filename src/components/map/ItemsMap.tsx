import { useState } from 'react'
import { MapContainer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { itemMarkerIcon } from '../../lib/markerIcon'
import { useMapStyle } from '../../lib/useMapStyle'
import { MIN_MAP_ZOOM, WORLD_MAX_BOUNDS } from '../../lib/mapBounds'
import { DomainTabs, type Tab } from '../timeline/DomainTabs'
import { ItemCard } from '../timeline/ItemCard'
import { MapLibreLayer } from './MapLibreLayer'
import type { Item } from '../../types/item'
import type { ItemLocation } from '../../types/location'

interface Props {
  items: Item[]
  locations: ItemLocation[]
}

export function ItemsMap({ items, locations }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const mapStyle = useMapStyle()

  const itemsById = new Map(items.map((item) => [item.id, item]))
  const visibleItems =
    activeTab === 'all' ? items : items.filter((item) => item.domain === activeTab)
  const visibleIds = new Set(visibleItems.map((item) => item.id))
  const visibleLocations = locations.filter((loc) => visibleIds.has(loc.item_id))

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
        <DomainTabs active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="relative flex-1">
        <MapContainer
          center={[20, 10]}
          zoom={2}
          minZoom={MIN_MAP_ZOOM}
          maxBounds={WORLD_MAX_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%' }}
        >
          <MapLibreLayer styleUrl={mapStyle} />
          <MarkerClusterGroup chunkedLoading>
            {visibleLocations.map((loc) => {
              const item = itemsById.get(loc.item_id)
              if (!item) return null
              return (
                <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={itemMarkerIcon(item)}>
                  <Popup>
                    <ItemCard item={item} />
                  </Popup>
                </Marker>
              )
            })}
          </MarkerClusterGroup>
        </MapContainer>

        {visibleLocations.length === 0 && (
          <p className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-[#FAFAF7] px-3 py-1 text-sm text-neutral-500 shadow dark:bg-[#161614]">
            Nog geen locaties in dit domein.
          </p>
        )}
      </div>
    </div>
  )
}
