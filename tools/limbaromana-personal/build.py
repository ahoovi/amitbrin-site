#!/usr/bin/env python3
"""Generate safe in-session reading units from the canonical book, never a second manual copy."""
import hashlib, json, re
from html import escape
from html.parser import HTMLParser
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'limbaromana-src/limbaromana.html'
SECTIONS = ['greet', 'intro', 'pronouns', 'afi', 'gender', 'avea', 'perfect17', 'rutina20']
ALLOWED = {'section','div','p','span','b','strong','i','em','br','ul','ol','li','table','thead','tbody','tr','th','td','h2','h3','h4','small','details','summary','sup','sub'}
DROP = {'script','style','button','svg','iframe','form','input','audio','video'}
class ReadingHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out=[]; self.skip=0
    def handle_starttag(self, tag, attrs):
        if tag == 'input': return  # Void element: it has no closing tag.
        if tag in DROP: self.skip+=1; return
        if self.skip: return
        data=dict(attrs)
        if tag=='a':
            target=data.get('href','').removeprefix('#')
            if target in SECTIONS: self.out.append('<span class="reading-reference">')
            else: self.out.append('<span>')
            return
        if tag not in ALLOWED: return
        mapped='h3' if tag=='h2' else tag
        keep=[]
        if data.get('class'): keep.append('class="'+escape(data['class'],quote=True)+'"')
        if 'ro' in data.get('class','').split(): keep+=['lang="ro"','dir="ltr"']
        for key in ('colspan','rowspan'):
            if data.get(key,'').isdigit(): keep.append(key+'="'+data[key]+'"')
        self.out.append('<'+mapped+(' '+' '.join(keep) if keep else '')+'>')
    def handle_endtag(self,tag):
        if tag in DROP:
            if self.skip: self.skip-=1
            return
        if self.skip: return
        if tag=='a': self.out.append('</span>'); return
        if tag in ALLOWED and tag!='br': self.out.append('</'+('h3' if tag=='h2' else tag)+'>')
    def handle_data(self,data):
        if not self.skip: self.out.append(escape(data))
def build():
    source=SOURCE.read_text()
    units={}
    for key in SECTIONS:
        match=re.search(r'<section id="'+re.escape(key)+r'"[^>]*>[\s\S]*?</section>', source)
        if not match: raise ValueError('Missing source section '+key)
        parser=ReadingHTML(); parser.feed(match[0]); html=''.join(parser.out)
        if len(html)<100: raise ValueError('Empty reading unit '+key)
        units[key]={'html':html,'sourceId':key,'revision':hashlib.sha256(match[0].encode()).hexdigest()[:12]}
    output=ROOT/'public/limba-personal/materials.json'
    output.write_text(json.dumps({'schema':1,'source':'limbaromana-src/limbaromana.html','revision':hashlib.sha256(source.encode()).hexdigest()[:12],'units':units},ensure_ascii=False,indent=2)+'\n')
    print(f'Personal reading: {len(units)} source units, {output.stat().st_size:,} bytes')
if __name__=='__main__': build()
