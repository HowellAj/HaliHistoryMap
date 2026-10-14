import rawItems from './items.json'
import areas from './areas.json'

// Each item is one pin on the map. See docs/DATA.md for the full schema.
//   type 'photo' -> shows imageUrl
//   type 'video' -> shows embedUrl in an iframe (e.g. a YouTube embed link)

const AREA_IDS = new Set(areas.map((a) => a.id))
const TYPES = new Set(['photo', 'video'])

export function validateItem(item) {
  const problems = []
  if (!item.id) problems.push('missing id')
  if (!item.title) problems.push('missing title')
  if (typeof item.lat !== 'number' || typeof item.lng !== 'number') problems.push('lat/lng must be numbers')
  if (!TYPES.has(item.type)) problems.push(`type must be "photo" or "video"`)
  if (item.type === 'photo' && !item.imageUrl) problems.push('photo needs imageUrl')
  if (item.type === 'video' && !item.embedUrl) problems.push('video needs embedUrl')
  if (!item.credit) problems.push('missing credit')
  if (!item.sourceUrl) problems.push('missing sourceUrl')
  if (item.area && !AREA_IDS.has(item.area)) problems.push(`unknown area "${item.area}"`)
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

export { areas }
