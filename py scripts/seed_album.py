#!/usr/bin/env python3
"""
seed_album.py - turn a Flickr ALBUM link into Hali History Map items.

No API key needed. The album page's HTML already embeds a data record for every
photo (title, full description, license, image URLs), so one page request gets
everything and nothing has to be matched up by order.

Setup (once):   pip install requests beautifulsoup4

Usage (from C:\\Repos\\HaliHistory):
    python seed_album.py <album-url> --place <place-id> [--out items.generated.json] [--append]

Example:
    python seed_album.py https://www.flickr.com/photos/halifaxarchives/albums/72157716649753853/ --place halifax-shopping-centre

  --place   id from places.json (pins sit at that place's centre until you add lat/lng).
  --append  merge into the existing output file instead of replacing it
            (photos already in it, matched by sourceUrl, are refreshed).
  --html F  parse a saved copy of the album page instead of downloading it
            (use if Flickr refuses the download: browser > Save page as > HTML only).

It never touches the HaliHistoryMap folder. Copy items.generated.json into
HaliHistoryMap/src/data/items.json yourself when you're happy with it.

Fields written per item: everything DATA.md asks for, plus (ignored by the map for now)
rights, photographer, dateText, dateApprox, format, retrievalCode, collection,
archiveUrl, thumbnailUrl, flickrId, and needsReview (only present when something
should be checked by a human).
"""
import argparse
import json
import re
import sys
import time
from pathlib import Path

try:
    from bs4 import BeautifulSoup, NavigableString, Tag
except ImportError:
    sys.exit("Missing package. Run:  pip install requests beautifulsoup4")

HERE = Path(__file__).resolve().parent
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

# Flickr license ids -> readable text. 7-10 are the "free to use" ones.
LICENSES = {
    0: "All rights reserved",
    1: "CC BY-NC-SA 2.0",
    2: "CC BY-NC 2.0",
    3: "CC BY-NC-ND 2.0",
    4: "CC BY 2.0",
    5: "CC BY-SA 2.0",
    6: "CC BY-ND 2.0",
    7: "No known copyright restrictions",
    8: "United States Government Work",
    9: "CC0 1.0 (public domain dedication)",
    10: "Public Domain Mark 1.0",
}
OPEN_LICENSES = {7, 8, 9, 10}

IMAGE_SIZES = ["l", "c", "z", "o"]          # l = 1024px on the long side
THUMB_SIZES = ["n", "q", "m", "s", "t", "sq"]


# ---------------------------------------------------------------- fetching ---
def fetch(url):
    import requests  # imported here so --html works without it

    resp = requests.get(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "en"}, timeout=30)
    resp.raise_for_status()
    return resp.text


def extract_models(html, registry):
    """Pull every embedded Flickr model of one kind (e.g. 'photo-models') out of the page."""
    marker = '{"data":{"_flickrModelRegistry":"%s"' % registry
    decoder = json.JSONDecoder()
    found, pos = [], 0
    while True:
        pos = html.find(marker, pos)
        if pos == -1:
            return found
        try:
            obj, end = decoder.raw_decode(html, pos)
            found.append(obj["data"])
            pos = end
        except ValueError:
            pos += len(marker)


def photos_from_page(html):
    """Photos in album order, de-duplicated (the page repeats some records)."""
    seen, photos = set(), []
    for m in extract_models(html, "photo-models"):
        if m.get("id") and "description" in m and m["id"] not in seen:
            seen.add(m["id"])
            photos.append(m)
    return photos


# ----------------------------------------------------------------- parsing ---
def pick_size(sizes, prefs):
    for key in prefs:
        entry = sizes.get(key)
        if entry:
            url = entry["data"]["url"]
            return "https:" + url if url.startswith("//") else url
    return None


