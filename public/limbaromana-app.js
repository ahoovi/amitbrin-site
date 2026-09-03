/* limbaromana-app.js · v16 · הפיצול
   סקריפט אחד לכל העמודים. מה שיושב כאן:
   1. scroll: גלילה חלקה לעוגנים + חצים בין סעיפים (LimbaScroll / LimbaNav)
   2. spy: איזה סעיף על המסך ◂ פירור בבר, מסילה, "בעמוד הזה", וזיכרון "המשך מאיפה שהפסקת"
   3. sheet: המגירה (מפה · חיפוש · רפרנס) - בנייד מלמטה, בדסקטופ לוח
   4. search: אינדקס גלובלי (limbaromana-index.json) + Find בעמוד עם סימונים, בתקרה
   5. audio: לחיצה על מילה עם data-h משמיעה אותה; חימום המטמון של העמוד; הורדת הכול בבית
   6. uniformcells / vtstickyhead / tutorcopy / anstoggle15 - עברו מהעמוד הישן כמעט כמו שהם
   7. sw + persist storage
*/
var SITE={"pages":[{"id":"p1","u":"/limbaromana-p1.html","t":"הגייה וכתיב","s":"הגייה וכתיב","n":"חלק 1","k":"topic"},{"id":"p2","u":"/limbaromana-p2.html","t":"ברכות, נימוסים והיכרות","s":"ברכות, נימוסים והיכרות","n":"חלק 2","k":"topic"},{"id":"p3","u":"/limbaromana-p3.html","t":"פעלים, כינויים ומבנה המשפט","s":"פעלים, כינויים ומבנה המשפט","n":"חלק 3","k":"topic"},{"id":"p4","u":"/limbaromana-p4.html","t":"שמות עצם: מין ומספר","s":"שמות עצם: מין ומספר","n":"חלק 4","k":"topic"},{"id":"p5","u":"/limbaromana-p5.html","t":"שמות תואר והשוואה","s":"שמות תואר והשוואה","n":"חלק 5","k":"topic"},{"id":"p6","u":"/limbaromana-p6.html","t":"מספרים, כמויות ושלילה","s":"מספרים, כמויות ושלילה","n":"חלק 6","k":"topic"},{"id":"p7","u":"/limbaromana-p7.html","t":"מילות יחס ושאלות","s":"מילות יחס ושאלות","n":"חלק 7","k":"topic"},{"id":"p8","u":"/limbaromana-p8.html","t":"עולם, נושאים ואוצר מילים","s":"עולם, נושאים ואוצר מילים","n":"חלק 8","k":"topic"},{"id":"p9","u":"/limbaromana-p9.html","t":"דיאלוגים ותרגול","s":"דיאלוגים ותרגול","n":"חלק 9","k":"topic"},{"id":"ref-dict","u":"/limbaromana-ref-dict.html","t":"המילון · Dicționar","s":"מילון","n":"רפרנס","k":"ref"},{"id":"ref-verbe","u":"/limbaromana-ref-verbe.html","t":"אזור הפעלים · Conjugările","s":"פעלים","n":"רפרנס","k":"ref"},{"id":"ref-adj","u":"/limbaromana-ref-adj.html","t":"מאגר התארים · Adjective","s":"תארים","n":"רפרנס","k":"ref"},{"id":"ref-num","u":"/limbaromana-ref-num.html","t":"המספרים · Numerele","s":"מספרים","n":"רפרנס","k":"ref"},{"id":"exam","u":"/limbaromana-exam.html","t":"מבחן · Examen","s":"מבחן","n":"מבחן","k":"ref"}],"secs":[{"id":"sounds","p":"p1","t":"צלילים ואותיות שצריך להכיר מחדש","b":"שיעור 1","l":"1","part":"part-1"},{"id":"cg","p":"p1","t":"החוק הגדול: C ו-G משנות צליל לפני E ו-I","b":"שיעור 1","l":"1","part":"part-1"},{"id":"plural-soft","p":"p1","t":"ריכוך עיצורים לפני i של הרבים","b":"שיעור 1","l":"1","part":"part-1"},{"id":"mb18","p":"p1","t":"לפני b ו-p תמיד m · Cacofonia, onomatopeea","b":"שיעור 18","l":"18","part":"part-1"},{"id":"greet","p":"p2","t":"ברכות לפי שעות היום","b":"שיעור 1","l":"1","part":"part-2"},{"id":"intro","p":"p2","t":"להכיר מישהו · A face cunoștință","b":"שיעור 1","l":"1","part":"part-2"},{"id":"smalltalk","p":"p2","t":"מה שלומך, תודה וסליחה","b":"שיעור 1","l":"1","part":"part-2"},{"id":"sanatate6","p":"p2","t":"בריאות וימי הולדת · Sănătate și aniversări","b":"שיעור 6","l":"6","part":"part-2"},{"id":"stari9","p":"p2","t":"Ce mai faci? · סולם התשובות המלא","b":"שיעור 9","l":"9","part":"part-2"},{"id":"prezentare9","p":"p2","t":"להציג את עצמך · Prezentarea + ציווי ראשון","b":"שיעור 9","l":"9","part":"part-2"},{"id":"scuze15","p":"p2","t":"חמש דרכים לומר סליחה · Îmi pare rău","b":"שיעור 15","l":"15","part":"part-2"},{"id":"salut16","p":"p2","t":"מה חדש? · Ce e nou la tine?","b":"שיעור 16","l":"16","part":"part-2"},{"id":"pronouns","p":"p3","t":"כינויי גוף · Pronumele personal","b":"שיעור 2","l":"2","part":"part-3"},{"id":"afi","p":"p3","t":"הפועל להיות · A fi בהווה","b":"שיעור 2","l":"2","part":"part-3"},{"id":"prez5","p":"p3","t":"להציג את עצמך · Prezentare","b":"שיעור 5","l":"5","part":"part-3"},{"id":"avea","p":"p3","t":"הפועל \"יש לי\" · A avea בהווה","b":"שיעור 4","l":"4","part":"part-3"},{"id":"merge6","p":"p3","t":"הפועל ללכת · A merge + תחבורה","b":"שיעור 6","l":"6","part":"part-3"},{"id":"verbref","p":"ref-verbe","t":"אזור הפעלים · Conjugările","b":"מצטבר","l":"0","part":"part-3"},{"id":"reflex11","p":"p3","t":"הפועל החוזר · Verbe reflexive","b":"שיעור 11","l":"11","part":"part-3"},{"id":"infinitiv11","p":"p3","t":"צורת המקור וארבע הקבוצות · Verbele la infinitiv","b":"שיעור 11","l":"11","part":"part-3"},{"id":"verbeez12","p":"p3","t":"קבוצה I עם ‎-ez · a lucra, a studia","b":"שיעור 12","l":"12","part":"part-3"},{"id":"verbe13","p":"p3","t":"‏-ez בהמשך: ה-h שנכנסת בין הגזע לסיומת","b":"שיעור 13","l":"13","part":"part-3"},{"id":"verbi13","p":"p3","t":"Unitatea 4 · הפעלים ב-‎-i: a dormi, a veni, a ieși, a ști","b":"שיעור 13","l":"13","part":"part-3"},{"id":"prezent14","p":"p3","t":"ההווה · מפת ארבע הקבוצות במקום אחד","b":"שיעור 14","l":"14","part":"part-3"},{"id":"grupe14","p":"p3","t":"ארבע הקבוצות · Grupe de verbe","b":"שיעור 14","l":"14","part":"part-3"},{"id":"transform14","p":"p3","t":"מה קורה בתוך הגזע · Transformări","b":"שיעור 14","l":"14","part":"part-3"},{"id":"exceptii14","p":"p3","t":"החריגים שלא מצייתים למפה","b":"שיעור 14","l":"14","part":"part-3"},{"id":"verbe18","p":"p3","t":"קבוצה IV בפועל · a suferi, a descoperi, משפחת a veni","b":"שיעור 18","l":"18","part":"part-3"},{"id":"prezentuz14","p":"p3","t":"מתי משתמשים בהווה · ומה שמפתיע","b":"שיעור 14","l":"14","part":"part-3"},{"id":"conj14","p":"p3","t":"מילות קישור · Conjuncții","b":"ש״ב 14","l":"14T","part":"part-3"},{"id":"conjunctiv15","p":"p3","t":"שני פעלים במשפט אחד · Conjunctivul","b":"שיעור 15","l":"15","part":"part-3"},{"id":"gerunziu15","p":"p3","t":"הצצה · Gerunziul (‎-ând / -ind)","b":"שיעור 15","l":"15","part":"part-3"},{"id":"perfect17","p":"p3","t":"זמן עבר · Perfectul compus","b":"שיעור 17","l":"17","part":"part-3"},{"id":"participiu17","p":"p3","t":"בניית ה-participiu · לפי קבוצות","b":"שיעור 17","l":"17","part":"part-3"},{"id":"maiprea18","p":"p3","t":"mai, prea, și, tot בתוך העבר · Adverbele de mod","b":"שיעור 18","l":"18","part":"part-3"},{"id":"gender","p":"p4","t":"שם העצם: זכר ונקבה, יחיד ורבים","b":"שיעור 2","l":"2","part":"part-4"},{"id":"neutru","p":"p4","t":"המין השלישי · NEUTRU","b":"שיעור 4","l":"4","part":"part-4"},{"id":"plurals","p":"p4","t":"מערכת הרבים המלאה · שלושת המינים","b":"שיעור 5","l":"5","part":"part-4"},{"id":"artic","p":"p4","t":"ה' הידיעה · הצצה ראשונה","b":"תרגול 2","l":"2","part":"part-4"},{"id":"artichot","p":"p4","t":"ה' הידיעה המלאה · Articolul hotărât","b":"שיעור 10","l":"10","part":"part-4"},{"id":"demonstr14","p":"p4","t":"זה, זאת, אלה · Adjectivul demonstrativ","b":"שיעור 14","l":"14","part":"part-4"},{"id":"adjectiv15","p":"p5","t":"שם התואר · Adjectivele","b":"שיעור 15","l":"15","part":"part-5"},{"id":"alternante16","p":"p5","t":"חילופי הגזע · Alternanțe","b":"שיעור 16","l":"16","part":"part-5"},{"id":"acord15","p":"p5","t":"ההסכמה בפועל · Acordul adjectivului","b":"שיעור 15","l":"15","part":"part-5"},{"id":"partadj17","p":"p5","t":"ה-participiu כשם תואר · Participiul cu valoare adjectivală","b":"שיעור 17","l":"17","part":"part-5"},{"id":"opuse9","p":"p5","t":"תארים והפכים · Contrarii","b":"שיעור 9","l":"9","part":"part-5"},{"id":"calitati16","p":"p5","t":"תכונות אופי · Calități și defecte","b":"שיעור 16","l":"16","part":"part-5"},{"id":"compar15","p":"p5","t":"דרגות ההשוואה · Gradul de comparație","b":"שיעור 15","l":"15","part":"part-5"},{"id":"superlativ18","p":"p5","t":"הסופרלטיב · הכי, ומאוד · Superlativul","b":"שיעור 18","l":"18","part":"part-5"},{"id":"adjref","p":"ref-adj","t":"מאגר התארים לפי משפחה · Adjective","b":"מצטבר","l":"0","part":"part-5"},{"id":"numbers","p":"p6","t":"המספרים 0-19","b":"שיעור 2","l":"2","part":"part-6"},{"id":"numref","p":"ref-num","t":"המספרים · מדריך מלא","b":"מצטבר","l":"0","part":"part-6"},{"id":"quant","p":"p6","t":"כמתים · הרבה, כמה, מעט - לפי מין","b":"שיעור 4","l":"4","part":"part-6"},{"id":"cati6","p":"p6","t":"CÂȚI או CÂTE · ושלילה עם NICI","b":"שיעור 6","l":"6","part":"part-6"},{"id":"nimic","p":"p6","t":"NIMIC / NIMENI · כלום ואף אחד","b":"שיעור 4","l":"4","part":"part-6"},{"id":"cantitate14","p":"p6","t":"‏puțin, mult, tot · כמה ומה שלם","b":"שיעור 14","l":"14","part":"part-6"},{"id":"numai16","p":"p6","t":"רק, כבר לא, אלא · numai · nu mai · decât","b":"שיעור 16","l":"16","part":"part-6"},{"id":"place","p":"p7","t":"מקום וזמן · שאלות עם \"de\"","b":"שיעור 2","l":"2","part":"part-7"},{"id":"questions","p":"p7","t":"מילות שאלה · Cine? Ce? Câți? Câte?","b":"שיעור 2","l":"2","part":"part-7"},{"id":"intr","p":"p7","t":"ÎNTR-UN / DINTR-O · מילות יחס פוגשות un ו-o","b":"שיעור 4","l":"4","part":"part-7"},{"id":"dela","p":"p7","t":"DE או LA · מורה לְ- וסטודנט בְּ-","b":"שיעור 3","l":"3","part":"part-7"},{"id":"directii9","p":"p7","t":"כיוונים והוראות דרך · Unde este?","b":"שיעור 9","l":"9","part":"part-7"},{"id":"data7","p":"p7","t":"התאריך של היום · ומאיפה עד מתי","b":"שיעור 7","l":"7","part":"part-7"},{"id":"preps10","p":"p7","t":"מאיפה ועד לאן · De unde? Până unde?","b":"שיעור 10","l":"10","part":"part-7"},{"id":"urca12","p":"p7","t":"לעלות ולרדת · a urca / a coborî","b":"שיעור 12","l":"12","part":"part-7"},{"id":"astepta17","p":"p7","t":"‏Aștept autobuzul · בלי מילת יחס","b":"שיעור 17","l":"17","part":"part-7"},{"id":"intreb12","p":"p7","t":"סדר המילים בשאלה · Ordinea cuvintelor","b":"שיעור 12","l":"12","part":"part-7"},{"id":"interog14","p":"p7","t":"מילות השאלה · המפה המלאה","b":"ש״ב 14","l":"14T","part":"part-7"},{"id":"preploc14","p":"p7","t":"מילות יחס · מקום וזמן","b":"ש״ב 14","l":"14T","part":"part-7"},{"id":"frecventa13","p":"p7","t":"כמה פעמים? · De câte ori?","b":"שיעור 13","l":"13","part":"part-7"},{"id":"nations","p":"p8","t":"מדינות, לאומים ושפות · Țară, naționalitate, limbă","b":"שיעור 3","l":"3","part":"part-8"},{"id":"tari18","p":"p8","t":"למדינות יש מין · Israelul, România","b":"שיעור 18","l":"18","part":"part-8"},{"id":"age","p":"p8","t":"גיל, קנייה ומכירה","b":"שיעור 3","l":"3","part":"part-8"},{"id":"vreme","p":"p8","t":"מזג האוויר · Cum e vremea?","b":"תרגול 2","l":"2","part":"part-8"},{"id":"relief8","p":"p8","t":"פני השטח וחוף הים · Relieful și litoralul","b":"שיעור 8","l":"8","part":"part-8"},{"id":"calendar","p":"p8","t":"לוח השנה · ימים, חודשים ועונות","b":"תרגול 2","l":"2","part":"part-8"},{"id":"anotimp7","p":"p8","t":"ארבע העונות · Anotimpurile anului","b":"שיעור 7","l":"7","part":"part-8"},{"id":"meteo8","p":"p8","t":"תחזית מזג האוויר · Prognoza meteo","b":"שיעור 8","l":"8","part":"part-8"},{"id":"iarna8","p":"p8","t":"חורף בפועל · ביגוד, בית והרים","b":"שיעור 8","l":"8","part":"part-8"},{"id":"colref","p":"p8","t":"הצבעים · Culorile","b":"מצטבר","l":"0","part":"part-8"},{"id":"culori15","p":"p8","t":"שתי הדרכים להגיד צבע · Ce culoare are?","b":"שיעור 15","l":"15","part":"part-8"},{"id":"aspect15","p":"p8","t":"עיניים, שיער ומראה · Cum arăți?","b":"שיעור 15","l":"15","part":"part-8"},{"id":"descriere16","p":"p8","t":"לתאר אדם · Cine suntem, cum arătăm","b":"שיעור 16","l":"16","part":"part-8"},{"id":"haine16","p":"p8","t":"בגדים ואביזרים · Îmbrăcăminte","b":"שיעור 16","l":"16","part":"part-8"},{"id":"alimente15","p":"p8","t":"צבעי המאכלים · Ce culori au alimentele?","b":"שיעור 15","l":"15","part":"part-8"},{"id":"vocab2","p":"p8","t":"אוצר המילים של היחידה","b":"שיעור 2","l":"2","part":"part-8"},{"id":"vocab4","p":"p8","t":"אוצר המילים של היחידה + מילות זמן","b":"שיעור 4","l":"4","part":"part-8"},{"id":"vocab5","p":"p8","t":"אוצר המילים של היחידה","b":"שיעור 5","l":"5","part":"part-8"},{"id":"formular9","p":"p8","t":"טופס הרשמה · Formular de înscriere","b":"שיעור 9","l":"9","part":"part-8"},{"id":"vocab10","p":"p8","t":"העיר והתחבורה · Orașul și transportul","b":"שיעור 10","l":"10","part":"part-8"},{"id":"vocab11","p":"p8","t":"יום הולדת ומסיבה · Aniversare și petrecere","b":"שיעור 11","l":"11","part":"part-8"},{"id":"ceas12","p":"p8","t":"השעון והשעה · Cât este ceasul?","b":"שיעור 12","l":"12","part":"part-8"},{"id":"vocab12","p":"p8","t":"אוצר מילים וביטויים · Vocabular","b":"שיעור 12","l":"12","part":"part-8"},{"id":"vocab13","p":"p8","t":"אוצר מילים · Vocabular","b":"שיעור 13","l":"13","part":"part-8"},{"id":"dupacursuri14","p":"p8","t":"‏După cursuri · הספרייה והמוזיאון","b":"ש״ב 14","l":"14T","part":"part-8"},{"id":"dialog","p":"p9","t":"הדיאלוג המלא · Cine este ea?","b":"שיעור 2","l":"2","part":"part-9"},{"id":"dialog4","p":"p9","t":"הדיאלוג המלא · Într-o sală de curs","b":"שיעור 4","l":"4","part":"part-9"},{"id":"descriere9","p":"p9","t":"לתאר תמונה · Descrieți imaginea","b":"שיעור 9","l":"9","part":"part-9"},{"id":"opening","p":"exam","t":"שאלות הפתיחה · דיאלוג תחילת שיעור","b":"מצטבר","l":"0","part":"part-9"},{"id":"practice","p":"p9","t":"תרגול · גלגל השאלות","b":"שיעור 3","l":"3","part":"part-9"},{"id":"dialog10","p":"p9","t":"טיול בקונסטנצה · La mall, la film, în oraș","b":"שיעור 10","l":"10","part":"part-9"},{"id":"practice10","p":"p9","t":"חזרה · Recapitulare","b":"תרגול בית","l":"10","part":"part-9"},{"id":"naster11","p":"p9","t":"יום ההולדת שלי · Ziua mea de naștere","b":"שיעור 11","l":"11","part":"part-9"},{"id":"practice11","p":"p9","t":"הפועל בצורה הנכונה · Forma potrivită","b":"תרגול · ספר","l":"11","part":"part-9"},{"id":"felix12","p":"p9","t":"מכתב מסיניה · Un mesaj de la Felix","b":"שיעור 12","l":"12","part":"part-9"},{"id":"practice12","p":"p9","t":"תרגול · תמונות ושאלות כן/לא","b":"שיעור 12","l":"12","part":"part-9"},{"id":"practice13","p":"p9","t":"תרגול · Ce fac ei acum?","b":"שיעור 13","l":"13","part":"part-9"},{"id":"practice14","p":"p9","t":"תרגול · Exerciții","b":"שיעור 14","l":"14","part":"part-9"},{"id":"teme14","p":"p9","t":"שיעורי הבית · Teme după cursuri","b":"ש״ב 14","l":"14T","part":"part-9"},{"id":"zirutina15","p":"p9","t":"יום רגיל · O zi obișnuită","b":"שיעור 15","l":"15","part":"part-9"},{"id":"examen15","p":"exam","t":"בנק שאלות למבחן · Întrebări de examen A1","b":"שיעור 15","l":"15","part":"part-9"},{"id":"practice16","p":"p9","t":"תרגול · Exerciții","b":"שיעור 16","l":"16","part":"part-9"},{"id":"practice17","p":"p9","t":"תרגול שיעור 17 · שיעורי הבית","b":"שיעור 17","l":"17","part":"part-9"},{"id":"practice18","p":"p9","t":"תרגול שיעור 18 · הווה של קבוצה IV","b":"שיעור 18","l":"18","part":"part-9"},{"id":"dict","p":"ref-dict","t":"המילון · Dicționar","b":"מצטבר","l":"0","part":"part-10"},{"id":"chestpersonal","p":"exam","t":"השאלון האישי · Chestionarul personal","b":"שאלון A1","l":"A1Q","part":"part-10"}],"last":18};
(function(){
'use strict';
var D=document, W=window, R=D.documentElement, B=D.body;
var PAGE=B.getAttribute('data-page')||'home', IS_HOME=PAGE==='home';
var LS={get:function(k){try{return localStorage.getItem(k);}catch(e){return null;}},set:function(k,v){try{localStorage.setItem(k,v);}catch(e){}},del:function(k){try{localStorage.removeItem(k);}catch(e){}}};
var reduce=W.matchMedia&&W.matchMedia('(prefers-reduced-motion:reduce)').matches;
var MOBILE=function(){return W.innerWidth<760;};
var PAGES={}, SECS={}, PAGE_SECS=[];
SITE.pages.forEach(function(p){PAGES[p.id]=p;});
SITE.secs.forEach(function(s){SECS[s.id]=s; if(s.p===PAGE)PAGE_SECS.push(s);});
function pageOf(id){ if(SECS[id])return SECS[id].p; if(/^(d|L)-/.test(id))return 'ref-dict'; if(/^v-/.test(id))return 'ref-verbe'; if(/^a-/.test(id))return 'ref-adj'; if(/^ptr-/.test(id)&&SECS[id.slice(4)]){var s=SECS[id.slice(4)];for(var i=0;i<SITE.pages.length;i++){if(SITE.pages[i].k==='topic'&&partPage(s.part)===SITE.pages[i].id)return SITE.pages[i].id;}} return null; }
function partPage(part){ var n=parseInt((part||'').split('-')[1],10); return n?('p'+n):null; }
function url(pid){ return PAGES[pid]?PAGES[pid].u:'/limbaromana.html'; }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

/* ────────────────────────── 1. scroll ────────────────────────── */
var anim=null;
function navh(){ return parseInt(getComputedStyle(R).getPropertyValue('--navh'))||0; }
function offset(){ return navh()+24; }
function scrollY(){ return W.pageYOffset||R.scrollTop||0; }
function targetY(el){
  var y=el.getBoundingClientRect().top+scrollY()-offset();
  var max=Math.max(0,R.scrollHeight-W.innerHeight);
  return Math.min(Math.max(0,y),max);
}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function cancel(){ if(anim){cancelAnimationFrame(anim);anim=null;} }
function scrollTo(el,instant){
  if(!el)return; cancel();
  var from=scrollY(), dest=targetY(el), dist=dest-from;
  if(instant||reduce||Math.abs(dist)<2){W.scrollTo(0,dest);return;}
  var dur=Math.min(650,420+Math.min(230,Math.abs(dist)/12)), t0=null;
  function step(ts){ if(t0===null)t0=ts; var k=Math.min(1,(ts-t0)/dur); W.scrollTo(0,from+dist*ease(k)); anim=k<1?requestAnimationFrame(step):null; }
  anim=requestAnimationFrame(step);
}
['wheel','touchstart','pointerdown'].forEach(function(ev){W.addEventListener(ev,cancel,{passive:true});});
W.LimbaScroll={to:scrollTo,cancel:cancel};

/* עוגן פנימי: אותה עקומה. עוגן לעמוד אחר: הדפדפן. שורה במילון/בפעלים מקבלת הבהוב. */
function flash(el){
  var tr=el.closest&&el.closest('tr'); if(!tr)return;
  tr.classList.add('hit'); setTimeout(function(){tr.classList.remove('hit');},2600);
}
D.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href]'); if(!a)return;
  var href=a.getAttribute('href')||'';
  if(href.charAt(0)!=='#')return;
  var id=decodeURIComponent(href.slice(1)); if(!id)return;
  var el=D.getElementById(id); if(!el)return;
  e.preventDefault();
  openDetails(el);
  scrollTo(el);
  flash(el);
  if(history.replaceState)history.replaceState(null,'','#'+id);
});
function openDetails(el){ var d=el.parentNode; while(d&&d!==B){ if(d.nodeName==='DETAILS'&&!d.open)d.open=true; d=d.parentNode; } }
/* הגעה עם #id מעמוד אחר: הדפדפן כבר קפץ, אבל בלי ה-offset ובלי ההבהוב */
function landOnHash(){
  if(!location.hash)return;
  var id=decodeURIComponent(location.hash.slice(1)), el=D.getElementById(id);
  if(!el){
    /* קישור ישן לעמוד המצטבר (למשל /limbaromana.html#verbref) - מפנים לעמוד הנכון */
    var p=pageOf(id); if(p&&p!==PAGE){ location.replace(url(p)+'#'+id); }
    return;
  }
  openDetails(el);
  setTimeout(function(){ scrollTo(el,true); flash(el); },0);
  setTimeout(function(){ scrollTo(el,true); },350);   /* אחרי שהפונטים והטבלאות התיישבו */
}

