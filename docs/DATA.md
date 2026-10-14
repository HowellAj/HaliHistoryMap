# Map data

Pins come from `src/data/items.json`, an array of items. Every item belongs to
a place from `src/data/places.json`; featured places also get a jump-to button
on the map page.

Invalid items and places are skipped (with a warning in the browser console) rather than
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
| `place` | yes | One of the ids in `places.json`. For a corner photo, use the street the camera faces down |
| `sourceUrl` | yes | Page for the original item |
| `credit` | yes | e.g. `Halifax Municipal Archives` |
| `yearStart`, `yearEnd` | no | Use a range when the date is fuzzy; same value for an exact year |
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
  "place": "barrington",
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
  "place": "water"
}
```

## Places

Places live in `src/data/places.json`, an array of named spots that items
belong to.

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Unique, lowercase, e.g. `spring-garden`. Items refer to this in `place` |
| `name` | yes | Display name, e.g. `Spring Garden Road` |
| `kind` | yes | `"street"`, `"landmark"`, `"island"` or `"neighbourhood"` |
| `lat`, `lng` | yes | Numbers, where the map centres when jumping to this place |
| `zoom` | no | Map zoom level used when jumping to this place |
| `featured` | no | `true` to show a jump-to button on the map page |

```json
{
  "id": "citadel",
  "name": "Citadel Hill",
  "kind": "landmark",
  "lat": 44.6476,
  "lng": -63.5806,
  "zoom": 17,
  "featured": true
}
```

Notes:

- Pins on the map cluster by distance, not by place. Items from two places can
  share a cluster, and one place's items can split across clusters.
- V1 stores `place` on every item but only filters by year. A place filter may
  come later.
