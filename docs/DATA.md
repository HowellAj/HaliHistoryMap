# Map data

Pins come from `src/data/items.json`, an array of items. The jump-to-area
buttons come from `src/data/areas.json`.

Invalid items are skipped (with a warning in the browser console) rather than
breaking the map.

## Item fields

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Unique, e.g. `barrington-1920-01` |
| `title` | yes | Short caption |
| `lat`, `lng` | yes | Numbers, where the photographer stood |
| `type` | yes | `"photo"` or `"video"` |
| `imageUrl` | photos | Direct link to the image at its source (never copied into this repo) |
| `embedUrl` | videos | An official embed link, e.g. `https://www.youtube.com/embed/<id>` |
| `sourceUrl` | yes | Page for the original item |
| `credit` | yes | e.g. `Halifax Municipal Archives` |
| `yearStart`, `yearEnd` | no | Use a range when the date is fuzzy; same value for an exact year |
| `area` | no | One of the ids in `areas.json` |
| `description` | no | A sentence or two |
| `heading` | no | Compass direction the camera faced (0 = north), used for "View today" |

## Photo example

```json
{
  "id": "barrington-1955-01",
  "title": "Barrington Street looking north",
  "lat": 44.6466,
  "lng": -63.5738,
  "type": "photo",
  "imageUrl": "https://live.staticflickr.com/.../photo.jpg",
  "sourceUrl": "https://www.flickr.com/photos/.../",
  "credit": "Halifax Municipal Archives",
  "yearStart": 1955,
  "yearEnd": 1955,
  "area": "barrington",
  "heading": 0
}
```

## Video example

```json
{
  "id": "water-1970-video-01",
  "title": "Waterfront, 1970",
  "lat": 44.6478,
  "lng": -63.5703,
  "type": "video",
  "embedUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "sourceUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "credit": "CBC Archives",
  "yearStart": 1968,
  "yearEnd": 1972,
  "area": "water"
}
```