/* ────────────────────────── 2. spy ────────────────────────── */
var spyItems=[], spyCur=-1, spyListeners=[];
function collectSpy(){
  spyItems=[];
  var secs=D.querySelectorAll('main section[id]');
  for(var i=0;i<secs.length;i++){
    var el=secs[i]; if(el.id==='legend')continue;
    var h=el.querySelector('h2.sec'); if(!h)continue;
    var c=h.cloneNode(true); [].forEach.call(c.querySelectorAll('.num,button'),function(n){n.parentNode.removeChild(n);});
    spyItems.push({id:el.id,el:el,title:c.textContent.replace(/\s+/g,' ').trim()});
  }
  /* עמוד רפרנס עם סעיף אחד או שניים: ה-h3 (קבוצות הפעלים, משפחות התארים) הם היעדים האמיתיים */
  if(spyItems.length&&spyItems.length<=2){
    var out=[];
    spyItems.forEach(function(it){
      out.push(it);
      var hs=it.el.querySelectorAll('h3'), k=0;
      for(var i=0;i<hs.length;i++){
        var h3=hs[i]; if(h3.closest('details,table,.card,.note,.rule'))continue;
        if(!h3.id)h3.id=it.id+'-h'+(++k);
        var t=h3.textContent.replace(/\s+/g,' ').trim(); if(!t||t.length>70)continue;
        out.push({id:h3.id,el:h3,title:t,sub:true,parent:it.id});
      }
    });
    if(out.length>spyItems.length)spyItems=out;
  }
}
function spyPaint(i){
  if(i===spyCur)return; spyCur=i;
  spyListeners.forEach(function(f){try{f(i);}catch(e){}});
}
var spyTick=false;
function spy(){
  if(spyTick||!spyItems.length)return; spyTick=true;
  requestAnimationFrame(function(){
    spyTick=false;
    var line=navh()+96, i=-1;
    for(var k=0;k<spyItems.length;k++){ if(spyItems[k].el.getBoundingClientRect().top<=line)i=k; else break; }
    if(i<0&&scrollY()>200)i=0;
    spyPaint(i);
  });
}
W.LimbaNav={
  current:function(){return spyCur;}, count:function(){return spyItems.length;},
  at:function(i){return spyItems[i];}, go:function(i){ if(spyItems[i]){scrollTo(spyItems[i].el); if(history.replaceState)history.replaceState(null,'','#'+spyItems[i].id);} }
};
/* "המשך מאיפה שהפסקת" - נשמר בכל עמוד תוכן, נקרא בבית */
var resumeT=null;
function saveResume(i){
  if(IS_HOME||i<0||!spyItems[i])return;
  clearTimeout(resumeT);
  resumeT=setTimeout(function(){
    var it=spyItems[i], pg=PAGES[PAGE]||{};
    LS.set('limba_resume',JSON.stringify({u:url(PAGE)+'#'+it.id,t:it.title.split(' · ')[0],p:(pg.n?pg.n+' · ':'')+(pg.t||''),ts:Date.now()}));
  },600);
}
spyListeners.push(saveResume);

