import { MapContainer, TileLayer } from 'react-leaflet'
import { HALIFAX_CENTER, DEFAULT_ZOOM, MAP_BOUNDS } from '../config.js'

// Base Leaflet map of Halifax. Pins will be added as children later.
export default function HistoryMap({ children }) {
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
      {children}
    </MapContainer>
  )
}