def parse_description(desc_html):
    """
    Split a Flickr Commons description into the free-text blurb and its labelled
    lines (Date / Photographer / Format / Retrieval Code, ...).
    """
    soup = BeautifulSoup(desc_html or "", "html.parser")
    blurb_parts, fields = [], {}
    label, collected = None, []

    def flush():
        if label is not None:
            fields[label] = collected[:]

    for node in soup.contents:
        if isinstance(node, Tag) and node.name == "b":
            flush()
            label = node.get_text().strip().rstrip(":").strip().lower()
            collected = []
        elif label is None:
            blurb_parts.append(node.get_text() if isinstance(node, Tag) else str(node))
        else:
            collected.append(node)
    flush()

    out = {"blurb": re.sub(r"\s+", " ", "".join(blurb_parts)).strip()}
    for key, nodes in fields.items():
        text = "".join(n.get_text() if isinstance(n, Tag) else str(n) for n in nodes)
        out[key] = re.sub(r"\s+", " ", text).strip()
        if key == "retrieval code":
            link = next((n for n in nodes if isinstance(n, Tag) and n.name == "a"), None)
            trailing = "".join(
                n.get_text() if isinstance(n, Tag) else str(n) for n in nodes if n is not link
            )
            trailing = re.sub(r"\s+", " ", trailing).strip().lstrip(",").strip()
            link_text = link.get_text().strip() if link else ""
            out["archiveUrl"] = link.get("href") if link else None
            if trailing:                      # "<a>Collection name</a>, 102-105-3-SC7-2"
                out["collection"], out["code"] = link_text or None, trailing
            else:                             # "<a>CR76.5</a>"
                out["collection"], out["code"] = None, link_text or out[key]
    return out


DECADE = re.compile(r"\[(\d{3})-?\?\]")          # [196-?]  or  [195?]  -> a decade
BRACKET_YEAR = re.compile(r"\[(\d{4})\??\]")      # [1962?]  or  [1962]
PLAIN_YEAR = re.compile(r"\b(1[5-9]\d\d|20\d\d)\b")


def year_range(date_text):
    """('December 5, 1962') -> (1962, 1962, False); ('[196-?]') -> (1960, 1969, True)."""
    if not date_text:
        return None, None, False
    text = date_text
    # "Reproduction [198-?] (originally created [192-?])": we want when it was taken.
    m = re.search(r"originally created(.*)", text, re.I)
    if m:
        text = m.group(1)
    approx = "?" in text or "[" in text or bool(re.search(r"\b(circa|ca\.|c\.|about)\b", text, re.I))
    spans = [(int(d) * 10, int(d) * 10 + 9) for d in DECADE.findall(text)]
    text_wo = DECADE.sub(" ", text)
    spans += [(int(y), int(y)) for y in BRACKET_YEAR.findall(text_wo)]
    text_wo = BRACKET_YEAR.sub(" ", text_wo)
    spans += [(int(y), int(y)) for y in PLAIN_YEAR.findall(text_wo)]
    if not spans:
        return None, None, approx
    return min(s for s, _ in spans), max(e for _, e in spans), approx


# ------------------------------------------------------------ item building ---
def build_item(photo, owner, place_id, place, credit_override, n_in_album):
    desc = parse_description(photo.get("description", ""))
    sizes = photo.get("sizes", {}).get("data", {})
    image_url = pick_size(sizes, IMAGE_SIZES)
    thumb_url = pick_size(sizes, THUMB_SIZES)
    if not image_url:
        raise ValueError("no usable image size in page data")

    date_text = desc.get("date")
    y_start, y_end, approx = year_range(date_text)
    license_id = photo.get("license")
    review = []
    if y_start is None:
        review.append("no usable date - won't appear under the year slider")
    elif approx:
        review.append(f'approximate date "{date_text}" -> {y_start}-{y_end}')
    if license_id not in OPEN_LICENSES:
        review.append(f"license is {LICENSES.get(license_id, license_id)} - check before publishing")
    if not desc.get("code"):
        review.append("no retrieval code found in description")

    path_alias = (owner or {}).get("pathAlias") or (owner or {}).get("id")
    pid = photo["id"]
    item = {
        "id": f"{place_id}-{y_start if y_start else 'undated'}-{pid}",
        "title": photo.get("title") or "Untitled",
        "lat": place["lat"],
        "lng": place["lng"],
        "type": "photo",
        "imageUrl": image_url,
        "sourceUrl": f"https://www.flickr.com/photos/{path_alias}/{pid}/",
        "credit": credit_override or (owner or {}).get("realname") or (owner or {}).get("username") or "Unknown",
        "rights": LICENSES.get(license_id, f"Unknown license ({license_id})"),
        "place": place_id,
    }
    if y_start is not None:
        item["yearStart"], item["yearEnd"] = y_start, y_end
    if desc["blurb"]:
        item["description"] = desc["blurb"]
    extras = {
        "photographer": desc.get("photographer"),
        "dateText": date_text,
        "dateApprox": approx if date_text else None,
        "format": desc.get("format"),
        "retrievalCode": desc.get("code"),
        "collection": desc.get("collection"),
        "archiveUrl": desc.get("archiveUrl"),
        "thumbnailUrl": thumb_url,
        "flickrId": pid,
    }
    item.update({k: v for k, v in extras.items() if v is not None})
    if review:
        item["needsReview"] = review
    return item