/* פירור בבר העליון */
var crumb=D.getElementById('tbcrumb');
if(crumb){
  var pg=PAGES[PAGE];
  crumb.innerHTML='<span class="p"></span><span class="s"></span>';
  var cp=crumb.querySelector('.p'), cs=crumb.querySelector('.s');
  function paintCrumb(i){
    if(IS_HOME){cp.textContent='המדריך המצטבר';cs.textContent='מפת הקורס';return;}
    cp.textContent=pg?((pg.n?pg.n+' · ':'')+pg.t):'';
    var it=(i>=0)?spyItems[i]:null;
    cs.textContent=it?(it.sub&&spyItems.length>3?it.title:it.title):'';
    if(pg&&pg.k==='ref'&&it&&!it.sub){cs.textContent=it.title===pg.t?'':it.title;}
  }
  spyListeners.push(paintCrumb);
  crumb.addEventListener('click',function(){openSheet('map');});
  crumb.style.cursor='pointer';
}
/* "בעמוד הזה" + המסילה */
function markCur(container,i){
  if(!container)return;
  var as=container.querySelectorAll('a[href^="#"]'), id=(i>=0&&spyItems[i])?spyItems[i].id:null;
  for(var k=0;k<as.length;k++){ as[k].classList.toggle('cur',id!==null&&as[k].getAttribute('href')==='#'+id); }
  if(id!==null&&container.classList.contains('rail')){ var c=container.querySelector('a.cur'); if(c&&c.scrollIntoView){ var r=c.getBoundingClientRect(), cr=container.getBoundingClientRect(); if(r.top<cr.top||r.bottom>cr.bottom)c.scrollIntoView({block:'nearest'}); } }
}
var ptoc=D.querySelector('.ptoc');
if(ptoc)spyListeners.push(function(i){markCur(ptoc,i);});
function buildRail(){
  if(IS_HOME||!spyItems.length)return;
  var main=D.getElementById('main'); if(!main)return;
  var rail=D.createElement('aside'); rail.className='rail'; rail.setAttribute('aria-label','בעמוד הזה');
  var pg=PAGES[PAGE]||{};
  var html='<div class="r-ttl">בעמוד הזה</div>';
  spyItems.forEach(function(it){
    var s=SECS[it.id]||SECS[it.id.replace(/^ptr-/,'')]||{};
    html+='<a href="#'+it.id+'"'+(it.sub?' class="sub"':'')+'>'+esc(it.sub?it.title:it.title.split(' · ')[0])+(s.b&&!it.sub?'<small>'+esc(s.b)+'</small>':'')+'</a>';
  });
  var keys=SITE.pages.map(function(p){return p.id;}), i=keys.indexOf(PAGE);
  html+='<div class="r-pager">';
  if(i>0)html+='<a href="'+url(keys[i-1])+'">‹ '+esc(PAGES[keys[i-1]].t)+'</a>';
  if(i<keys.length-1&&i>=0)html+='<a href="'+url(keys[i+1])+'">'+esc(PAGES[keys[i+1]].t)+' ›</a>';
  html+='<a href="/limbaromana.html">מפת הקורס</a></div>';
  rail.innerHTML=html;
  main.appendChild(rail);
  spyListeners.push(function(i){markCur(rail,i);});
}

