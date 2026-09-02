# -*- coding: utf-8 -*-
"""Python port of the audio pipeline's clean() + cyrb53() from build-limbaromana-audio.mjs.
Hashes must be byte-identical to the JS ones - every mp3 on disk is named by them."""
import re

M32 = 0xFFFFFFFF

def imul(a, b):
    return ((a & M32) * (b & M32)) & M32

def cyrb53(s, seed=0):
    h1 = (0xDEADBEEF ^ seed) & M32
    h2 = (0x41C6CE57 ^ seed) & M32
    # JS iterates UTF-16 code units
    units = [int.from_bytes(s.encode('utf-16-le')[i:i+2], 'little') for i in range(0, len(s.encode('utf-16-le')), 2)]
    for ch in units:
        h1 = imul(h1 ^ ch, 2654435761)
        h2 = imul(h2 ^ ch, 1597334677)
    h1 = imul(h1 ^ (h1 >> 16), 2246822507)
    h1 ^= imul(h2 ^ (h2 >> 13), 3266489909)
    h1 &= M32
    h2 = imul(h2 ^ (h2 >> 16), 2246822507)
    h2 ^= imul(h1 ^ (h1 >> 13), 3266489909)
    h2 &= M32
    n = 4294967296 * (2097151 & h2) + h1
    return to36(n)

def to36(n):
    if n == 0:
        return '0'
    digs = '0123456789abcdefghijklmnopqrstuvwxyz'
    out = []
    while n:
        n, r = divmod(n, 36)
        out.append(digs[r])
    return ''.join(reversed(out))

_JS_TRIM = re.compile(r'^[ \t\n\v\f\r\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+|[ \t\n\v\f\r\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+$')
_JS_WS = '[ \\t\\n\\v\\f\\r\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff]'

def clean(t):
    t = re.sub(r'\[[^\]]*\]', ' ', t)
    t = re.sub(r'[()]', ' ', t)
    t = re.sub(r'[≠=→·↔]', ', ', t)
    t = t.replace('/', ', ')
    t = re.sub(r'\.{2,}', ' ', t)
    t = re.sub(r'^' + _JS_WS + '*-' + _JS_WS + '*', '', t)
    t = re.sub(_JS_WS + r'*,' + _JS_WS + r'*(?:,' + _JS_WS + r'*)+', ', ', t)
    t = re.sub(_JS_WS + '+', ' ', t)
    t = _JS_TRIM.sub('', t)
    t = re.sub(r'^[,' + _JS_WS[1:-1] + r']+|[,' + _JS_WS[1:-1] + r']+$', '', t)
    return t

def speakable(t):
    return bool(t) and re.search(r'[a-zăâîșțĂÂÎȘȚ]', t, re.I) is not None and '+' not in t

RO_RE = re.compile(r'<span class="(ro(?:\s[\w-]+)*|street)"((?:\s[^>]*)?)>([\s\S]*?)</span>')
TAG_RE = re.compile(r'<[^>]+>')
BLOCKY_RE = re.compile(r'<br|<span', re.I)

def clip_for(m):
    """Given a RO_RE match, return (hash, text) or (None, None) when the span stays silent."""
    is_street = m.group(1) == 'street'
    raw = m.group(3)
    if BLOCKY_RE.search(raw):
        return None, None
    inner = TAG_RE.sub('', raw)
    t = clean(re.sub(r'[\[\]]', '', inner) if is_street else inner)
    if not speakable(t):
        return None, None
    return cyrb53(t), t
