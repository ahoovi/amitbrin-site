#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build.py · לימוד רומנית · פיצול העמוד המצטבר לעמודים
=====================================================
מקור אחד:   limbaromana-src/limbaromana.html   (העמוד המצטבר - כאן ממשיכים לערוך שיעורים)
פלט:        public/limbaromana*.html + limbaromana.css + limbaromana-app.js + limbaromana-index.json

    python3 tools/limbaromana-split/build.py            # מתוך שורש הריפו
    python3 tools/limbaromana-split/build.py <repo>     # או עם נתיב מפורש

מה הסקריפט עושה
  1. קורא את המקור, מפרק אותו ל-111 סעיפים לפי ה-.part dividers.
  2. מחלק לעמודים: p1..p9 לפי חלקי הלימוד; רפרנסים כבדים (מילון, פעלים, תארים, מספרים)
     לעמוד משלהם; בנק המבחן והשאלון האישי לעמוד "מבחן". במקום סעיף שהועבר נשאר stub עם קישור.
  3. .ro/.street מקבלים data-h (אותו hash כמו קבצי ה-mp3) - בלי כפתור נפרד: האייקון והלחיצה
     יושבים על המילה עצמה, וה-DOM נשאר רזה. ה-hash מחושב ב-limbahash.py, פורט 1:1 מה-mjs.
  4. שורות המילון/הפעלים/התארים מקבלות id (d-*/v-*/a-*) - כדי שחיפוש גלובלי ינחת על השורה.
  5. כל href="#id" נכתב מחדש לעמוד הנכון. ה-JSON של הטיוטור מסונן לכרטיסים שבעמוד.
  6. CSS אחד משותף (ה-<style> המקורי + nav.css), JS אחד משותף (app.js + מפת האתר).
  7. אינדקס חיפוש: סעיפים, מילון, פעלים, תארים. בלי תשובות אישיות (examen15/chestpersonal).
