import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import ItemPopup from './ItemPopup.jsx'
import { HALIFAX_CENTER, DEFAULT_ZOOM, MAP_BOUNDS } from '../config.js'

// Leaflet looks up its default marker images by URL at runtime, which breaks
// once Vite bundles them. Point it at the bundled copies instead.
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

// Pans the map whenever `focus` ({ lat, lng, zoom }) changes.
function FlyTo({ focus }) {
  const map = useMap()
  useEffect(() => {
    if (focus) map.flyTo([focus.lat, focus.lng], focus.zoom ?? map.getZoom())
  }, [focus, map])
  return null
}

export default function HistoryMap({ items = [], focus }) {
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
      {items.map((item) => (
        <Marker key={item.id} position={[item.lat, item.lng]} title={item.title}>
          {/* Top padding keeps popups clear of the place buttons over the map. */}
          <Popup maxWidth={320} minWidth={260} autoPanPaddingTopLeft={[16, 64]}>
            <ItemPopup item={item} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
