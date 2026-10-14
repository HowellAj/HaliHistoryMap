// Popup content for one map item: the photo or video, caption and credit.

function formatYears({ yearStart, yearEnd }) {
  if (!yearStart && !yearEnd) return 'Date unknown'
  if (!yearEnd || yearStart === yearEnd) return `${yearStart ?? yearEnd}`
  if (!yearStart) return `${yearEnd}`
  return `${yearStart}–${yearEnd}`
}

function streetViewUrl({ lat, lng, heading }) {
  const params = new URLSearchParams({ api: '1', map_action: 'pano', viewpoint: `${lat},${lng}` })
  if (typeof heading === 'number') params.set('heading', String(heading))
  return `https://www.google.com/maps/@?${params}`
}

function Media({ item }) {
  if (item.type === 'video') {
    return (
      <div className="item-media item-media--video">
        <iframe
          src={item.embedUrl}
          title={item.title}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        />
      </div>
    )
  }
  return (
    <a className="item-media" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
      <img src={item.imageUrl} alt={item.title} loading="lazy" />
    </a>
  )
}

export default function ItemPopup({ item }) {
  return (
    <div className="item-popup">
      <Media item={item} />
      <h3>{item.title}</h3>
      <p className="item-meta">{formatYears(item)}</p>
      {item.description && <p>{item.description}</p>}
      <p className="item-credit">
        Credit: {item.credit} ·{' '}
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">View original</a>
      </p>
      <a className="button button--small" href={streetViewUrl(item)} target="_blank" rel="noopener noreferrer">
        View today
      </a>
    </div>
  )
}
