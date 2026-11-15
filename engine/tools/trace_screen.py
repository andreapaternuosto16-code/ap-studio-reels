"""Trace a phone's real inner screen edge (glass meets black bezel) in a photo.
Rays are cast from the screen centre across each edge; the first dark (bezel) pixel marks the glass edge.
A line is fitted to each edge (robust, middle 70% only), the four lines are intersected for the
corner-pin quad, and the device's rounded-rectangle screen (iPhone 6.1": 393x852 pt, ~55 pt corner
radius) is projected through that quad to make the clip mask. Writes:
  <out>-mask.png    screen-glass alpha mask (pulled ~1.5 px inside the bezel, anti-aliased)
  <out>-shadow.png  soft inner shadow where glass meets bezel
  <out>-glass.png   the photo's own glass (reflections) for a faint screen-blend
Prints JSON: corners (TL,TR,BR,BL), mean glass colour.
Usage: python3 -I trace_screen.py photo.jpg out_prefix x0,y0 x1,y1 x2,y2 x3,y3 [dark_threshold]
"""
import sys, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

photo, out = sys.argv[1], sys.argv[2]
R = np.array([list(map(float, p.split(","))) for p in sys.argv[3:7]])
DARK = float(sys.argv[7]) if len(sys.argv) > 7 else 70
im = Image.open(photo).convert("RGB")
a = np.asarray(im).astype(float)
L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
H, W = L.shape
c = R.mean(0)

def edge_points(p0, p1, top=False):
    pts = []
    # the top edge carries the Dynamic Island in the middle: sample either side of it
    ts = np.r_[np.linspace(0.12, 0.3, 45), np.linspace(0.7, 0.88, 45)] if top else np.linspace(0.15, 0.85, 90)
    for t in ts:
        q = p0 + (p1 - p0) * t
        d = q - c; n = np.linalg.norm(d); u = d / n
        prev = None
        for s in np.arange(n * 0.75, n * 1.25, 0.5):
            x, y = c + u * s
            xi, yi = int(round(x)), int(round(y))
            if not (0 <= xi < W and 0 <= yi < H): break
            if L[yi, xi] < DARK:
                if prev is not None: pts.append(prev)
                break
            prev = (x, y)
    return np.array(pts)

def fit(P):
    for _ in range(3):  # robust: drop the worst 15% and refit
        m = P.mean(0); _, _, vt = np.linalg.svd(P - m); d = vt[0]; n = np.array([-d[1], d[0]])
        r = np.abs((P - m) @ n); P = P[r <= np.percentile(r, 85) + 0.5]
    return m, d, float(np.abs((P - m) @ n).mean())

lines, resid = [], []
for k in range(4):
    m, d, e = fit(edge_points(R[k], R[(k + 1) % 4], top=(k == 0))); lines.append((m, d)); resid.append(round(e, 2))
def inter(l1, l2):
    (c1, d1), (c2, d2) = l1, l2
    t = np.linalg.solve(np.array([d1, -d2]).T, c2 - c1); return c1 + t[0] * d1
Q = np.array([inter(lines[(k - 1) % 4], lines[k]) for k in range(4)])

# homography from the 420x910 screen box to the quad
src = np.array([[0, 0], [420, 0], [420, 910], [0, 910]], float)
A, B = [], []
for (x, y), (u, v) in zip(src, Q):
    A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
    A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
h = np.linalg.solve(np.array(A), np.array(B))
Hm = np.array([[h[0], h[1], h[2]], [h[3], h[4], h[5]], [h[6], h[7], 1]])
def proj(x, y):
    p = Hm @ np.array([x, y, 1.0]); return (p[0] / p[2], p[1] / p[2])

# device screen shape: rounded rectangle, radius 55 pt (= 58.8 units), drawn 4x supersampled
RADIUS_PT = float(sys.argv[8]) if len(sys.argv) > 8 else 55
r = RADIUS_PT * 420 / 393
poly = []
for (cx, cy, a0) in [(r, r, 180), (420 - r, r, 270), (420 - r, 910 - r, 0), (r, 910 - r, 90)]:
    for t in np.linspace(a0, a0 + 90, 24):
        poly.append(proj(cx + r * np.cos(np.radians(t)), cy + r * np.sin(np.radians(t))))
SS = 4
big = Image.new("L", (W * SS, H * SS), 0)
ImageDraw.Draw(big).polygon([(x * SS, y * SS) for x, y in poly], fill=255)
mask = big.resize((W, H), Image.LANCZOS)  # the traced glass edge: content meets the black bezel, which stays as the border
Image.merge("RGBA", (Image.new("L", mask.size, 255),) * 3 + (mask,)).save(out + "-mask.png", optimize=True)  # CSS masks read alpha
mv = np.asarray(mask).astype(float)
far = mask.filter(ImageFilter.MinFilter(15)).filter(ImageFilter.GaussianBlur(7))
sh = np.clip(mv - np.asarray(far).astype(float), 0, 255) * 0.6
rgba = np.zeros((H, W, 4), np.uint8); rgba[..., 3] = sh.astype(np.uint8)
Image.fromarray(rgba, "RGBA").save(out + "-shadow.png")
rgb = np.where(mv[..., None] > 0, a, 0).astype(np.uint8)  # nothing stored outside the glass
Image.fromarray(np.dstack([rgb, mv.astype(np.uint8)]), "RGBA").save(out + "-glass.png", optimize=True)
inside = mv > 200
print(json.dumps({"corners": [[round(float(x), 1), round(float(y), 1)] for x, y in Q],
                  "edgeResidualPx": resid, "screenMean": [round(float(v)) for v in a[inside].mean(0)]}))
