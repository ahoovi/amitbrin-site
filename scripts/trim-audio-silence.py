#!/usr/bin/env python3
"""
Trim leading/trailing silence from the Romanian audio clips WITHOUT re-encoding.

ffmpeg's stream copy (-c copy) cuts on MPEG frame boundaries, so the audio that
survives is bit-identical to the original. Nothing is decoded, nothing is
re-encoded, the bitrate stays 64 kbps and the sample rate stays 44.1 kHz. The
only thing that changes is that the dead air ElevenLabs leaves at the end of
each clip stops being shipped and stored.

Filenames and URLs are untouched, so the Service Worker, the manifest and every
data-h attribute keep working exactly as they do now.

Usage:
    python3 scripts/trim-audio-silence.py                 # dry run on a sample
    python3 scripts/trim-audio-silence.py --sample 300    # bigger dry-run sample
    python3 scripts/trim-audio-silence.py --apply         # do it, all clips
    python3 scripts/trim-audio-silence.py --apply --pad 0.25   # gentler

--pad is how much silence to leave in place at each end, in seconds. 0.15 is
the default; raise it if the clips feel clipped when you listen.
"""

import argparse
import concurrent.futures
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "public" / "limbaromana-audio"

THRESHOLD = "-50dB"       # anything quieter than this counts as silence
MIN_SILENCE = "0.05"      # ignore gaps shorter than this
MIN_KEEP = 0.30           # never produce a clip shorter than this

SIL_START = re.compile(r"silence_start:\s*([\d.]+)")
SIL_END = re.compile(r"silence_end:\s*([\d.]+)")


def probe_duration(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    )
    try:
        return float(r.stdout.strip())
    except ValueError:
        return None


def find_bounds(path, pad):
    """Return (start, end) seconds to keep, or None if nothing to trim."""
    dur = probe_duration(path)
    if dur is None:
        return None
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path),
         "-af", f"silencedetect=n={THRESHOLD}:d={MIN_SILENCE}", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    log = r.stderr
    starts = [float(m) for m in SIL_START.findall(log)]
    ends = [float(m) for m in SIL_END.findall(log)]

    # leading silence: a silence block that begins at (or within pad of) zero
    start = 0.0
    if starts and starts[0] <= 0.02 and ends and ends[0] > 0:
        start = max(0.0, ends[0] - pad)

    # trailing silence: the last silence block runs to the end of the file
    # (ffmpeg may or may not emit a closing silence_end at EOF, so handle both)
    end = dur
    if starts:
        closed = ends[-1] if len(ends) == len(starts) else None
        if closed is None or closed >= dur - 0.06:
            end = min(dur, starts[-1] + pad)

    if end - start < MIN_KEEP:
        return None
    if start < 0.02 and dur - end < 0.05:
        return None                       # nothing worth cutting
    return (start, end)


def trim_one(args):
    path, pad, apply = args
    old = path.stat().st_size
    bounds = find_bounds(path, pad)
    if bounds is None:
        return (path.name, old, old, "skip")
    start, end = bounds
    tmp = path.with_suffix(".tmp.mp3")
    cmd = ["ffmpeg", "-v", "error", "-y"]
    if start > 0.02:
        cmd += ["-ss", f"{start:.3f}"]
    cmd += ["-i", str(path), "-to", f"{end:.3f}", "-c", "copy", str(tmp)]
    if start > 0.02:
        cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{start:.3f}", "-i", str(path),
               "-t", f"{end - start:.3f}", "-c", "copy", str(tmp)]
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0 or not tmp.exists() or tmp.stat().st_size < 500:
        tmp.unlink(missing_ok=True)
        return (path.name, old, old, "fail")
    new = tmp.stat().st_size
    if new >= old:
        tmp.unlink()
        return (path.name, old, old, "skip")
    if apply:
        os.replace(tmp, path)
    else:
        tmp.unlink()
    return (path.name, old, new, "trim")


def human(n):
    for u in ("B", "KB", "MB", "GB"):
        if n < 1024 or u == "GB":
            return f"{n:.1f}{u}"
        n /= 1024


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--pad", type=float, default=0.15)
    ap.add_argument("--sample", type=int, default=200,
                    help="dry-run only: how many clips to measure")
    args = ap.parse_args()

    files = sorted(AUDIO.glob("*.mp3"))
    if not files:
        sys.exit(f"no clips found in {AUDIO}")
    total_all = sum(f.stat().st_size for f in files)

    work = files if args.apply else files[:: max(1, len(files) // args.sample)]
    print(f"{len(files)} clips, {human(total_all)} total"
          f"   [{'APPLY' if args.apply else 'DRY RUN on ' + str(len(work)) + ' clips'}]"
          f"   pad={args.pad}s")

    before = after = 0
    counts = {"trim": 0, "skip": 0, "fail": 0}
    done = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as ex:
        for name, old, new, what in ex.map(
                trim_one, [(f, args.pad, args.apply) for f in work]):
            before += old
            after += new
            counts[what] += 1
            done += 1
            if args.apply and done % 500 == 0:
                print(f"  ... {done}/{len(work)}", flush=True)

    pct = (1 - after / before) * 100 if before else 0
    print(f"  trimmed {counts['trim']}, skipped {counts['skip']}, failed {counts['fail']}")
    print(f"  {human(before)} -> {human(after)}   ({pct:.1f}% smaller)")
    if not args.apply:
        print(f"\nprojected over all {len(files)} clips: "
              f"{human(total_all)} -> {human(total_all * (after / before))}")
        print("nothing was written. listen to a few, then re-run with --apply")


if __name__ == "__main__":
    main()
