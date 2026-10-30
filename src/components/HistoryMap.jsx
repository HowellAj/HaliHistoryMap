import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import ItemPopup from './ItemPopup.jsx'
import GroupPopup from './GroupPopup.jsx'
import { HALIFAX_CENTER, DEFAULT_ZOOM, MAP_BOUNDS } from '../config.js'

// Use the bundled marker images as the default icon. Don't patch
// L.Icon.Default instead: it prefixes every URL with an image folder it
// guesses from leaflet.css, which mangles Vite's URLs in dev mode.
L.Marker.prototype.options.icon = L.icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

// Same pin image with a count badge, for spots that hold several items.
function groupIcon(count) {
  const { iconSize, iconAnchor, popupAnchor } = L.Icon.Default.prototype.options
  return L.divIcon({
    className: 'group-marker',
    html: `<img src="${markerIcon}" alt=""><span class="group-marker__count">${count}</span>`,
    iconSize,
    iconAnchor,
    popupAnchor,
  })
}

// Items at exactly the same lat/lng share one pin. Each group is sorted
// oldest first (undated last) so paging through it moves forward in time.
function groupByPosition(items) {
  const groups = new Map()
  for (const item of items) {
    const key = `${item.lat},${item.lng}`
    if (!groups.has(key)) groups.set(key, { key, lat: item.lat, lng: item.lng, items: [] })
    groups.get(key).items.push(item)
  }
  const year = (item) => item.yearStart ?? item.yearEnd ?? Infinity
  for (const group of groups.values()) {
    group.items.sort((a, b) => year(a) - year(b))
    if (group.items.length > 1) group.icon = groupIcon(group.items.length)
  }
  return [...groups.values()]
}

// Pans the map whenever `focus` ({ lat, lng, zoom }) changes.
function FlyTo({ focus }) {
  const map = useMap()
  useEffect(() => {
    if (focus) map.flyTo([focus.lat, focus.lng], focus.zoom ?? map.getZoom())
  }, [focus, map])
  return null
}

export default function HistoryMap({ items = [], focus }) {
  const groups = useMemo(() => groupByPosition(items), [items])

  return (
    <MapContainer
      center={HALIFAX_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={10}
      maxBounds={MAP_BOUNDS}
      maxBoundsViscosity={1.0}
      className="history-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo focus={focus} />
      {groups.map((group) => {
        const single = group.items.length === 1
        return (
          <Marker
            key={group.key}
            position={[group.lat, group.lng]}
            title={single ? group.items[0].title : `${group.items.length} items here`}
            {...(group.icon && { icon: group.icon })}
          >
            {/* Top padding keeps popups clear of the place buttons over the map. */}
            <Popup maxWidth={320} minWidth={260} autoPanPaddingTopLeft={[16, 64]}>
              {single ? <ItemPopup item={group.items[0]} /> : <GroupPopup items={group.items} />}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
