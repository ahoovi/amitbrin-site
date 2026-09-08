# -*- coding: utf-8 -*-
import re, sys, json
from html.parser import HTMLParser
SRC = sys.argv[1]; TUT = sys.argv[2]; ORIG = sys.argv[3] if len(sys.argv) > 3 else None
s = open(SRC, encoding='utf-8').read()
t = open(TUT, encoding='utf-8').read()
err = []

# tag balance
class P(HTMLParser):
    def __init__(self): super().__init__(); self.st = []; self.bad = []
    VOID = {'br','hr','img','meta','link','input','source','path','use','circle','rect','line','polyline','polygon','ellipse','wbr','col'}
    def handle_starttag(self, tag, a):
        if tag in self.VOID: return
        self.st.append(tag)
    def handle_startendtag(self, tag, a): pass
    def handle_endtag(self, tag):
        if tag in self.VOID: return
        if self.st and self.st[-1] == tag: self.st.pop()
        else: self.bad.append((tag, self.getpos()))
p = P(); p.feed(s)
if p.bad or p.st: err.append('tag balance: %s / open %s' % (p.bad[:5], p.st[:5]))
for tag in ['section', 'details', 'table', 'div', 'span', 'tr', 'td', 'th']:
    o = len(re.findall(r'<%s\b' % tag, s)); c = s.count('</%s>' % tag)
    if o != c: err.append('unbalanced <%s>: %d open %d close' % (tag, o, c))

# duplicate ids
ids = re.findall(r' id="([^"]+)"', s)
dup = set(i for i in ids if ids.count(i) > 1)
if dup: err.append('duplicate ids: %s' % sorted(dup))
idset = set(ids)
# hrefs
for h in set(re.findall(r'href="#([^"]+)"', s)):
    if h not in idset and "'" not in h: err.append('unresolved href #' + h)

# g-* outside dict
d0 = s.find('<section id="dict"'); d1 = s.find('</section>', d0)
outside = s[:d0] + s[d1:]
if re.search(r'<tr class="g-[mfn]"', outside): err.append('tr.g-* outside dict')

# dict collation
ORDER = 'aăâbcdefghiîjklmnopqrsștțuvwxyz'
rank = {c: i for i, c in enumerate(ORDER)}
key = lambda w: [rank.get(c, 99) for c in w.lower()]
head = lambda w: re.sub(r'^(un|o|niște)\s+', '', w.split(' - ')[0]).strip()
prev = None
for m in re.finditer(r'<tr class="(letter|g-\w)"[^>]*>(.*?)</tr>', s[d0:d1], re.S):
    if m.group(1) == 'letter': prev = None; continue
    w = head(re.search(r'<span class="ro">([^<]*)</span>', m.group(2)).group(1))
    if prev and key(w) < key(prev): err.append('collation: %s > %s' % (prev, w))
    prev = w

# TOC coverage
secs = re.findall(r'<section id="([^"]+)" data-topic="[^"]*" data-lesson="([^"]*)"', s)
ti = s.find('id="toc-topic"'); tj = s.find('id="toc-lesson"'); tk = s.find('</nav>', tj)
toc_topic = set(re.findall(r'href="#([^"]+)"', s[ti:tj])); toc_lesson = set(re.findall(r'href="#([^"]+)"', s[tj:tk]))
for sid, les in secs:
    if sid in ('legend',): continue
    if sid not in toc_topic: err.append('missing in topic TOC: ' + sid)
    if sid not in toc_lesson: err.append('missing in lesson TOC: ' + sid)
# lesson dividers exist for each data-lesson
lessons = set(l for _, l in secs)
divs = set(re.findall(r'data-view="lesson" data-lesson="([^"]+)"', s))
for l in lessons:
    if l not in divs: err.append('no lesson divider for ' + l)

# .ro hygiene
RO = re.compile(r'<span class="(ro|ro big|street)"[^>]*>(.*?)</span>', re.S)
def ro_issues(html):
    out = []
    for m in RO.finditer(html):
        txt = re.sub(r'<[^>]+>', '', m.group(2))
        if '◂' in txt: out.append(('◂', txt))
        if re.search(r'\d', txt): out.append(('digit', txt))
        if re.fullmatch(r'[-\s]*[a-zăâîșț]{1,2}[-\s]*', txt) and txt.strip() not in ('a', 'o', 'e', 'un', 'nu', 'ai', 'am', 'au', 'el', 'ea', 'ei', 'eu', 'tu', 'de', 'la', 'pe', 'cu', 'în', 'și', 'da', 'ce', 'ci', 'că', 'să', 'mă', 'te', 'se', 'ne', 'vă', 'îi', 'le', 'îl', 'vă'):
            out.append(('bare', txt))
        if re.fullmatch(r'-[a-zăâîșț]+', txt.strip()): out.append(('suffix', txt))
        if re.search(r'\b[A-ZĂÂÎȘȚ]{2,}\b', txt): out.append(('CAPS', txt))
    return out
new_issues = ro_issues(s)
if ORIG:
    o = open(ORIG, encoding='utf-8').read()
    old = set(ro_issues(o))
    new_issues = [x for x in new_issues if x not in old]
for kind, txt in new_issues: err.append('ro %s: %r' % (kind, txt[:60]))

# rulemap cell count (depth aware)
for m in re.finditer(r'<div class="rmgrid" style="grid-template-columns:([^"]*)">', s):
    cols_m = re.search(r'repeat\((\d+),', m.group(1))
    if cols_m: cols = int(cols_m.group(1)) + 1
    else: cols = len(m.group(1).split())
    # walk divs
    i = m.end(); depth = 1; cells = 0; full = 0
    pos = i
    while depth > 0:
        n = re.search(r'<div\b[^>]*>|</div>', s[pos:]); assert n
        tok = n.group(0); pos += n.end()
        if tok == '</div>': depth -= 1
        else:
            if depth == 1:
                tagtxt = s[pos-5:pos+40]
                cells += 1
                if 'rmfull' in tok: full += 1
            depth += 1
    if (cells - full) % cols != 0 and not (ORIG and ('grid-template-columns:%s' % m.group(1)) in open(ORIG, encoding='utf-8').read()): err.append('rulemap cells: %d cells %d full %d cols' % (cells, full, cols))

# tutor data-t in both JSONs
def prompts(h):
    i = h.find('<script type="application/json" id="tutor-prompts">'); j = h.find('</script>', i)
    return json.loads(h[h.find('>', i) + 1:j])
ps, pt = prompts(s), prompts(t)
if set(ps) != set(pt): err.append('prompt keys differ: %s' % (set(ps) ^ set(pt)))
for k in set(re.findall(r'data-t="([^"]+)"', s)) | set(re.findall(r'data-t="([^"]+)"', t)):
    if k not in ps or k not in pt: err.append('data-t missing in json: ' + k)
for k in ps:
    if 'data-t="%s"' % k not in t: err.append('no tcard for ' + k)

# title consistency
for pat in ['שיעורים 1-19</title>', 'Unitatea 1-19', 'חומרי שיעורים 1-19']:
    if pat not in s: err.append('title not updated: ' + pat)

print('sections:', len(secs), '| dict rows:', len(re.findall(r'<tr class="g-', s[d0:d1])), '| prompts:', len(ps))
if err:
    print('\n'.join(err)); sys.exit(1)
print('VERIFY OK')
