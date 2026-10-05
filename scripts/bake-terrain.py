"""
Bakes the elevation of the west coast into one small greyscale PNG for the
3D map (src/components/map3d/), so the browser never calls a third party:
public/terrain/west-coast.png, with its bounds in src/lib/terrain.ts.

Source: AWS Terrain Tiles (Terrarium encoding), free and openly licensed,
built from SRTM (NASA), GMTED2010 (USGS) and ETOPO1 (NOAA) among others; it
includes the depth of the lagoon and the reef. Credited on /credits.

Run again only to change the area or the resolution:

    python3 scripts/bake-terrain.py

Needs Pillow (pip install pillow).
"""

import io
import math
import urllib.request

from PIL import Image

# The coast from north of Flic en Flac to south of Le Morne, inland over the
# Black River peaks and the Chamarel plateau.
NORTH, SOUTH, WEST, EAST = -20.22, -20.50, 57.295, 57.475
ZOOM = 12
# About 100 m between grid points.
COLS, ROWS = 192, 316
# Heights stored as 0..255: -60 m (deep water beyond the reef) to 840 m.
LOW, HIGH = -60.0, 840.0
OUT = "public/terrain/west-coast.png"


def tile_xy(lat, lng, z):
    n = 2**z
    x = (lng + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


x0, y0 = tile_xy(NORTH, WEST, ZOOM)
x1, y1 = tile_xy(SOUTH, EAST, ZOOM)
tiles = {}
for tx in range(int(x0), int(x1) + 1):
    for ty in range(int(y0), int(y1) + 1):
        url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{ZOOM}/{tx}/{ty}.png"
        tiles[(tx, ty)] = Image.open(io.BytesIO(urllib.request.urlopen(url).read())).convert("RGB")
print("tiles", len(tiles))


def height(fx, fy):
    """Terrarium height at fractional tile coordinates (nearest pixel)."""
    tx, ty = int(fx), int(fy)
    px = min(255, int((fx - tx) * 256))
    py = min(255, int((fy - ty) * 256))
    r, g, b = tiles[(tx, ty)].getpixel((px, py))
    return r * 256 + g + b / 256 - 32768


out = Image.new("L", (COLS, ROWS))
for row in range(ROWS):
    lat = NORTH + (SOUTH - NORTH) * row / (ROWS - 1)
    for col in range(COLS):
        lng = WEST + (EAST - WEST) * col / (COLS - 1)
        # Average a 2 x 2 neighbourhood for a smoother surface.
        fx, fy = tile_xy(lat, lng, ZOOM)
        d = 0.5 / 256
        h = sum(height(fx + dx, fy + dy) for dx in (-d, d) for dy in (-d, d)) / 4
        v = round((min(HIGH, max(LOW, h)) - LOW) / (HIGH - LOW) * 255)
        out.putpixel((col, row), v)

import os

os.makedirs(os.path.dirname(OUT), exist_ok=True)
out.save(OUT, optimize=True)
lo, hi = out.getextrema()
print(OUT, os.path.getsize(OUT), "bytes, range", lo, hi,
      "metres", round(LOW + lo / 255 * (HIGH - LOW)), round(LOW + hi / 255 * (HIGH - LOW)))