"""
import re, json, os, sys, hashlib
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from limbahash import RO_RE, clip_for

REPO = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..'))
SRC = os.path.join(REPO, 'limbaromana-src', 'limbaromana.html')
PUB = os.path.join(REPO, 'public')
MANIFEST = os.path.join(PUB, 'limbaromana-audio', 'manifest.json')

# ─────────────────────────────────────────────────────────────────────────────
# הגדרת העמודים
# ─────────────────────────────────────────────────────────────────────────────
# סעיפים שיוצאים מהחלק שלהם לעמוד משלהם (הכבדים, וה"מצטברים" שנפתחים כרפרנס)
MOVE = OrderedDict([
    ('verbref',       'ref-verbe'),
    ('adjref',        'ref-adj'),
    ('numref',        'ref-num'),
    ('dict',          'ref-dict'),
    ('opening',       'exam'),
    ('examen15',      'exam'),
    ('chestpersonal', 'exam'),
])
REF_PAGES = OrderedDict([
    ('ref-dict',  {'title': 'המילון · Dicționar',              'short': 'מילון',  'lead': 'כל שמות העצם שנלמדו, לפי סדר אלפביתי רומני, עם מין ורבים.'}),
    ('ref-verbe', {'title': 'אזור הפעלים · Conjugările',       'short': 'פעלים',  'lead': 'כל פועל שנלמד, בהטיה מלאה, לפי ארבע קבוצות ההטיה.'}),
    ('ref-adj',   {'title': 'מאגר התארים · Adjective',         'short': 'תארים',  'lead': 'כל תואר לפי משפחתו: ארבע צורות, שלוש, שתיים או אחת.'}),
    ('ref-num',   {'title': 'המספרים · Numerele',              'short': 'מספרים', 'lead': 'המדריך המלא למספרים - מאפס ועד המיליון, שעות ותאריכים.'}),
    ('exam',      {'title': 'מבחן · Examen',                   'short': 'מבחן',   'lead': 'שאלות הפתיחה, בנק השאלות למבחן A1 והשאלון האישי.'}),
])
TOPIC_PAGES = 9   # part-1 .. part-9 (part-10 "רפרנס" מתפזר לעמודי הרפרנס)

def page_url(pid):
    return '/limbaromana.html' if pid == 'home' else '/limbaromana-%s.html' % pid

# ─────────────────────────────────────────────────────────────────────────────
# קריאה ופירוק
# ─────────────────────────────────────────────────────────────────────────────
src = open(SRC, encoding='utf-8').read()
head_end = src.find('<main>')
main_start = head_end + len('<main>')
main_end = src.find('</main>')
main_html = src[main_start:main_end]
tail = src[main_end:]

css_src = re.search(r'<style[^>]*>([\s\S]*?)</style>', src).group(1)
title_m = re.search(r'<title>([^<]*)</title>', src)
lessons_range = re.search(r'(\d+)-(\d+)', title_m.group(1))
LAST_LESSON = int(lessons_range.group(2)) if lessons_range else 0

tutor_json_m = re.search(r'<script type="application/json" id="tutor-prompts">([\s\S]*?)</script>', src)
TUTOR = json.loads(tutor_json_m.group(1))

# ה-dword split (שורת ההכתבה) - קודם להכול, כדי שה-hash יתאים למניפסט
m = re.search(r'<span class="ro" style="font-weight:400">([^<]*)</span>', main_html)
if m:
    words = [w.strip() for w in m.group(1).split(',') if w.strip()]
    main_html = main_html[:m.start()] + ' '.join('<span class="ro dword">%s</span>' % w for w in words) + main_html[m.end():]

# ה-legend וה-TOC
legend_m = re.search(r'<section id="legend"[\s\S]*?</section>', main_html)
LEGEND = legend_m.group(0)
toc_m = re.search(r'<nav class="toc" id="toc">[\s\S]*?</nav>', main_html)
TOC = toc_m.group(0)
toc_topic = re.search(r'<div class="toc-view" id="toc-topic">([\s\S]*?)</div>\s*<div class="toc-view" id="toc-lesson"', TOC).group(1)
toc_lesson = re.search(r'<div class="toc-view" id="toc-lesson" hidden>([\s\S]*?)</div>\s*</nav>', TOC).group(1)

# פירוק לרצף של חלקים וסעיפים
tokens = []
for mm in re.finditer(r'<div class="part"([^>]*)>([\s\S]*?)</div>|<section id="([^"]+)"([^>]*)>[\s\S]*?</section>', main_html):
    if mm.group(3):
        sid = mm.group(3)
        if sid == 'legend':
            continue
        attrs = mm.group(4)
        html = mm.group(0)
        h2 = re.search(r'<h2 class="sec">([\s\S]*?)</h2>', html)
        h2in = h2.group(1) if h2 else ''
        badge = re.search(r'<span class="num">([^<]*)</span>', h2in)
        title = re.sub(r'<button[\s\S]*?</button>', '', h2in)
        title = re.sub(r'<span class="num">[^<]*</span>', '', title)
        title = re.sub(r'<[^>]+>', '', title).replace('\n', ' ')
        title = re.sub(r'\s+', ' ', title).strip()
        sub = re.search(r'<p class="sec-sub">([\s\S]*?)</p>', html)
        subtxt = re.sub(r'<[^>]+>', '', sub.group(1)) if sub else ''
        subtxt = re.sub(r'\s+', ' ', subtxt).strip()
        lesson = re.search(r'data-lesson="([^"]*)"', attrs)
        topic = re.search(r'data-topic="([^"]*)"', attrs)
        tokens.append({'kind': 'sec', 'id': sid, 'html': html, 'title': title, 'badge': badge.group(1) if badge else '',
                       'sub': subtxt, 'lesson': lesson.group(1) if lesson else '', 'topic': topic.group(1) if topic else ''})
    else:
        a = mm.group(1)
        view = re.search(r'data-view="([^"]*)"', a).group(1)
        pid = re.search(r'id="([^"]*)"', a).group(1)
        pnum = re.search(r'class="pnum">([^<]*)', mm.group(2)).group(1)
        ptxt = re.search(r'class="ptxt">([^<]*)', mm.group(2)).group(1)
        tokens.append({'kind': 'part', 'view': view, 'id': pid, 'pnum': pnum, 'ptxt': ptxt, 'lesson': re.search(r'data-lesson="([^"]*)"', a).group(1) if 'data-lesson' in a else ''})

sections = [t for t in tokens if t['kind'] == 'sec']
parts = [t for t in tokens if t['kind'] == 'part' and t['view'] == 'topic']
lesson_parts = [t for t in tokens if t['kind'] == 'part' and t['view'] == 'lesson']
assert len(sections) == len(set(s['id'] for s in sections)), 'duplicate section id'

# שיוך סעיף ◂ חלק (לפי הסדר במקור)
cur = None
for t in tokens:
    if t['kind'] == 'part' and t['view'] == 'topic':
        cur = t
    elif t['kind'] == 'sec':
        t['part'] = cur['id']
        t['pnum'] = cur['pnum']
        t['ptxt'] = cur['ptxt']

# ─────────────────────────────────────────────────────────────────────────────
# תוכן העמודים
# ─────────────────────────────────────────────────────────────────────────────
pages = OrderedDict()   # pid -> dict(title, short, lead, secs:[section tokens], kind)
for i, p in enumerate(parts):
    n = i + 1
    if n > TOPIC_PAGES:
        continue
    pid = 'p%d' % n
    pages[pid] = {'kind': 'topic', 'part': p['id'], 'pnum': p['pnum'], 'title': p['ptxt'], 'short': p['ptxt'], 'secs': [], 'lead': ''}
for pid, meta in REF_PAGES.items():
    pages[pid] = {'kind': 'ref', 'part': None, 'pnum': 'רפרנס' if pid != 'exam' else 'מבחן', 'title': meta['title'], 'short': meta['short'], 'secs': [], 'lead': meta['lead']}

sec_page = {}        # id -> pid
for s in sections:
    if s['id'] in MOVE:
        pid = MOVE[s['id']]
    else:
        n = int(s['part'].split('-')[1])
        pid = 'p%d' % n
        if n > TOPIC_PAGES:
            raise SystemExit('section %s sits in %s which has no page - add it to MOVE' % (s['id'], s['part']))
    sec_page[s['id']] = pid
    pages[pid]['secs'].append(s)

# ─────────────────────────────────────────────────────────────────────────────
# טרנספורמציות על HTML של סעיף
# ─────────────────────────────────────────────────────────────────────────────
GPT_SVG_RE = re.compile(r'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22\.2819[^"]*"/></svg>')
GPT_USE = '<svg aria-hidden="true"><use href="#gpt-i"/></svg>'

def fold(s):
    s = s.lower()
    for a, b in (('ă', 'a'), ('â', 'a'), ('î', 'i'), ('ș', 's'), ('ş', 's'), ('ț', 't'), ('ţ', 't')):
        s = s.replace(a, b)
    return s

def slug(s):
    s = fold(re.sub(r'<[^>]+>', '', s))
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:48] or 'x'

clips = OrderedDict()     # h -> (section, text) in document order  (== manifest order)
def add_hashes(html, sid):
    def rep(m):
        h, t = clip_for(m)
        if not h:
            return m.group(0)
        if h not in clips:
            clips[h] = (sid, t)
        attrs = m.group(2) or ''
        return '<span class="%s"%s data-h="%s">%s</span>' % (m.group(1), attrs, h, m.group(3))
    return RO_RE.sub(rep, html)

used_ids = set()
def uniq(base):
    x = base; k = 2
    while x in used_ids:
        x = '%s-%d' % (base, k); k += 1
    used_ids.add(x)
    return x

INDEX = []   # entries for the global search
def id_rows(html, sid, prefix, kind):
    """Give every data row of the tables in this section an id, and index it."""
    out = []
    last = 0
    for m in re.finditer(r'<tr([^>]*)>([\s\S]*?)</tr>', html):
        attrs, inner = m.group(1), m.group(2)
        out.append(html[last:m.start()])
        last = m.end()
        if 'id="' in attrs or '<th' in inner or 'class="letter"' in attrs:
            out.append(m.group(0)); continue
        cells = re.findall(r'<td[^>]*>([\s\S]*?)</td>', inner)
        if not cells:
            out.append(m.group(0)); continue
        ro = re.search(r'<span class="ro[^"]*"[^>]*>([\s\S]*?)</span>', cells[0])
        if not ro:
            out.append(m.group(0)); continue
        word = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', ro.group(1))).strip()
        rid = uniq('%s-%s' % (prefix, slug(word)))
        out.append('<tr id="%s"%s>%s</tr>' % (rid, attrs, inner))
        # תרגום: המילון - טור 3; פעלים - ה-.he בתא הראשון; תארים - התא האחרון
        he = ''
        if kind == 'dict' and len(cells) >= 3:
            he = re.sub(r'<[^>]+>', '', cells[2])
        elif kind == 'verb':
            hm = re.search(r'<span class="he">([\s\S]*?)</span>', cells[0]); he = re.sub(r'<[^>]+>', '', hm.group(1)) if hm else ''
        elif kind == 'adj':
            he = re.sub(r'<[^>]+>', '', cells[-1])
            # כל צורות התואר נכנסות למחרוזת החיפוש
            forms = [re.sub(r'<[^>]+>', '', c) for c in cells[:-1]]
            word = ' / '.join(re.sub(r'\s+', ' ', f).strip() for f in forms if f.strip())
        he = re.sub(r'\s+', ' ', he).strip()
        INDEX.append({'k': kind, 'w': word, 'h': he[:80], 'u': page_url(sec_page[sid]) + '#' + rid})
    out.append(html[last:])
    return ''.join(out)

def transform(sec):
    html = sec['html']
    html = GPT_SVG_RE.sub(GPT_USE, html)
    if sec['id'] == 'dict':
        html = id_rows(html, sec['id'], 'd', 'dict')
    elif sec['id'] == 'verbref':
        html = id_rows(html, sec['id'], 'v', 'verb')
    elif sec['id'] == 'adjref':
        html = id_rows(html, sec['id'], 'a', 'adj')
    html = add_hashes(html, sec['id'])
    return html

# סדר המסמך המקורי קובע את סדר ה-clips (כדי להשוות למניפסט)
for s in sections:
    s['out'] = transform(s)

# ─────────────────────────────────────────────────────────────────────────────
# מפת מזהים ◂ עמודים, ושכתוב קישורים
# ─────────────────────────────────────────────────────────────────────────────
id_page = {}
for pid, pg in pages.items():
    for s in pg['secs']:
        for i in re.findall(r' id="([^"]+)"', s['out']):
            id_page[i] = pid
for p in parts:
    n = int(p['id'].split('-')[1])
    if n <= TOPIC_PAGES:
        id_page[p['id']] = 'p%d' % n
    else:
        id_page[p['id']] = 'ref-dict'
for s in sections:
    if s['id'] in MOVE:
        id_page['ptr-' + s['id']] = 'p%d' % int(s['part'].split('-')[1])
id_page['toc'] = 'home'; id_page['legend'] = 'home'; id_page['botnav'] = 'home'; id_page['map'] = 'home'; id_page['top'] = 'home'
for lp in lesson_parts:
    id_page[lp['id']] = 'home'

def rewrite_links(html, pid):
    def rep(m):
        target = m.group(1)
        if target not in id_page:
            return m.group(0)   # יאותר בבדיקה
        tp = id_page[target]
        if tp == pid:
            return 'href="#%s"' % target
        return 'href="%s#%s"' % (page_url(tp), target)
    html = re.sub(r'href="#([^"]+)"', rep, html)
    html = re.sub(r'href="/limbaromana\.html#([^"]+)"', lambda m: rep(m) if m.group(1) in id_page else m.group(0), html)
    return html

# ─────────────────────────────────────────────────────────────────────────────
# מפת האתר ל-JS (מוטמעת ב-app.js) ולעמוד הבית
# ─────────────────────────────────────────────────────────────────────────────
SITE = {'pages': [], 'secs': [], 'last': LAST_LESSON}
for pid, pg in pages.items():
    SITE['pages'].append({'id': pid, 'u': page_url(pid), 't': pg['title'], 's': pg['short'], 'n': pg['pnum'], 'k': pg['kind']})
for s in sections:
    SITE['secs'].append({'id': s['id'], 'p': sec_page[s['id']], 't': s['title'], 'b': s['badge'], 'l': s['lesson'], 'part': s['part']})

# ─────────────────────────────────────────────────────────────────────────────
# תבניות
# ─────────────────────────────────────────────────────────────────────────────
nav_css = open(os.path.join(HERE, 'nav.css'), encoding='utf-8').read()
app_js = open(os.path.join(HERE, 'app.js'), encoding='utf-8').read()

# CSS: מנקים מהמקור את מה שהוחלף (הבר הישן, התפריט, החיפוש הישן, ה-backjump, ה-TOC הישן)
def drop_blocks(css, markers):
    for start, end in markers:
        a = css.find(start)
        if a < 0: continue
        b = css.find(end, a) if end else len(css)
        if b < 0: b = len(css)
        css = css[:a] + css[b:]
    return css
css_out = css_src
css_out = drop_blocks(css_out, [
    ('/* -- sticky location bar -- */', '/* v8.1: heading scale'),
    ('/* v8.2: navbar arrow + caret affordance */', '/* ============ v9 ·'),
    ('/* back-jump pill:', '@media (max-width:640px){\n  th{position:static}'),
    ('/* -- 12.4 חיפוש בעמוד -- */', 'mark.lsr{'),
])
css_out = css_out.replace('.navbar .wrap>*{min-width:0}\n.navbar .loc{flex:1 1 0;min-width:0}\n', '')
css_out = css_out.replace('@media print{.navbar,.navmenu{display:none!important}}\n', '')
css_out = css_out.replace('@media print{.nsrch{display:none!important}mark.lsr{background:none;color:inherit}}', '@media print{mark.lsr{background:none;color:inherit}}')
css_out = css_out.replace(':root{--navh:44px;--abch:52px}', ':root{--navh:0px;--abch:52px}')
full_css = css_out + '\n\n' + nav_css
css_ver = hashlib.md5(full_css.encode('utf-8')).hexdigest()[:8]
full_js = app_js.replace('/*__SITE__*/', 'var SITE=' + json.dumps(SITE, ensure_ascii=False, separators=(',', ':')) + ';')
js_ver = hashlib.md5(full_js.encode('utf-8')).hexdigest()[:8]

SYMBOLS = '''<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
<symbol id="spk-i" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></symbol>
<symbol id="gpt-i" viewBox="0 0 24 24"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></symbol>
<symbol id="i-map" viewBox="0 0 24 24"><path d="M4 5h16v2H4zm0 6h16v2H4zm0 6h10v2H4z"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></symbol>
<symbol id="i-book" viewBox="0 0 24 24"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 18H6V4h5v8l2.5-1.5L16 12V4h2z"/></symbol>
<symbol id="i-home" viewBox="0 0 24 24"><path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z"/></symbol>
<symbol id="i-mute" viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.2l2.5 2.5zM19 12c0 .9-.2 1.8-.5 2.6l1.5 1.5A9 9 0 0 0 14 3.2v2.1a7 7 0 0 1 5 6.7zM4.3 3 3 4.3 7.7 9H3v6h4l5 5v-6.7l4.3 4.3a6 6 0 0 1-2.3 1.2v2.1a9 9 0 0 0 3.7-1.8L19.7 21l1.3-1.3zM12 4 9.9 6.1 12 8.2z"/></symbol>
</svg>'''

def head(title, desc=''):
    return '''<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<link rel="manifest" href="/limbaromana-manifest.json">
<meta name="theme-color" content="#1c2b4a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/limbaromana-icon-192.png">
<title>%s</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;800&family=Literata:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/limbaromana.css?v=%s">
<script>(function(){try{if(localStorage.getItem('limba_audio')==='off')document.documentElement.classList.add('noaudio');}catch(e){}})();</script>
</head>
''' % (title, css_ver)

def topbar(pid):
    """הבר העליון (דסקטופ) + סרגל הלשוניות התחתון (נייד). אותו DOM, ה-CSS מחליט."""
    return '''<header class="tb" id="tb">
  <div class="tbw">
    <a class="tb-brand" href="/limbaromana.html"><svg><use href="#i-home"/></svg><span>רומנית</span></a>
    <div class="tb-crumb" id="tbcrumb"></div>
    <button type="button" class="tb-btn tb-search" id="tb-search" aria-label="חיפוש (⌘K)"><svg><use href="#i-search"/></svg><span class="tb-kbd">חיפוש <kbd>⌘K</kbd></span></button>
    <button type="button" class="tb-btn tb-audio" id="tb-audio" aria-label="שמע" aria-pressed="true" title="שמע: לחיצה על מילה רומנית משמיעה אותה"><svg class="on"><use href="#spk-i"/></svg><svg class="off"><use href="#i-mute"/></svg></button>
    <button type="button" class="tb-btn tb-map" id="tb-map" aria-label="מפת הקורס" aria-expanded="false"><svg><use href="#i-map"/></svg><span>מפה</span></button>
  </div>
</header>
<nav class="tabbar" id="tabbar" aria-label="ניווט">
  <button type="button" data-sheet="map" aria-label="מפה"><svg><use href="#i-map"/></svg><span>מפה</span></button>
  <button type="button" data-sheet="search" aria-label="חיפוש"><svg><use href="#i-search"/></svg><span>חיפוש</span></button>
  <button type="button" data-sheet="ref" aria-label="רפרנס"><svg><use href="#i-book"/></svg><span>רפרנס</span></button>
  <button type="button" data-act="audio" aria-label="שמע" aria-pressed="true"><svg class="on"><use href="#spk-i"/></svg><svg class="off"><use href="#i-mute"/></svg><span>שמע</span></button>
</nav>
<div class="sheet" id="sheet" hidden><div class="sheet-bg"></div><div class="sheet-box" role="dialog" aria-modal="true"><div class="sheet-hd"><div class="sheet-tabs"><button type="button" data-tab="map">מפה</button><button type="button" data-tab="search">חיפוש</button><button type="button" data-tab="ref">רפרנס</button></div><button type="button" class="sheet-x" aria-label="סגור"><svg><use href="#i-x"/></svg></button></div><div class="sheet-body" id="sheet-body"></div></div></div>
<div class="findbar" id="findbar" hidden><span class="fb-q" id="fb-q"></span><span class="fb-n" id="fb-n"></span><button type="button" id="fb-prev" aria-label="הקודם">▲</button><button type="button" id="fb-next" aria-label="הבא">▼</button><button type="button" id="fb-x" aria-label="סגור">✕</button></div>
'''

def foot(pid, tutor_ids):
    tj = {k: v for k, v in TUTOR.items() if k in tutor_ids}
    return '''<script type="application/json" id="tutor-prompts">%s</script>
<script src="/limbaromana-app.js?v=%s" defer></script>
</body>
</html>
''' % (json.dumps(tj, ensure_ascii=False, separators=(',', ':')), js_ver)

def stub(sec):
    tp = MOVE[sec['id']]
    return '''<section id="ptr-%s" class="ptr" data-topic="%s" data-lesson="%s">
  <h2 class="sec"><span class="num">%s</span> %s</h2>
  <p class="sec-sub">%s</p>
  <a class="ptr-go" href="%s#%s">לפתוח את העמוד המלא ‹</a>
</section>
''' % (sec['id'], sec['topic'], sec['lesson'], sec['badge'], sec['title'], sec['sub'], page_url(tp), sec['id'])

def page_head_block(pid, pg):
    if pg['kind'] == 'topic':
        n = int(pid[1:])
        lessons = sorted({int(re.match(r'\d+', s['lesson']).group(0)) for s in pg['secs'] if re.match(r'\d+', s['lesson']) and s['lesson'] != '0'})
        rng = ('שיעורים %d–%d' % (lessons[0], lessons[-1])) if len(lessons) > 1 else ('שיעור %d' % lessons[0] if lessons else '')
        lead = '%d נושאים · %s' % (len([s for s in pg['secs'] if s['id'] not in MOVE]), rng)
        return '<header class="ph"><div class="ph-in"><a class="ph-crumb" href="/limbaromana.html">רומנית · המדריך</a><h1><span class="pnum">%s</span> %s</h1><p class="ph-lead">%s</p></div></header>\n' % (pg['pnum'], pg['title'], lead)
    return '<header class="ph"><div class="ph-in"><a class="ph-crumb" href="/limbaromana.html">רומנית · המדריך</a><h1><span class="pnum">%s</span> %s</h1><p class="ph-lead">%s</p></div></header>\n' % (pg['pnum'], pg['title'], pg['lead'])

def pager(pid):
    keys = list(pages.keys())
    i = keys.index(pid)
    prev = keys[i - 1] if i > 0 else None
    nxt = keys[i + 1] if i < len(keys) - 1 else None
    def lnk(k, cls, lab):
        if not k: return '<span class="pg-empty"></span>'
        p = pages[k]
        return '<a class="%s" href="%s"><small>%s</small><b>%s %s</b></a>' % (cls, page_url(k), lab, p['pnum'], p['title'])
    return '<nav class="pager" aria-label="עמוד קודם / הבא">%s%s</nav>\n' % (lnk(prev, 'pg-prev', 'הקודם'), lnk(nxt, 'pg-next', 'הבא'))

# ─────────────────────────────────────────────────────────────────────────────
# כתיבת עמודי התוכן
# ─────────────────────────────────────────────────────────────────────────────
os.makedirs(PUB, exist_ok=True)
written = {}
def write(name, html):
    path = os.path.join(PUB, name)
    open(path, 'w', encoding='utf-8').write(html)
    written[name] = len(html.encode('utf-8'))

# הסעיפים המועברים מופיעים בעמוד היעד לפי סדר ה-MOVE, אבל בעמוד המקור נשאר stub
for pid, pg in pages.items():
    body = []
    tutor_ids = set()
    for s in pg['secs']:
        html = s['out']
        tutor_ids.update(re.findall(r'data-t="([^"]+)"', html))
        body.append(html)
    # stubs במקום הסעיפים שיצאו מהחלק שלהם
    if pg['kind'] == 'topic':
        body = []
        for s in sections:
            if s['part'] != pg['part']:
                continue
            if s['id'] in MOVE:
                body.append(stub(s))
            else:
                body.append(s['out'])
        # ה-ptoc של עמוד נושא צריך את כל הסעיפים של החלק, כולל ה-stubs
        pg_secs_for_toc = [s for s in sections if s['part'] == pg['part']]
    else:
        pg_secs_for_toc = pg['secs']

    content = '\n'.join(body)
    def toc_html():
        items = []
        for s in pg_secs_for_toc:
            sid = s['id']
            if pg['kind'] == 'topic' and sid in MOVE:
                sid = 'ptr-' + sid
            items.append('<a href="#%s">%s</a>' % (sid, s['title'].split(' · ')[0]))
        return '<nav class="ptoc" aria-label="בעמוד הזה"><span class="ptoc-l">בעמוד הזה</span>%s</nav>\n' % ''.join(items)

    title = '%s · %s · רומנית' % (pg['pnum'], pg['title']) if pg['kind'] == 'topic' else '%s · רומנית' % pg['title']
    doc = head(title) + '<body data-page="%s">\n' % pid + SYMBOLS + '\n' + topbar(pid) + page_head_block(pid, pg) + '<main id="main">\n<div class="content">\n' + toc_html() + content + '\n' + pager(pid) + '</div>\n</main>\n' + foot(pid, tutor_ids)
    doc = rewrite_links(doc, pid)
    write('limbaromana-%s.html' % pid, doc)

# ─────────────────────────────────────────────────────────────────────────────
# עמוד הבית: מפה
# ─────────────────────────────────────────────────────────────────────────────
def home_topic_map():
    cards = []
    for pid, pg in pages.items():
        if pg['kind'] != 'topic': continue
        links = []
        for s in sections:
            if s['part'] != pg['part']: continue
            tp = sec_page[s['id']]
            href = page_url(tp) + '#' + s['id']
            ls = s['badge'].replace('שיעור ', 'ש').replace('תרגול בית', 'ת״ב').replace('ש״ב ', 'ש״ב')
            links.append('<a href="%s">%s <span class="toc-ls">· %s</span></a>' % (href, s['title'].split(' · ')[0], ls))
        cards.append('<details class="toc-group mp" id="%s"><summary class="unit"><span class="pnum">%s</span> %s <span class="cnt">%d</span></summary><div class="toc-items">%s</div></details>' % (pg['part'], pg['pnum'], pg['title'], len(links), ''.join(links)))
    # רפרנס
    links = ''.join('<a href="%s">%s</a>' % (page_url(pid), pg['title']) for pid, pg in pages.items() if pg['kind'] == 'ref')
    links += '<a href="/limbaromana-tutor.html">רשימת התרגולים הקוליים · להעתקה ל-ChatGPT</a>'
    cards.append('<details class="toc-group mp" id="part-10"><summary class="unit"><span class="pnum">רפרנס</span> מילון, פעלים, תארים, מספרים, מבחן</summary><div class="toc-items">%s</div></details>' % links)
    return ''.join(cards)

def home_lesson_map():
    # ה-TOC המקורי לפי שיעור - עם קישורים משוכתבים
    html = toc_lesson
    html = re.sub(r'<p class="toc-hint">[^<]*</p>', '', html)
    def rep(m):
        t = m.group(1)
        tp = id_page.get(t)
        if not tp: return m.group(0)
        return 'href="%s#%s"' % (page_url(tp), t)
    html = re.sub(r'href="#([^"]+)"', rep, html)
    # ה"מצטבר" בסוף: לינקים ישירים לעמודי הרפרנס
    return html

home_body = '''<body data-page="home">
%s
%s
<header class="home-top">
  <div class="ht-in">
    <h1>רומנית מהיסוד · המדריך המצטבר</h1>
    <span class="ro-title">Limba română · Unitatea 1-%d</span>
    <p>חומרי שיעורים 1-%d, ערוכים לפי סדר לימוד מצטבר. לחיצה על כל מילה רומנית משמיעה אותה; המילון, הפעלים והתארים הם עמודים משלהם, והחיפוש רואה את כולם.</p>
    <div class="ht-actions">
      <button type="button" id="dlall" class="ht-btn" hidden>⬇ הורד את כל השמע למכשיר</button>
      <a class="ht-btn alt" href="/limbaromana-tutor.html">📋 התרגולים הקוליים · ל-ChatGPT</a>
    </div>
  </div>
</header>
<main id="main" class="home">
<section class="resume" id="resume" hidden>
  <a id="resume-link" href="#"><small>המשך מאיפה שהפסקת</small><b id="resume-title"></b></a>
</section>
<section class="quick" id="quick" aria-label="גישה מהירה">
  <a href="/limbaromana-ref-dict.html"><b>המילון</b><small>Dicționar</small></a>
  <a href="/limbaromana-ref-verbe.html"><b>הפעלים</b><small>Conjugările</small></a>
  <a href="/limbaromana-ref-adj.html"><b>התארים</b><small>Adjective</small></a>
  <a href="/limbaromana-ref-num.html"><b>המספרים</b><small>Numerele</small></a>
  <a href="/limbaromana-exam.html"><b>מבחן</b><small>Examen A1</small></a>
  <button type="button" data-sheet="search"><b>חיפוש</b><small>בכל העמודים</small></button>
</section>
<nav class="toc map" id="map">
  <div class="toc-switch" role="tablist">
    <button type="button" class="tsw active" data-view="topic">לפי סדר הלימוד</button>
    <button type="button" class="tsw" data-view="lesson">לפי שיעור</button>
  </div>
  <div class="toc-view" id="toc-topic">%s</div>
  <div class="toc-view" id="toc-lesson" hidden>%s</div>
</nav>
%s
</main>
'''
home_html = head('רומנית · המדריך המצטבר · שיעורים 1-%d' % LAST_LESSON) + home_body % (SYMBOLS, topbar('home'), LAST_LESSON, LAST_LESSON, home_topic_map(), home_lesson_map(), LEGEND.replace('<section id="legend"', '<section id="legend" class="legend-sec"')) + foot('home', set())
home_html = GPT_SVG_RE.sub(GPT_USE, home_html)
write('limbaromana.html', home_html)

# הפניות מהכתובות הישנות
def redirect_page(title, to, text):
    return '''<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>%s</title><link rel="canonical" href="%s"><meta http-equiv="refresh" content="0; url=%s"><style>body{margin:0;background:#faf7f0;color:#2b3550;font-family:Rubik,Arial,sans-serif;direction:rtl;text-align:right;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}.box{max-width:520px;background:#fff;border:1px solid #e6e0d2;border-radius:14px;padding:26px 28px}a{color:#1c2b4a;font-weight:600}</style></head><body><div class="box"><p>%s</p><a href="%s">להמשיך ‹</a></div><script>location.replace(%s);</script></body></html>''' % (title, to, to, text, to, json.dumps(to + ('' if '#' in to else '') ))
write('limbaromana-lessons.html', redirect_page('רומנית · לפי שיעור', '/limbaromana.html?view=lesson#map', 'תצוגת השיעורים יושבת עכשיו במפת הקורס בעמוד הבית.'))
# עמוד האודיו: הסאונד מובנה בכל העמודים. ה-hash של הקישור הישן (למשל #verbref) נשמר.
write('limbaromana-audio.html', '''<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>רומנית · גרסת הסאונד עברה</title><link rel="canonical" href="/limbaromana.html"><style>body{margin:0;background:#faf7f0;color:#2b3550;font-family:Rubik,Arial,sans-serif;direction:rtl;text-align:right;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}.box{max-width:520px;background:#fff;border:1px solid #e6e0d2;border-radius:14px;padding:26px 28px}a{color:#1c2b4a;font-weight:600}</style></head><body><div class="box"><p>הסאונד מובנה עכשיו בכל העמודים - לחיצה על מילה רומנית משמיעה אותה. מעבירים אותך למדריך.</p><a href="/limbaromana.html">להמשיך ‹</a></div><script>location.replace('/limbaromana.html'+(location.hash||''));</script></body></html>''')

# עמוד הטיוטור: הקישורים שלו נכתבים כ-/limbaromana.html#id (כך תהליך עדכון השיעור מייצר אותם) -
# כאן הם מנורמלים לעמוד הנכון. אידמפוטנטי: קישור שכבר מצביע לעמוד המפוצל נשאר.
tutor_path = os.path.join(PUB, 'limbaromana-tutor.html')
if os.path.exists(tutor_path):
    th = open(tutor_path, encoding='utf-8').read()
    def trep(m):
        t = m.group(1)
        tp = id_page.get(t)
        return 'href="%s#%s"' % (page_url(tp), t) if tp else m.group(0)
    th2 = re.sub(r'href="/limbaromana(?:-[a-z0-9-]+)?\.html#([^"]+)"', trep, th)
    th2 = th2.replace('href="/limbaromana-audio.html"', 'href="/limbaromana.html"')
    if th2 != th:
        open(tutor_path, 'w', encoding='utf-8').write(th2)
        written['limbaromana-tutor.html (links)'] = len(th2.encode('utf-8'))

write('limbaromana.css', full_css)
write('limbaromana-app.js', full_js)

# אינדקס חיפוש: קודם הסעיפים, אחר כך המילון/פעלים/תארים
sec_index = [{'k': 'sec', 'w': s['title'], 'h': (s['badge'] + ' · ' if s['badge'] else '') + s['ptxt'], 'u': page_url(sec_page[s['id']]) + '#' + s['id']} for s in sections]
open(os.path.join(PUB, 'limbaromana-index.json'), 'w', encoding='utf-8').write(json.dumps({'v': LAST_LESSON, 'items': sec_index + INDEX}, ensure_ascii=False, separators=(',', ':')))
written['limbaromana-index.json'] = os.path.getsize(os.path.join(PUB, 'limbaromana-index.json'))

# ─────────────────────────────────────────────────────────────────────────────
# דוח ובדיקות
# ─────────────────────────────────────────────────────────────────────────────
report = {'pages': {}, 'clips': len(clips), 'index': len(INDEX) + len(sec_index)}
for name, n in written.items():
    report['pages'][name] = n
if os.path.exists(MANIFEST):
    man = [i['h'] for i in json.load(open(MANIFEST, encoding='utf-8'))['items']]
    ours = list(clips.keys())
    report['manifest_equal'] = (man == ours)
    if man != ours:
        report['manifest_missing'] = [h for h in ours if h not in set(man)][:10]
        report['manifest_extra'] = [h for h in man if h not in set(ours)][:10]
json.dump(report, open(os.path.join(HERE, 'last-build.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for name, n in written.items():
    print('%-32s %8.1f KB' % (name, n / 1024))
print('clips %d · index %d · manifest_equal=%s' % (len(clips), report['index'], report.get('manifest_equal')))
