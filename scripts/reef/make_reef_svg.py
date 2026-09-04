"""reef-life.svg — the footer's silhouettes (algae, branch, two fish) in one
SVG atlas, blurred by feGaussianBlur inside the file itself. SeaLife.tsx draws
this one image into a canvas once and slices sprites out of it, so the browser
does the rasterising and the blurring, and the site ships no bitmap.

Runs with the Python standard library only.
  python3 make_reef_svg.py <source dir> <output file>
Cells (x, y, w, h) — must match ATLAS in src/components/SeaLife.tsx:
  algae  0,0,408,1048 · branch 408,0,596,1030 · fish1 0,1048,148,60 · fish2 156,1048,108,103
"""
import re, sys, os

src = sys.argv[1] if len(sys.argv) > 1 else "."
out = sys.argv[2] if len(sys.argv) > 2 else "reef-life.svg"
FILL = "#0d1b33"   # underwater silhouettes read navy, not black

def load(name):
    s = open(os.path.join(src, name), encoding="utf-8").read()
    vb = re.search(r'viewBox="([^"]+)"', s).group(1).split()
    w, h = float(vb[2]), float(vb[3])
    paths = re.findall(r'<path[^>]*\sd="([^"]+)"', s)
    return w, h, paths

def fmt(x):
    return ("%.4f" % x).rstrip("0").rstrip(".")

# name, file, target height or width, blur sigma (px, in atlas space), cell x, cell y, pad
CELLS = [
    ("algae",  "algea1.svg",  ("h", 1000), 7.5, 0,   0,    24),
    ("branch", "branch1.svg", ("h", 1000), 4.5, 408, 0,    15),   # thin twigs: less sigma or they vanish
    ("fish1",  "fish1.svg",   ("w", 132),  2.2, 0,   1048, 8),
    ("fish2",  "fish2.svg",   ("w", 92),   2.2, 156, 1048, 8),
]

groups, defs, rects = [], [], {}
for name, fn, (axis, size), blur, cx, cy, pad in CELLS:
    w, h, paths = load(fn)
    s = size / (h if axis == "h" else w)
    cw, ch = int(round(w * s)) + 2 * pad, int(round(h * s)) + 2 * pad
    rects[name] = (cx, cy, cw, ch)
    defs.append(f'<filter id="f-{name}"><feGaussianBlur stdDeviation="{fmt(blur)}"/></filter>')
    body = "".join(f'<path d="{d}"/>' for d in paths)
    # filter OUTSIDE the transform: stdDeviation is then in atlas pixels
    groups.append(
        f'<g filter="url(#f-{name})"><g transform="translate({cx + pad} {cy + pad}) scale({fmt(s)})" fill="{FILL}">{body}</g></g>'
    )

W = max(x + w for x, y, w, h in rects.values())
H = max(y + h for x, y, w, h in rects.values())
svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
    f'<defs>{"".join(defs)}</defs>{"".join(groups)}</svg>'
)
open(out, "w", encoding="utf-8").write(svg)
print(f"{out}: {W}x{H}, {os.path.getsize(out)/1024:.1f} KB")
for k, v in rects.items():
    print(f"  {k:7s} {v}")