/* ────────────────────────── 3. sheet ────────────────────────── */
var sheet=D.getElementById('sheet'), sheetBody=D.getElementById('sheet-body'), sheetTab=null, lastFocus=null;
var tabbar=D.getElementById('tabbar'), tbMap=D.getElementById('tb-map');
function openSheet(tab){
  if(!sheet)return;
  lastFocus=D.activeElement;
  sheet.hidden=false; R.classList.add('sheet-open');
  setTab(tab||'map');
}
function closeSheet(){
  if(!sheet||sheet.hidden)return;
  var ae=D.activeElement; if(ae&&sheet.contains(ae)&&ae.blur)ae.blur();
  sheet.hidden=true; R.classList.remove('sheet-open'); sheetTab=null;
  if(tabbar)[].forEach.call(tabbar.querySelectorAll('button'),function(b){b.classList.remove('on');});
  if(tbMap)tbMap.setAttribute('aria-expanded','false');
  if(lastFocus&&lastFocus.focus)try{lastFocus.focus();}catch(e){}
}
function setTab(tab){
  if(tab===sheetTab)return; sheetTab=tab;
  [].forEach.call(sheet.querySelectorAll('.sheet-tabs button'),function(b){b.classList.toggle('on',b.getAttribute('data-tab')===tab);});
  if(tabbar)[].forEach.call(tabbar.querySelectorAll('button[data-sheet]'),function(b){b.classList.toggle('on',b.getAttribute('data-sheet')===tab);});
  sheetBody.scrollTop=0;
  if(tbMap)tbMap.setAttribute('aria-expanded',tab==='map'?'true':'false');
  if(tab==='map')renderMap(); else if(tab==='search')renderSearch(); else renderRef();
}
if(sheet){
  sheet.querySelector('.sheet-bg').addEventListener('click',closeSheet);
  sheet.querySelector('.sheet-x').addEventListener('click',closeSheet);
  sheet.querySelector('.sheet-tabs').addEventListener('click',function(e){var b=e.target.closest('button[data-tab]'); if(b)setTab(b.getAttribute('data-tab'));});
  sheetBody.addEventListener('click',function(e){
    var a=e.target.closest('a[href]'); if(!a)return;
    var href=a.getAttribute('href')||'';
    if(href.charAt(0)==='#'){ closeSheet(); }           /* עוגן פנימי: הסקריפט הכללי יגלול */
    else { closeSheet(); }                                /* עמוד אחר: הדפדפן */
  });
}
D.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-sheet]'); if(!b)return;
  var t=b.getAttribute('data-sheet');
  if(!sheet.hidden&&sheetTab===t&&b.closest('.tabbar')){closeSheet();return;}
  openSheet(t);
});
var tbs=D.getElementById('tb-search'); if(tbs)tbs.addEventListener('click',function(){openSheet('search');});
if(tbMap)tbMap.addEventListener('click',function(){ if(!sheet.hidden&&sheetTab==='map')closeSheet(); else openSheet('map'); });

