#!/usr/bin/env python3
"""
slim-assets.py — shrink what amitbrin-site ships on every deployment.

Four independent steps. None of them changes how any live page looks or
behaves; the only routes that disappear are two unlinked experiment pages
(/site2 and /hero-test) that are not in the sitemap and are not linked from
anywhere on the site.

  routes   delete src/app/site2 and src/app/hero-test — the last place the
           boxer/newsletter section still lives — plus the two media files
           that then have no reader left (bot-whisperer.mp4, and the boxing
           poster boxing-coach-fallback.webp)
  orphans  delete image/video files under public/ that nothing references
  og       blog og:image PNG -> JPEG. og-default.png is deliberately left
           alone: it is the site's own share cover and stays lossless PNG
  avatar   tutor avatars PNG -> WebP (alpha preserved), references updated

Deliberately NOT touched, because they are still in use — verified by grep
across src/, public/, tools/, scripts/ and limbaromana-src/:
  media/headshot.png       -> blog/human-chatbot, blog/whatsapp-broke-communication
  media/boxing.mp4         -> blog/taste
  media/sailing-1080p.mp4  -> app/site (the live one-pager)
  media/seabed-sand.webp   -> app/site

Audio is not handled here. See scripts/trim-audio-silence.py.

Usage:
    python3 scripts/slim-assets.py                        # dry run, report only
    python3 scripts/slim-assets.py --apply
    python3 scripts/slim-assets.py --apply --only og,avatar
    python3 scripts/slim-assets.py --apply --og-quality 50

Requires: Pillow (pip install pillow).
"""

import argparse
import io
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

# Unlinked experiment routes. Absent from sitemap.ts, not referenced by any
# component. /site (the live one-pager) and / are untouched.
DEAD_ROUTES = ["src/app/site2", "src/app/hero-test"]

# Media that only those routes referenced.
ROUTE_MEDIA = [
    "media/bot-whisperer.mp4",
    "media/boxing-coach-fallback.webp",
]

# Verified zero references anywhere in the repo.
ORPHANS = [
    "media/bot-whisperer copy.mp4",     # already deleted by hand; harmless if missing
    "media/underwater.mp4",
    "media/blog/whatsapp-broke-communication/cover-1024.jpg",
    "media/paper-texture.jpg",
    "media/client-logo-wall.jpg",
    "media/effie-gold.png",
    "media/holographic-foil.jpg",
    "media/holographic-foil-2.jpg",
    "media/holographic-foil-abstract-wallpaper-background-hologram-texture-premium-small.jpg",
    "avatar/hero/hero-wave.png",
    "avatar/hero/hero-presenting.png",
    "avatar/hero/hero-approve.png",
    "avatar/hero/hero-think.png",
    "avatar/glyph/glyph-listen.png",
    "avatar/glyph/glyph-smile.png",
    "avatar/glyph/glyph-smile2.png",
    "avatar/glyph/glyph-pleasent.png",
    "avatar/glyph/glyph-inspecting.png",
    "avatar/tutor/avatar-tutor-14.png",
    "avatar/tutor/avatar-tutor-5.png",
    "avatar/tutor/avatar-tutor-approve2.png",
    "avatar/tutor/avatar-tutor-cheering2.png",
    "avatar/tutor/avatar-tutor-demo.png",
    "avatar/tutor/avatar-tutor-demonstrate.png",
    "avatar/tutor/avatar-tutor-examine.png",
    "avatar/tutor/avatar-tutor-greet.png",
    "avatar/tutor/avatar-tutor-learn2.png",
    "avatar/tutor/avatar-tutor-pleased.png",
    "avatar/tutor/avatar-tutor-resting.png",
    "avatar/tutor/avatar-tutor-show.png",
    "avatar/tutor/avatar-tutor-think2.png",
    "next.svg", "vercel.svg", "window.svg", "globe.svg", "file.svg",
]

# The site's own share cover — stays PNG.
OG_KEEP_PNG = {"og-default.png"}

REF_ROOTS = ["src", "public", "tools", "scripts", "limbaromana-src"]
REF_SUFFIXES = {".ts", ".tsx", ".js", ".mjs", ".json", ".css", ".html", ".py", ".xml", ".md"}


def human(n):
    for u in ("B", "KB", "MB", "GB"):
        if n < 1024 or u == "GB":
            return f"{n:.1f}{u}"
        n /= 1024


