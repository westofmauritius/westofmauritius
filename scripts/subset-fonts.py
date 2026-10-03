"""
Builds the site's web fonts: downloads the source files from Google Fonts,
keeps only the characters English and French text needs and writes small
WOFF2 files to src/assets/fonts/web/, which next/font/local then serves from
our own domain (see src/lib/fonts.ts).

Why our own subset instead of next/font/google: Google's "latin" subset
carries hundreds of glyphs we never show (Vietnamese marks, rare symbols).
Cutting them makes each file roughly a third smaller, which is what keeps
the first screen fast on phones now that headlines and body text both use
web fonts.

To change a font: edit SOURCES, run `python3 scripts/subset-fonts.py`, then
update the file names in src/lib/fonts.ts if they changed.
Needs fontTools and brotli (pip install fonttools brotli).
"""

import io
import re
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

OUT = "src/assets/fonts/web/"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"

# Google Fonts CSS query, output file, and the axis values to keep: a number
# pins an axis (a static font comes out), a (min, max) pair keeps a range.
# The same typefaces as the Hiriketiya site: Newsreader for headlines at its
# display optical size and weight 500, Figtree for text and the interface.
SOURCES = [
    ("Newsreader:opsz,wght@6..72,200..800", "serif-roman.woff2", {"opsz": 72, "wght": 500}),
    ("Newsreader:ital,opsz,wght@1,6..72,200..800", "serif-italic.woff2", {"opsz": 72, "wght": 500}),
    ("Figtree:wght@300..900", "sans.woff2", {"wght": (400, 600)}),
]

# Basic Latin, Latin 1 (French accents, NBSP, «», ·, °, ²), Œ œ Ÿ, the narrow
# no break space French typography uses, typographic quotes, ellipsis, the
# euro sign and the arrows used in links. Anything else falls back to the
# device font.
UNICODES = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x100))
    + [0x152, 0x153, 0x178, 0x2009, 0x202F, 0x2013, 0x2014]
    + list(range(0x2018, 0x201F))
    + [0x2022, 0x2026, 0x2039, 0x203A, 0x20AC, 0x2190, 0x2192, 0x2193]
)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req).read()


def latin_file(query):
    css = fetch(f"https://fonts.googleapis.com/css2?family={query}").decode()
    for name, body in re.findall(r"/\* (\S+) \*/\s*@font-face \{(.*?)\}", css, re.S):
        if name == "latin":
            return fetch(re.search(r"url\((\S+?)\)", body).group(1))
    raise SystemExit(f"No latin file for {query}")


# The italic only ever sets the accent word of a headline (and a tagline or
# quote), so it keeps letters and basic punctuation only: no digits,
# symbols or arrows. That makes it small enough to load on the homepage
# without delaying the main photo.
ITALIC_UNICODES = (
    list(range(0x20, 0x30))
    + [0x3A, 0x3B, 0x3F]
    + list(range(0x41, 0x5B))
    + list(range(0x61, 0x7B))
    + [0xA0, 0xAB, 0xBB]
    + list(range(0xC0, 0x100))
    + [0x152, 0x153, 0x178, 0x202F, 0x2019, 0x201C, 0x201D, 0x2026]
)

for query, out, axes in SOURCES:
    font = TTFont(io.BytesIO(latin_file(query)))
    if axes and "fvar" in font:
        # Keep only what the site uses; any other axis is pinned to its default.
        limits = {a.axisTag: None for a in font["fvar"].axes}
        limits.update(axes)
        font = instancer.instantiateVariableFont(font, limits)
    options = subset.Options()
    options.flavor = "woff2"
    # Kerning and ligatures stay; old style figures and the like go.
    options.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk"]
    options.name_IDs = [1, 2]
    options.hinting = False
    sub = subset.Subsetter(options)
    sub.populate(unicodes=ITALIC_UNICODES if "italic" in out else UNICODES)
    sub.subset(font)
    font.flavor = "woff2"
    font.save(OUT + out)
    print(out, len(open(OUT + out, "rb").read()) // 1024, "kB")

# Static TTF copies for the social sharing images (scripts/generate-og.tsx):
# the image renderer cannot read WOFF2 or variable fonts.
OG = [
    ("Newsreader:opsz,wght@6..72,200..800", "../Newsreader-Medium.ttf", {"opsz": 72, "wght": 500}),
    ("Figtree:wght@300..900", "../Figtree-Medium.ttf", {"wght": 500}),
]
for query, out, axes in OG:
    font = TTFont(io.BytesIO(latin_file(query)))
    font = instancer.instantiateVariableFont(font, axes)
    font.flavor = None
    font.save(OUT + out)
    print(out, len(open(OUT + out, "rb").read()) // 1024, "kB")