function curId(){ return (spyCur>=0&&spyItems[spyCur])?spyItems[spyCur].id:null; }
function renderMap(){
  var html='', cid=curId();
  if(!IS_HOME&&spyItems.length){
    var pg=PAGES[PAGE]||{};
    html+='<div class="sh-ttl">בעמוד הזה · '+esc((pg.n?pg.n+' · ':'')+(pg.t||''))+'</div><div class="sh-list">';
    spyItems.forEach(function(it){ var s=SECS[it.id]||{}; html+='<a href="#'+it.id+'" class="'+(it.sub?'sub ':'')+(it.id===cid?'cur':'')+'">'+esc(it.sub?it.title:it.title.split(' · ')[0])+(s.b&&!it.sub?'<span class="toc-ls">'+esc(s.b)+'</span>':'')+'</a>'; });
    html+='</div>';
  }
  html+='<div class="sh-ttl">מפת הקורס</div><div class="sh-home"><a href="/limbaromana.html">עמוד הבית</a><a class="alt" href="/limbaromana.html?view=lesson#map">לפי שיעור</a></div>';
  SITE.pages.forEach(function(p){
    if(p.k!=='topic')return;
    var mine=SITE.secs.filter(function(s){return partPage(s.part)===p.id;});
    var isCur=(p.id===PAGE);
    html+='<details class="toc-group'+(isCur?' cur':'')+'"'+(isCur?' open':'')+'><summary class="unit"><span class="pnum">'+esc(p.n)+'</span>'+esc(p.t)+'</summary><div class="toc-items">';
    mine.forEach(function(s){ var same=(s.p===PAGE); html+='<a href="'+(same?'':url(s.p))+'#'+s.id+'"'+(same&&s.id===cid?' class="cur"':'')+'>'+esc(s.t.split(' · ')[0])+(s.b?' <span class="toc-ls">· '+esc(s.b)+'</span>':'')+'</a>'; });
    html+='</div></details>';
  });
  var refs=SITE.pages.filter(function(p){return p.k==='ref';});
  html+='<details class="toc-group'+(PAGES[PAGE]&&PAGES[PAGE].k==='ref'?' cur open':'')+'"><summary class="unit"><span class="pnum">רפרנס</span>מילון · פעלים · תארים · מספרים · מבחן</summary><div class="toc-items">';
  refs.forEach(function(p){ html+='<a href="'+p.u+'"'+(p.id===PAGE?' class="cur"':'')+'>'+esc(p.t)+'</a>'; });
  html+='<a href="/limbaromana-tutor.html">רשימת התרגולים הקוליים · ל-ChatGPT</a></div></details>';
  sheetBody.innerHTML=html;
  var c=sheetBody.querySelector('a.cur'); if(c)setTimeout(function(){try{c.scrollIntoView({block:'center'});}catch(e){}},30);
}
function renderRef(){
  var T=[
    ['/limbaromana-ref-dict.html','המילון','Dicționar'],
    ['/limbaromana-ref-verbe.html','הפעלים','Conjugările'],
    ['/limbaromana-ref-adj.html','התארים','Adjective'],
    ['/limbaromana-ref-num.html','המספרים','Numerele'],
    [url('p8')+'#colref','הצבעים','Culorile'],
    ['/limbaromana-exam.html#opening','שאלות הפתיחה','Deschiderea'],
    ['/limbaromana-exam.html#examen15','בנק שאלות A1','Examen'],
    ['/limbaromana-exam.html#chestpersonal','השאלון האישי','Chestionar'],
    ['/limbaromana-tutor.html','התרגולים הקוליים','ChatGPT'],
    ['/limbaromana.html#legend','המקרא','Legendă']
  ];
  var html='<div class="sh-ttl">רפרנס</div><div class="sh-tiles">';
  T.forEach(function(t){ var cur=t[0].indexOf(location.pathname)===0&&t[0].indexOf('#')<0; html+='<a href="'+t[0]+'"'+(cur?' class="cur"':'')+'><b>'+t[1]+'</b><small>'+t[2]+'</small></a>'; });
  html+='</div>';
  sheetBody.innerHTML=html;
}

