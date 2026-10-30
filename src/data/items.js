import rawItems from './items.json'
import rawPlaces from './places.json'

// Each item is one pin on the map. See docs/DATA.md for the full schema.
//   type 'photo' -> shows imageUrl
//   type 'video' -> shows embedUrl in an iframe (e.g. a YouTube embed link)
//   place        -> required, one of the ids in places.json
//
// Each place is a named spot (street, landmark, island, neighbourhood).
// Featured places get a jump-to button on the map page.

const TYPES = new Set(['photo', 'video'])
const PLACE_KINDS = new Set(['street', 'landmark', 'island', 'neighbourhood'])

export function validatePlace(place) {
  const problems = []
  if (!place.id) problems.push('missing id')
  if (!place.name) problems.push('missing name')
  if (typeof place.lat !== 'number' || typeof place.lng !== 'number') problems.push('lat/lng must be numbers')
  if (!PLACE_KINDS.has(place.kind)) problems.push(`kind must be one of ${[...PLACE_KINDS].join(', ')}`)
  return problems
}

// Drop bad places the same way bad items are dropped.
export const places = rawPlaces.filter((place) => {
  const problems = validatePlace(place)
  if (problems.length) {
    console.warn(`Skipping place ${place.id ?? '(no id)'}: ${problems.join(', ')}`)
    
    return false
  }
  return true
})

const PLACE_IDS = new Set(places.map((p) => p.id))

export function validateItem(item) {
  const problems = []
  if (!item.id) problems.push('missing id for like real')
  if (!item.title) problems.push('missing title')
  if (typeof item.lat !== 'number' || typeof item.lng !== 'number') problems.push('lat/lng must be numbers')
  if (!TYPES.has(item.type)) problems.push(`type must be "photo" or "video"`)
  if (item.type === 'photo' && !item.imageUrl) problems.push('photo needs imageUrl')
  if (item.type === 'video' && !item.embedUrl) problems.push('video needs embedUrl')
  if (!item.credit) problems.push('missing credit')
  if (!item.sourceUrl) problems.push('missing sourceUrl')
  if (!item.place) problems.push('missing place')
  else if (!PLACE_IDS.has(item.place)) problems.push(`unknown place "${item.place}"`)
  return problems
}

// Drop bad entries instead of breaking the map, and say why in the console.
export const items = rawItems.filter((item) => {
  const problems = validateItem(item)
  if (problems.length) {
    console.warn(`Skipping item ${item.id ?? '(no id)'}: ${problems.join(', ')}`)
   
    return false
  } 
  return true
})