# -------------------------------------------------------------------- main ---
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("album_url", nargs="?", help="Flickr album link")
    ap.add_argument("--place", required=True, help="place id from places.json")
    ap.add_argument("--out", default=str(HERE / "items.generated.json"))
    ap.add_argument("--append", action="store_true", help="merge into existing output file")
    ap.add_argument("--html", help="parse this saved album page instead of downloading")
    ap.add_argument("--credit", help="override the credit line (default: the album owner's name)")
    ap.add_argument("--places-file", default=str(HERE / "places.json"))
    ap.add_argument("--delay", type=float, default=1.5, help="seconds between page requests")
    args = ap.parse_args()

    if not args.album_url and not args.html:
        ap.error("give an album URL or --html FILE")

    places = {p["id"]: p for p in json.loads(Path(args.places_file).read_text(encoding="utf-8"))}
    if args.place not in places:
        sys.exit(f'Unknown place "{args.place}". Known: {", ".join(places)}')
    place = places[args.place]

    # --- load page(s)
    if args.html:
        pages = [Path(args.html).read_text(encoding="utf-8")]
    else:
        pages = [fetch(args.album_url)]

    set_models = extract_models(pages[0], "set-models")
    album_id = re.search(r"/(?:albums|sets)/(\d+)", args.album_url or "")
    album = next((s for s in set_models if album_id and s.get("id") == album_id.group(1)),
                 set_models[0] if set_models else {})
    expected = int(album.get("photoCount") or 0)
    owner = (extract_models(pages[0], "person-models") or [None])[0]

    photos = photos_from_page(pages[0])
    if not args.html:
        page_no = 2
        while expected and len(photos) < expected and page_no <= 50:
            time.sleep(args.delay)
            try:
                more = photos_from_page(fetch(args.album_url.rstrip("/") + f"/page{page_no}"))
            except Exception as e:
                print(f"  (stopped paging at page {page_no}: {e})")
                break
            known = {p["id"] for p in photos}
            new = [p for p in more if p["id"] not in known]
            if not new:
                break
            photos += new
            page_no += 1

    if not photos:
        sys.exit("No photos found in that page. Flickr may have served a different page "
                 "(login/consent wall). Try --html with a page saved from your browser.")

    print(f'Album: "{album.get("title", "?")}" - {len(photos)} photo(s) found'
          + (f" of {expected}" if expected else ""))
    if expected and len(photos) < expected:
        print(f"  WARNING: album says {expected} photos but only {len(photos)} were readable.")

    items, failures = [], []
    for i, photo in enumerate(photos, 1):
        try:
            items.append(build_item(photo, owner, args.place, place, args.credit, i))
        except Exception as e:
            failures.append((photo.get("id"), str(e)))

    # --- write
    out_path = Path(args.out)
    if args.append and out_path.exists():
        existing = json.loads(out_path.read_text(encoding="utf-8"))
        fresh = {it["sourceUrl"] for it in items}
        items = [it for it in existing if it.get("sourceUrl") not in fresh] + items
    out_path.write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"\nWrote {len(items)} item(s) to {out_path}\n")
    for it in items:
        years = f'{it.get("yearStart", "????")}-{it.get("yearEnd", "????")}'
        flag = " *" if it.get("needsReview") else ""
        print(f'  {years:<10} {it.get("retrievalCode", "(no code)")[:28]:<28} {it["title"][:44]}{flag}')
    flagged = [it for it in items if it.get("needsReview")]
    if flagged:
        print(f"\n* {len(flagged)} item(s) have a `needsReview` note - open the JSON and search for it.")
    for pid, why in failures:
        print(f"FAILED {pid}: {why}")
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