/* ────────────────────────── 4. search ────────────────────────── */
var FOLD={'ă':'a','â':'a','î':'i','ș':'s','ş':'s','ț':'t','ţ':'t'};
function fold(s){ s=s.toLowerCase(); var o='',i,c; for(i=0;i<s.length;i++){c=s.charAt(i);o+=(FOLD[c]||c);} return o; }
var index=null, indexP=null, sInput=null, sTimer=null, lastQ='';
function loadIndex(){
  if(index)return Promise.resolve(index);
  if(indexP)return indexP;
  indexP=fetch('/limbaromana-index.json').then(function(r){return r.json();}).then(function(j){
    index=(j.items||[]).map(function(it){ it.fw=fold(it.w||''); it.fh=fold(it.h||''); return it; }); return index;
  }).catch(function(){indexP=null; return [];});
  return indexP;
}
function renderSearch(){
  sheetBody.innerHTML='<div class="sh-input"><svg><use href="#i-search"/></svg><input type="search" id="sq" placeholder="מילה ברומנית או בעברית…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="חיפוש"><button type="button" class="clr" aria-label="נקה">✕</button></div><div id="sres"><p class="sh-hint">מחפש בכל העמודים: נושאים, המילון, הפעלים והתארים. ‏s מוצא גם ș, ‏a גם ă/â. בנוסף: ספירת המופעים בעמוד הזה.</p></div>';
  sInput=D.getElementById('sq');
  if(lastQ){sInput.value=lastQ; runSearch(lastQ);}
  setTimeout(function(){try{sInput.focus();}catch(e){}},MOBILE()?120:30);
  sInput.addEventListener('input',function(){ clearTimeout(sTimer); var v=sInput.value; sTimer=setTimeout(function(){runSearch(v);},MOBILE()?260:160); });
  sInput.addEventListener('keydown',function(e){
    if(e.key==='Enter'){ e.preventDefault(); var first=D.querySelector('#sres a.res'); if(first)first.click(); else if(find.count())showFindbar(); }
    if(e.key==='Escape'){ e.preventDefault(); closeSheet(); }
  });
  sheetBody.querySelector('.clr').addEventListener('click',function(){ sInput.value=''; lastQ=''; find.clear(); runSearch(''); sInput.focus(); });
  loadIndex();
}
var GROUPS=[['sec','נושאים'],['dict','מילון'],['verb','פעלים'],['adj','תארים']];
function runSearch(q){
  lastQ=q; q=(q||'').trim(); var res=D.getElementById('sres'); if(!res)return;
  if(q.length<2){ res.innerHTML='<p class="sh-hint">'+(q?'עוד תו אחד…':'מחפש בכל העמודים: נושאים, המילון, הפעלים והתארים. ‏s מוצא גם ș, ‏a גם ă/â. בנוסף: ספירת המופעים בעמוד הזה.')+'</p>'; find.clear(); return; }
  var n=IS_HOME?0:find.run(q);
  var html='';
  if(!IS_HOME){ html+='<div class="sh-inpage">בעמוד הזה: <b>'+(n?(n+(n>=find.LIMIT?'+':'')):'0')+'</b> מופעים<button type="button" id="sh-show"'+(n?'':' disabled')+'>הצג בעמוד</button></div>'; }
  res.innerHTML=html+'<p class="sh-hint">טוען אינדקס…</p>';
  var shb=D.getElementById('sh-show'); if(shb)shb.addEventListener('click',function(){ closeSheet(); showFindbar(); find.focus(0); });
  loadIndex().then(function(ix){
    if(lastQ.trim()!==q)return;
    var fq=fold(q), hits={};
    GROUPS.forEach(function(g){hits[g[0]]=[];});
    for(var i=0;i<ix.length;i++){
      var it=ix[i], a=it.fw.indexOf(fq), b=it.fh.indexOf(fq);
      if(a<0&&b<0)continue;
      var score=(a===0?0:(a>0&&/[\s(,\/]/.test(it.fw.charAt(a-1))?1:(a>0?3:(b===0?2:4))));
      if(hits[it.k])hits[it.k].push({it:it,s:score});
    }
    var out='', total=0;
    GROUPS.forEach(function(g){
      var arr=hits[g[0]]; if(!arr.length)return;
      arr.sort(function(x,y){return x.s-y.s||x.it.w.length-y.it.w.length;});
      total+=arr.length;
      out+='<div class="sh-ttl">'+g[1]+' · '+arr.length+'</div><div class="sh-list" data-g="'+g[0]+'">';
      arr.slice(0,40).forEach(function(h,idx){
        var it=h.it, same=it.u.indexOf(location.pathname+'#')===0, href=same?it.u.slice(it.u.indexOf('#')):it.u;
        var pgName=''; var m=/limbaromana-?([a-z0-9-]*)\.html/.exec(it.u); if(m){var p=PAGES[m[1]||'home']; pgName=p?(p.k==='topic'?p.n:p.s):'';}
        out+='<a class="res '+g[0]+(idx>=8?' more':'')+'" href="'+href+'"'+(idx>=8?' hidden':'')+'>'+(g[0]==='sec'?'<span>'+esc(it.w)+'</span><span class="he">'+esc(it.h)+'</span>':'<span class="ro">'+esc(it.w)+'</span><span class="he">'+esc(it.h)+'</span>')+(pgName?'<span class="k">'+esc(pgName)+'</span>':'')+'</a>';
      });
      out+='</div>';
      if(arr.length>8)out+='<button type="button" class="sh-more" data-g="'+g[0]+'">עוד '+(Math.min(arr.length,40)-8)+'</button>';
    });
    if(!total)out='<p class="sh-hint">אין תוצאות באינדקס ל-"'+esc(q)+'"</p>';
    res.innerHTML=html+out;
    var shb2=D.getElementById('sh-show'); if(shb2)shb2.addEventListener('click',function(){ closeSheet(); showFindbar(); find.focus(0); });
    [].forEach.call(res.querySelectorAll('.sh-more'),function(b){ b.addEventListener('click',function(){ var g=b.getAttribute('data-g'); [].forEach.call(res.querySelectorAll('.sh-list[data-g="'+g+'"] a.more'),function(a){a.hidden=false;}); b.remove(); }); });
  });
}
/* Find בעמוד - הפורט של pagesearch, בלי ה-UI הישן. תקרה נמוכה בנייד. */
var find=(function(){
  var marks=[],cur=-1;
  var LIMIT=MOBILE()?120:400;
  var SKIP={SCRIPT:1,STYLE:1,NOSCRIPT:1,BUTTON:1,MARK:1,INPUT:1,TEXTAREA:1,SELECT:1,svg:1,SVG:1};
  function blocked(el){
    while(el&&el!==B){
      if(SKIP[el.nodeName])return true;
      if(el.nodeType===1){ if(el.hidden)return true; var c=el.className||''; if(el.id==='sheet'||el.id==='findbar'||el.id==='tb'||el.id==='tabbar'||/(^|\s)(rail|ptoc|pager)(\s|$)/.test(c))return true; }
      el=el.parentNode;
    }
    return false;
  }
  function clear(){
    if(!marks.length){cur=-1;return;}
    var parents=[],seen=new Set(),i,m,p;
    for(i=0;i<marks.length;i++){ m=marks[i];p=m.parentNode;if(!p)continue; p.replaceChild(D.createTextNode(m.textContent),m); if(!seen.has(p)){seen.add(p);parents.push(p);} }
    for(i=0;i<parents.length;i++)parents[i].normalize();
    marks=[];cur=-1; paintBar();
  }
  function collect(needle){
    var main=D.getElementById('main'); if(!main)return [];
    var w=D.createTreeWalker(main,NodeFilter.SHOW_TEXT,null),out=[],n;
    while((n=w.nextNode())){ if(!n.nodeValue)continue; if(fold(n.nodeValue).indexOf(needle)<0)continue; if(blocked(n.parentNode))continue; out.push(n); }
    return out;
  }
  var lastQ='';
  function run(q){
    q=(q||'').trim();
    if(q===lastQ&&marks.length)return marks.length;
    clear(); lastQ=q;
    if(q.length<2)return 0;
    try{
      var needle=fold(q), nodes=collect(needle), all=[];
      for(var j=0;j<nodes.length&&all.length<LIMIT;j++){
        var node=nodes[j], f=fold(node.nodeValue), pos=[], i=0;
        while((i=f.indexOf(needle,i))!==-1){pos.push(i);i+=needle.length;}
        var local=[];
        for(var k=pos.length-1;k>=0;k--){ var tail=node.splitText(pos[k]); tail.splitText(needle.length); var m=D.createElement('mark'); m.className='lsr'; tail.parentNode.replaceChild(m,tail); m.appendChild(tail); local.unshift(m); }
        all=all.concat(local);
      }
      marks=all;
    }catch(err){ try{clear();}catch(e2){} }
    paintBar();
    return marks.length;
  }
  function focus(i){
    if(!marks.length)return;
    cur=(i%marks.length+marks.length)%marks.length;
    for(var k=0;k<marks.length;k++)marks[k].classList.remove('cur');
    var m=marks[cur]; m.classList.add('cur'); openDetails(m);
    R.classList.add('nosnap'); clearTimeout(focus._t); focus._t=setTimeout(function(){R.classList.remove('nosnap');},900);
    cancel();
    var y=m.getBoundingClientRect().top+scrollY()-Math.max(120,W.innerHeight*0.3);
    W.scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'});
    paintBar();
  }
  function paintBar(){
    var fb=D.getElementById('findbar'); if(!fb||fb.hidden)return;
    D.getElementById('fb-q').textContent=lastQ;
    D.getElementById('fb-n').textContent=marks.length?((cur+1)+' / '+marks.length+(marks.length>=LIMIT?'+':'')):'0';
    D.getElementById('fb-prev').disabled=D.getElementById('fb-next').disabled=!marks.length;
  }
  return {run:run,clear:clear,focus:focus,next:function(){focus(cur+1);},prev:function(){focus(cur-1);},count:function(){return marks.length;},paint:paintBar,LIMIT:LIMIT,q:function(){return lastQ;}};
})();
var findbar=D.getElementById('findbar');
function showFindbar(){ if(!findbar)return; findbar.hidden=false; find.paint(); }
function hideFindbar(){ if(!findbar)return; findbar.hidden=true; find.clear(); lastQ=''; }
if(findbar){
  D.getElementById('fb-prev').addEventListener('click',find.prev);
  D.getElementById('fb-next').addEventListener('click',find.next);
  D.getElementById('fb-x').addEventListener('click',hideFindbar);
  findbar.addEventListener('click',function(e){ if(e.target.id==='fb-q'||e.target===findbar){openSheet('search');} });
}

/* מקלדת */
function editable(el){ if(!el)return false; var t=(el.tagName||'').toLowerCase(); return t==='input'||t==='textarea'||t==='select'||el.isContentEditable||t==='summary'; }
D.addEventListener('keydown',function(e){
  var typing=editable(D.activeElement);
  if((e.key==='k'||e.key==='K')&&(e.metaKey||e.ctrlKey)){e.preventDefault();openSheet('search');return;}
  if(e.key==='/'&&!typing&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();openSheet('search');return;}
  if(e.key==='Escape'){ if(sheet&&!sheet.hidden){closeSheet();return;} if(findbar&&!findbar.hidden){hideFindbar();return;} }
  if(e.key==='Enter'&&findbar&&!findbar.hidden&&!typing&&find.count()){ e.preventDefault(); if(e.shiftKey)find.prev(); else find.next(); return; }
  if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||typing)return;
  if(sheet&&!sheet.hidden)return;
  if(e.key==='Home'||e.key==='End'){ e.preventDefault(); cancel(); W.scrollTo({top:e.key==='Home'?0:R.scrollHeight,behavior:reduce?'auto':'smooth'}); return; }
  if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
  var n=spyItems.length; if(!n)return;
  var i=spyCur; if(i<0)i=e.key==='ArrowDown'?-1:0;
  var j=i+(e.key==='ArrowDown'?1:-1); if(j<0||j>=n)return;
  e.preventDefault(); W.LimbaNav.go(j);
});

