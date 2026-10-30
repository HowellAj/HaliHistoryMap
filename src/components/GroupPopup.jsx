import { useState } from 'react'
import ItemPopup from './ItemPopup.jsx'

// Popup for a pin that holds several items at the same spot: shows one item
// at a time with previous/next arrows (buttons or the keyboard arrow keys).
export default function GroupPopup({ items }) {
  const [index, setIndex] = useState(0)
  const count = items.length
  const item = items[index]

  function step(delta) {
    setIndex((i) => (i + delta + count) % count)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'ArrowRight') step(1)
    else return
    e.preventDefault()
    e.stopPropagation() // don't also pan the map
  }

  return (
    <div className="group-popup" tabIndex={0} onKeyDown={handleKeyDown} aria-roledescription="carousel">
      <div className="group-nav">
        <button type="button" className="group-nav__arrow" onClick={() => step(-1)} aria-label="Previous photo">
          ‹
        </button>
        <span className="group-nav__count" aria-live="polite">
          {index + 1} / {count}
        </span>
        <button type="button" className="group-nav__arrow" onClick={() => step(1)} aria-label="Next photo">
          ›
        </button>
      </div>
      {/* key resets the image element so the old photo doesn't linger while the next loads */}
      <ItemPopup key={item.id} item={item} />
    </div>
  )
}