def tree_size(p):
    if not p.exists():
        return 0
    if p.is_file():
        return p.stat().st_size
    return sum(f.stat().st_size for f in p.rglob("*") if f.is_file())


def text_files():
    for root in REF_ROOTS:
        base = ROOT / root
        if not base.exists():
            continue
        for f in base.rglob("*"):
            if f.is_file() and f.suffix in REF_SUFFIXES:
                yield f


def rewrite_refs(pairs, apply):
    touched = []
    for f in text_files():
        try:
            src = f.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        out = src
        for old, new in pairs:
            out = out.replace(old, new)
        if out != src:
            touched.append(f)
            if apply:
                f.write_text(out, encoding="utf-8")
    return touched


def step_routes(apply, _q):
    freed = 0
    for rel in DEAD_ROUTES:
        p = ROOT / rel
        if p.exists():
            freed += tree_size(p)
            if apply:
                shutil.rmtree(p)
    for rel in ROUTE_MEDIA:
        p = PUBLIC / rel
        if p.exists():
            freed += p.stat().st_size
            if apply:
                p.unlink()
    print(f"  routes  : /site2 + /hero-test removed, {human(freed)} of source and media")
    return freed


def step_orphans(apply, _q):
    freed = gone = 0
    for rel in ORPHANS:
        p = PUBLIC / rel
        if not p.exists():
            continue
        freed += p.stat().st_size
        gone += 1
        if apply:
            p.unlink()
    if apply:
        for d in ("avatar/hero", "avatar/glyph"):
            p = PUBLIC / d
            if p.exists() and not any(p.iterdir()):
                p.rmdir()
    print(f"  orphans : {gone} files, {human(freed)} freed")
    return freed


def step_og(apply, quality):
    from PIL import Image
    og = PUBLIC / "media" / "og"
    before = after = 0
    pairs = []
    for png in sorted(og.glob("*.png")):
        if png.name in OG_KEEP_PNG:
            continue
        jpg = png.with_suffix(".jpg")
        im = Image.open(png).convert("RGB")
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
        data = buf.getvalue()
        before += png.stat().st_size
        after += len(data)
        pairs.append((png.name, jpg.name))
        if apply:
            jpg.write_bytes(data)
            png.unlink()
    touched = rewrite_refs(pairs, apply)
    kept = ", ".join(sorted(OG_KEEP_PNG))
    print(f"  og      : {len(pairs)} images at q{quality}, {human(before)} -> {human(after)}"
          f"  ({len(touched)} source files updated; {kept} left as PNG)")
    return before - after


def step_avatar(apply, _q):
    from PIL import Image
    targets = sorted((PUBLIC / "avatar" / "tutor").glob("*.png")) + \
        sorted((PUBLIC / "avatar").glob("*.png"))
    before = after = 0
    pairs = []
    for png in targets:
        if not png.exists():
            continue
        webp = png.with_suffix(".webp")
        im = Image.open(png)
        buf = io.BytesIO()
        im.save(buf, "WEBP", quality=86, method=6)
        data = buf.getvalue()
        before += png.stat().st_size
        after += len(data)
        pairs.append((png.name, webp.name))
        if apply:
            webp.write_bytes(data)
            png.unlink()
    touched = rewrite_refs(pairs, apply)
    print(f"  avatar  : {len(pairs)} images, {human(before)} -> {human(after)}"
          f"  ({len(touched)} source files updated)")
    return before - after


STEPS = {
    "routes": step_routes,
    "orphans": step_orphans,
    "og": step_og,
    "avatar": step_avatar,
}
ORDER = ["routes", "orphans", "og", "avatar"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--only", default=",".join(ORDER))
    ap.add_argument("--og-quality", type=int, default=60)
    args = ap.parse_args()

    chosen = [s.strip() for s in args.only.split(",") if s.strip()]
    bad = [s for s in chosen if s not in STEPS]
    if bad:
        sys.exit(f"unknown step(s): {', '.join(bad)}")
    chosen = [s for s in ORDER if s in chosen]

    print(f"public/ before: {human(tree_size(PUBLIC))}"
          f"   [{'APPLY' if args.apply else 'DRY RUN'}]")
    saved = sum(STEPS[s](args.apply, args.og_quality) for s in chosen)
    print(f"public/ after : {human(tree_size(PUBLIC))}   (saved {human(saved)} in all)")
    if not args.apply:
        print("\nnothing was written. re-run with --apply")


if __name__ == "__main__":
    main()
