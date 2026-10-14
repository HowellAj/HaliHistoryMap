import { useState } from 'react'
import HistoryMap from '../components/HistoryMap.jsx'
import { items, places } from '../data/items.js'

const featuredPlaces = places.filter((place) => place.featured)

export default function MapPage() {
  const [focus, setFocus] = useState(null)

  return (
    <div className="map-page">
      <nav className="area-bar" aria-label="Jump to place">
        {featuredPlaces.map((place) => (
          <button
            key={place.id}
            type="button"
            className={`chip ${focus?.id === place.id ? 'chip--active' : ''}`}
            onClick={() => setFocus({ ...place })}
          >
            {place.name}
          </button>
        ))}
      </nav>
      <HistoryMap items={items} focus={focus} />
    </div>
  )
}
