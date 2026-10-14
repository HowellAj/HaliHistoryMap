import { useState } from 'react'
import HistoryMap from '../components/HistoryMap.jsx'
import { items, areas } from '../data/items.js'

export default function MapPage() {
  const [focus, setFocus] = useState(null)

  return (
    <div className="map-page">
      <nav className="area-bar" aria-label="Jump to area">
        {areas.map((area) => (
          <button
            key={area.id}
            type="button"
            className={`chip ${focus?.id === area.id ? 'chip--active' : ''}`}
            onClick={() => setFocus({ ...area })}
          >
            {area.name}
          </button>
        ))}
      </nav>
      <HistoryMap items={items} focus={focus} />
    </div>
  )
}
