"""The footer's two corals, baked from one source render so the site runs no
filters at runtime: blur, underwater haze, desaturation and an alpha feather
at the base (the rock slab melts into the sand instead of sitting on it like a
sticker) are all in the pixels.

Reference artboard is 2880 wide (רפרנס2.jpg is its 2x export), so its blur
values halve on a 1440 screen; the blur here is scaled to each raster so the
displayed softness lands on that.

  python3 make_corals.py <coral2.webp> <output dir>
Needs Pillow + numpy.
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

src = sys.argv[1]
out = sys.argv[2]
os.makedirs(out, exist_ok=True)

WATER_MID = (13, 64, 117)   # the footer shader's waterMid, in sRGB

def premul_blur(im, blur):
    """blur in premultiplied space, else the transparent (black) surround bleeds
    a dark fringe into the soft edge"""
    a = np.asarray(im).astype(np.float32) / 255.0
    rgb, al = a[..., :3], a[..., 3:4]
    pm = np.concatenate([rgb * al, al], axis=-1)
    pm8 = Image.fromarray((pm * 255).round().astype(np.uint8), "RGBA").filter(ImageFilter.GaussianBlur(blur))
    b = np.asarray(pm8).astype(np.float32) / 255.0
    al2 = b[..., 3:4]
    rgb2 = np.where(al2 > 1e-4, b[..., :3] / np.maximum(al2, 1e-4), 0.0)
    return Image.fromarray((np.concatenate([np.clip(rgb2, 0, 1), al2], axis=-1) * 255).round().astype(np.uint8), "RGBA")

def haze(im, k, desat):
    """blend RGB toward the water colour by k, keep alpha, desaturate a bit"""
    rgb = ImageEnhance.Color(im.convert("RGB")).enhance(1 - desat)
    rgb = Image.blend(rgb, Image.new("RGB", im.size, WATER_MID), k)
    o = rgb.convert("RGBA"); o.putalpha(im.getchannel("A"))
    return o

def feather_bottom(im, frac):
    """alpha eases to zero over the bottom `frac` of the image"""
    a = np.asarray(im).astype(np.float32)
    h = a.shape[0]; n = int(h * frac)
    t = np.linspace(0, 1, n, endpoint=False)[:, None]
    a[h - n:, :, 3] *= (1 - t * t)
    return Image.fromarray(a.round().astype(np.uint8), "RGBA")

coral = Image.open(src).convert("RGBA")
coral = coral.crop(coral.getbbox())

def variant(width, blur, k, desat, feather, name, q):
    c = coral.resize((width, round(width * coral.size[1] / coral.size[0])), Image.LANCZOS)
    pad = int(blur * 3) + 2
    canvas = Image.new("RGBA", (c.size[0] + 2 * pad, c.size[1] + 2 * pad), (0, 0, 0, 0))
    canvas.paste(c, (pad, pad))
    canvas = feather_bottom(haze(premul_blur(canvas, blur), k, desat), feather)
    p = os.path.join(out, name)
    canvas.save(p, "WEBP", quality=q, method=6, alpha_quality=90)
    print(f"{name:18s} {canvas.size[0]}x{canvas.size[1]}  {os.path.getsize(p)/1024:6.1f} KB")

# far: on the mid floor — 3-4px@2880 ≈ 1.75px on 1440, plus distance haze
variant(420, 2.4, 0.20, 0.14, 0.10, "coral-far.webp", 74)
# near: nudges the title from behind — 8px@2880 ≈ 4px on 1440
variant(640, 6.0, 0.12, 0.08, 0.08, "coral-near.webp", 74)