/* ────────────────────────── 5. audio ────────────────────────── */
var BASE='/limbaromana-audio/', store=new Map(), storeOrder=[], curA=null, curEl=null;
function audioOn(){ return !R.classList.contains('noaudio'); }
function setAudio(on){
  R.classList.toggle('noaudio',!on); LS.set('limba_audio',on?'on':'off');
  [].forEach.call(D.querySelectorAll('#tb-audio,[data-act="audio"]'),function(b){b.setAttribute('aria-pressed',on?'true':'false');});
  if(!on&&curA){try{curA.pause();}catch(e){} if(curEl)curEl.classList.remove('playing');}
}
setAudio(audioOn());
D.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('#tb-audio,[data-act="audio"]'); if(!b)return; setAudio(!audioOn()); });
function remember(h,o){ store.set(h,o); storeOrder.push(h); if(storeOrder.length>150){ var old=storeOrder.shift(); var u=store.get(old); store.delete(old); try{URL.revokeObjectURL(u);}catch(e){} } }
function play(el,h){
  if(curA){ try{curA.pause();}catch(e){} if(curEl)curEl.classList.remove('playing'); }
  curEl=el; el.classList.add('playing'); el.classList.remove('err');
  function start(src){
    curA=new Audio(src);
    curA.onended=function(){el.classList.remove('playing');};
    curA.onerror=function(){el.classList.remove('playing');el.classList.add('err');};
    curA.play().catch(function(){el.classList.remove('playing');});
  }
  var u=store.get(h); if(u){start(u);return;}
  fetch(BASE+h+'.mp3').then(function(r){if(!r.ok)throw 0;return r.blob();})
    .then(function(bl){var o=URL.createObjectURL(bl);remember(h,o);start(o);})
    .catch(function(){start(BASE+h+'.mp3');});
}
D.addEventListener('click',function(e){
  if(!audioOn())return;
  var el=e.target.closest&&e.target.closest('[data-h]'); if(!el)return;
  if(el.closest('a[href]'))return;                          /* קישור מנצח */
  var sel=W.getSelection&&W.getSelection(); if(sel&&String(sel).length>1&&!sel.isCollapsed)return;   /* המשתמש מסמן טקסט */
  play(el,el.getAttribute('data-h'));
});
/* חימום: הקליפים של העמוד הזה נכנסים למטמון ה-SW ברקע, בזרם דק. */
function warm(){
  var c=navigator.connection||{};
  if(c.saveData||/(^|-)2g$/.test(c.effectiveType||''))return;
  if(!('serviceWorker' in navigator))return;
  var seen={},q=[];
  [].forEach.call(D.querySelectorAll('[data-h]'),function(el){var h=el.getAttribute('data-h'); if(!seen[h]){seen[h]=1;q.push(h);}});
  if(!q.length)return;
  var k=0,CONC=MOBILE()?2:3,btn=D.getElementById('tb-audio');
  function next(){
    if(k>=q.length){ if(btn)btn.title='שמע: כל '+q.length+' הקליפים של העמוד שמורים במכשיר'; return; }
    if(D.hidden){ setTimeout(next,1500); return; }
    var h=q[k++];
    fetch(BASE+h+'.mp3').then(function(x){return x.arrayBuffer();}).then(next,next);
  }
  function go(){ for(var t=0;t<CONC;t++)next(); }
  if(navigator.serviceWorker.controller)go(); else navigator.serviceWorker.ready.then(go,function(){});
}
/* הורדת הכול (בבית) */
function dlall(){
  var btn=D.getElementById('dlall'); if(!btn)return;
  if(!('serviceWorker' in navigator)||!('caches' in W))return;
  var DONE_KEY='limba_audio_cached_v1', total=0, list=null;
  btn.hidden=false;
  function label(t){btn.textContent=t;}
  function markDone(){btn.classList.add('done');btn.disabled=true;label('✓ כל השמע שמור במכשיר ('+total+')');}
  function idle(){btn.classList.remove('done');btn.disabled=false;label('⬇ הורד את כל השמע למכשיר'+(total?' ('+total+' קבצים)':''));}
  fetch(BASE+'manifest.json').then(function(r){return r.json();}).then(function(m){
    list=m.items.map(function(i){return i.h;}); total=list.length;
    if(LS.get(DONE_KEY)==String(total))markDone(); else idle();
  }).catch(idle);
  idle();
  btn.addEventListener('click',function(){
    if(btn.disabled||!list)return; btn.disabled=true;
    var done=0,fail=0,idx=0,active=0,CONC=MOBILE()?4:6;
    label('מוריד… 0 / '+total);
    function finish(){ if(fail){btn.disabled=false;btn.classList.add('warn');label('הורדו '+(total-fail)+' מתוך '+total+' · לנסות שוב');} else {LS.set(DONE_KEY,String(total));markDone();} }
    function pump(){
      while(active<CONC&&idx<total){
        (function(h){ active++;
          fetch(BASE+h+'.mp3',{cache:'force-cache'}).then(function(r){if(!r.ok)throw 0;return r.blob();}).catch(function(){fail++;})
            .finally(function(){active--;done++;if(done%5===0||done===total)label('מוריד… '+done+' / '+total); if(done>=total)finish(); else pump();});
        })(list[idx++]);
      }
    }
    pump();
  });
}

/* ────────────────────────── 6. הבית ────────────────────────── */
function homeInit(){
  /* המשך מאיפה שהפסקת */
  try{
    var r=JSON.parse(LS.get('limba_resume')||'null');
    if(r&&r.u&&Date.now()-(r.ts||0)<45*864e5){
      var box=D.getElementById('resume'); D.getElementById('resume-link').href=r.u; D.getElementById('resume-title').textContent=(r.p?r.p+' · ':'')+r.t; box.hidden=false;
    }
  }catch(e){}
  /* טוגל נושא/שיעור */
  var btns=[].slice.call(D.querySelectorAll('.tsw')), views={lesson:D.getElementById('toc-lesson'),topic:D.getElementById('toc-topic')};
  function show(v,persist){
    btns.forEach(function(b){b.classList.toggle('active',b.getAttribute('data-view')===v);});
    if(views.lesson)views.lesson.hidden=(v!=='lesson'); if(views.topic)views.topic.hidden=(v!=='topic');
    if(persist!==false)LS.set('limba_toc2',v);
  }
  btns.forEach(function(b){b.addEventListener('click',function(){show(b.getAttribute('data-view'));});});
  var start='topic';
  try{ var q=new URLSearchParams(location.search).get('view'); if(q==='lesson'||q==='topic')start=q; else { var st=LS.get('limba_toc2'); if(st==='lesson'||st==='topic')start=st; } }catch(e){}
  show(start,false);
  /* במסך גדול המפה פתוחה; בנייד סגורה חוץ מהחלק שבו היית לאחרונה */
  var open=!MOBILE(); var lastPart=null; try{ var rr=JSON.parse(LS.get('limba_resume')||'null'); if(rr&&rr.u){ var mm=/limbaromana-(p\d+)\.html/.exec(rr.u); if(mm)lastPart='part-'+mm[1].slice(1); } }catch(e){}
  [].forEach.call(D.querySelectorAll('#toc-topic details.toc-group'),function(d){ d.open=open||(d.id===lastPart); });
  dlall();
}

/* ────────────────────────── 7. מהעמוד הישן: אחידות שבירה בטבלאות ────────────────────────── */
(function(){
  var main=D.querySelector('main'); if(!main)return;
  function doGrids(){ [].forEach.call(D.querySelectorAll('.numgrid'),function(g){ g.classList.remove('stack'); var cells=g.children,need=false; for(var i=0;i<cells.length;i++){ if(cells[i].scrollWidth>cells[i].clientWidth+1){need=true;break;} } if(need)g.classList.add('stack'); }); }
  function txt(c){return (c.textContent||'').replace(/\s+/g,' ').trim();}
  function dense(t){ if(t.classList.contains('vt'))return true; var rows=t.rows,max=0,n=0; for(var r=0;r<rows.length;r++){ var cs=rows[r].cells; for(var i=0;i<cs.length;i++){n++;if(i>0){var L=txt(cs[i]).length;if(L>max)max=L;}} } return n>5&&max<=24; }
  function tooWide(t){ var host=t.parentNode, lim=(host&&host.clientWidth)||main.clientWidth; return t.getBoundingClientRect().width>lim+1||t.scrollWidth>lim+1; }
  function doTables(){
    [].forEach.call(main.querySelectorAll('table'),function(t){
      t.classList.remove('uni','stack-spk','tight','hscroll');
      if(!dense(t))return;
      t.classList.add('uni');
      /* הרמקול הוא ::after על המילה עצמה - הוא לא יכול לרדת שורה בלעדיה, ולכן ה-stack-spk הישן מיותר */
      if(!tooWide(t))return;
      if(W.innerWidth<=640)return;
      if(tooWide(t))t.classList.add('tight');
      if(tooWide(t))t.classList.add('hscroll');
    });
  }
  var pending=null,lastW=W.innerWidth;
  function run(){doGrids();doTables();}
  function schedule(){ if(W.innerWidth===lastW)return; lastW=W.innerWidth; if(pending)clearTimeout(pending); pending=setTimeout(function(){pending=null;run();},220); }
  run();
  if(D.fonts&&D.fonts.ready)D.fonts.ready.then(run).catch(function(){});
  W.addEventListener('load',run);
  W.addEventListener('resize',schedule,{passive:true});
  W.LimbaUniform={run:run};
})();

/* ────────────────────────── 8. מהעמוד הישן: כותרת דביקה לטבלאות ההטיה בנייד ────────────────────────── */
(function(){
try{
  var MQ=W.matchMedia('(max-width:640px)');
  function label(tb){ var n=tb.previousElementSibling,h=null; while(n){ if(/^H[2-4]$/.test(n.tagName)){h=n;break;} n=n.previousElementSibling; } if(!h){ var sec=tb.closest('section'); h=sec?sec.querySelector('h2.sec'):null; } if(!h)return ''; var c=h.cloneNode(true),b=c.querySelector('button'); if(b)b.parentNode.removeChild(b); return c.textContent.replace(/\s+/g,' ').trim(); }
  function build(){
    var tabs=D.querySelectorAll('table.vt:not(.hashd)');
    for(var t=0;t<tabs.length;t++){(function(tb){
      var hr=tb.rows[0]; if(!hr||!hr.cells.length)return;
      var sub=label(tb);
      var box=D.createElement('div'); box.className='vtbox'; tb.parentNode.insertBefore(box,tb); box.appendChild(tb);
      var hd=D.createElement('div'); hd.className='vthd'; hd.setAttribute('aria-hidden','true');
      var vp=D.createElement('div'); vp.className='vthd-vp'; var row=D.createElement('div'); row.className='vthd-row';
      for(var i=0;i<hr.cells.length;i++){ var c=D.createElement('div'); c.className='vthd-c'; c.innerHTML=hr.cells[i].innerHTML; row.appendChild(c); }
      vp.appendChild(row); hd.appendChild(vp);
      if(sub){ var sd=D.createElement('div'); sd.className='vthd-sub'; sd.textContent=sub; hd.appendChild(sd); }
      box.insertBefore(hd,tb); tb.classList.add('hashd'); tb._vthdRow=row; tb._vthdHead=hr;
      tb.addEventListener('scroll',function(){row.style.transform='translateX('+(-tb.scrollLeft)+'px)';},{passive:true});
    })(tabs[t]);}
  }
  function measure(){
    var tabs=D.querySelectorAll('table.vt.hashd');
    for(var t=0;t<tabs.length;t++){ var tb=tabs[t],row=tb._vthdRow,hr=tb._vthdHead; if(!row||!hr)continue; for(var i=0;i<hr.cells.length&&i<row.children.length;i++){ row.children[i].style.width=hr.cells[i].getBoundingClientRect().width+'px'; } row.style.transform='translateX('+(-tb.scrollLeft)+'px)'; }
  }
  var raf=null;
  function sync(){ if(raf)cancelAnimationFrame(raf); raf=requestAnimationFrame(function(){ if(MQ.matches){build();measure();} }); }
  var lastW=W.innerWidth;
  function onResize(){ if(W.innerWidth===lastW)return; lastW=W.innerWidth; sync(); }
  sync(); W.addEventListener('load',sync); W.addEventListener('resize',onResize,{passive:true});
  W.addEventListener('orientationchange',function(){setTimeout(sync,300);});
  if(D.fonts&&D.fonts.ready)D.fonts.ready.then(sync);
}catch(e){}
})();

/* ────────────────────────── 9. כפתורי הפרומפט לטיוטור ────────────────────────── */
(function(){
  var T=null; try{T=JSON.parse(D.getElementById('tutor-prompts').textContent);}catch(e){return;}
  function done(btn){ var s=btn.querySelector('span'),o=s?s.textContent:''; btn.classList.add('ok'); if(s)s.textContent='הועתק'; setTimeout(function(){btn.classList.remove('ok');if(s)s.textContent=o;},1600); }
  function fallback(txt,cb){ var ta=D.createElement('textarea'); ta.value=txt; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;top:0;left:0;opacity:0'; B.appendChild(ta); ta.select(); ta.setSelectionRange(0,ta.value.length); try{D.execCommand('copy');cb();}catch(e){} B.removeChild(ta); }
  D.addEventListener('click',function(e){
    var b=e.target.closest('.gptb'); if(!b)return;
    var d=T[b.getAttribute('data-t')]; if(!d)return;
    e.preventDefault();
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(d.p).then(function(){done(b);},function(){fallback(d.p,function(){done(b);});});
    else fallback(d.p,function(){done(b);});
  });
})();

/* ────────────────────────── 10. טוגל התשובות בבנק השאלות ────────────────────────── */
(function(){
  var KEY='limba_ans15', sec=D.getElementById('examen15'), bar=D.getElementById('anstoggle15');
  if(!sec||!bar)return;
  function apply(mode){ sec.setAttribute('data-answers',mode); [].forEach.call(bar.querySelectorAll('.at-btn'),function(b){b.setAttribute('aria-pressed',b.getAttribute('data-ans')===mode?'true':'false');}); LS.set(KEY,mode); }
  apply(LS.get(KEY)||'amit');
  [].forEach.call(bar.querySelectorAll('.at-btn'),function(b){b.addEventListener('click',function(){apply(b.getAttribute('data-ans'));});});
})();

/* ────────────────────────── 11. SW + persist ────────────────────────── */
try{
  if('serviceWorker' in navigator){ W.addEventListener('load',function(){ navigator.serviceWorker.register('/sw.js').catch(function(){}); }); }
  if(navigator.storage&&navigator.storage.persist&&navigator.storage.persisted){ navigator.storage.persisted().then(function(a){ if(a)return; return navigator.storage.persist(); }).catch(function(){}); }
}catch(e){}

/* ────────────────────────── boot ────────────────────────── */
collectSpy();
buildRail();
W.addEventListener('scroll',spy,{passive:true});
W.addEventListener('resize',function(){ if(W.innerWidth!==spy._w){spy._w=W.innerWidth;spy();} },{passive:true});
spy();
if(IS_HOME)homeInit();
landOnHash();
W.addEventListener('load',function(){ setTimeout(warm,2500); });
})();
