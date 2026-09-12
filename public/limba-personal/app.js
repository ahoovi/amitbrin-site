import { VoicePractice } from './voice.js';
import { diagnosticProgress, highestAssistance, recommendTopic } from './learning-model.js';
/* Personal pilot. This file is independent of the digital-book generation pipeline. */
(() => {
  'use strict';
  const root = document.getElementById('app');
  let materialPromise;
  let view = 'home';
  let refreshing = false;
  const icons = {
    star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
    arrow: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    book: '<path d="M12 5v16M12 5C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-2-1-6-2-10 1Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    exit: '<path d="M9 4H4v16h5m3-8h9m-4-4 4 4-4 4"/>',
    repeat: '<path d="M20 7h-5m5 0V2M4 17h5m-5 0v5M4 8a8 8 0 0 1 14-3l2 2M4 17l2 2a8 8 0 0 0 14-3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const topics = [
    {id:'intro1',title:'נעים להכיר, ברומנית',ro:'Bună! Mă numesc…',lesson:1,skill:'ברכות והיכרות',section:'intro',full:['greet','intro'],hint:'אפשר להתחיל בשם שלך ובברכה המתאימה לשעה.',description:'ברכות, שם וכמה מילים ראשונות של היכרות.',prompts:[['Cum te numești?','איך קוראים לך?','Mă numesc Ana.'],['De unde ești?','מאיפה את/ה?','Sunt din Israel.'],['Bună seara!','ענו בברכת ערב מתאימה.','Bună seara!'],['Îmi pare bine!','ענו: גם לי.','Și mie!']]},
    {id:'afi2',title:'אני, את ואנחנו',ro:'Eu sunt. Noi suntem.',lesson:2,skill:'הפועל להיות בהווה',section:'afi',full:['pronouns','afi'],hint:'זהו קודם את כינוי הגוף, ואז התאימו לו את a fi.',description:'משפטים קצרים עם הפועל להיות בזמן הווה.',prompts:[['Eu ___ acasă.','השלימו: אני בבית.','Eu sunt acasă.'],['Noi ___ aici.','השלימו: אנחנו כאן.','Noi suntem aici.'],['Tu ___ student?','השלימו את הפועל.','Tu ești student?'],['Ei ___ acasă.','השלימו: הם בבית.','Ei sunt acasă.']]},
    {id:'avea4',title:'מה יש לי?',ro:'Eu am o întrebare.',lesson:4,skill:'הפועל a avea',section:'avea',full:['pronouns','avea'],hint:'הפועל a avea משתנה לפי מי שיש לו או לה משהו.',description:'איך אומרים שיש לנו זמן, ספר או שאלה.',prompts:[['Eu ___ o carte.','השלימו: יש לי ספר.','Eu am o carte.'],['Tu ___ timp?','השלימו: יש לך זמן?','Tu ai timp?'],['Noi ___ o întrebare.','השלימו: יש לנו שאלה.','Noi avem o întrebare.'],['Ei ___ două cărți.','השלימו: יש להם שני ספרים.','Ei au două cărți.']]},
    { id: 'routine20', section:'rutina20',full:['rutina20'],hint:'חושבים מי עושה את הפעולה ואיזה כינוי חוזר מתאים לו.', title: 'לספר על היום שלך', ro: 'O zi din viața mea', lesson: 20, skill: 'שגרת יום ופעלים רפלקסיביים', link: '/limbaromana-p3.html#rutina20', description: 'מהקימה בבוקר ועד הערב. מתרגלים משפטים קצרים על השגרה שלך.', prompts: [
      ['La ce oră te trezești?', 'באיזו שעה את/ה מתעורר/ת?', 'Mă trezesc la ora șapte.'],
      ['Ce faci dimineața?', 'מה את/ה עושה בבוקר?', 'Dimineața mă spăl, mă îmbrac și beau o cafea.'],
      ['La ce oră te culci?', 'באיזו שעה את/ה הולך/ת לישון?', 'Mă culc la ora unsprezece.'],
      ['Povestește despre o zi obișnuită.', 'ספר/י על יום רגיל בשלושה משפטים.', 'Mă trezesc la șapte. După micul dejun, merg la serviciu. Seara învăț română.'],
    ] },
    { id: 'past17',section:'perfect17',full:['perfect17'],hint:'בעבר המורכב מחברים פועל עזר וצורת participiu.', title: 'לספר מה היה אתמול', ro: 'Ce ai făcut ieri?', lesson: 17, skill: 'עבר מורכב · perfect compus', link: '/limbaromana-p3.html#perfect17', description: 'מעבירים את השיחה לעבר: מה עשית, לאן הלכת ועם מי דיברת.', prompts: [
      ['Ce ai făcut ieri?', 'מה עשית אתמול?', 'Ieri am lucrat și am învățat română.'],
      ['Unde ai fost ieri?', 'איפה היית אתמול?', 'Ieri am fost acasă.'],
      ['Cu cine ai vorbit?', 'עם מי דיברת?', 'Am vorbit cu sora mea.'],
      ['Ce ai mâncat la cină?', 'מה אכלת לארוחת ערב?', 'Am mâncat o salată.'],
    ] },
    { id: 'agreement2',section:'gender',full:['gender'],hint:'התחילו בזיהוי המין ביחיד ובדקו מה קורה ברבים.', title: 'יחיד, רבים ומה שביניהם', ro: 'Un caiet, două caiete', lesson: 2, skill: 'מין ומספר בשמות עצם', link: '/limbaromana-p4.html#gender', description: 'מתרגלים צורה מלאה ביחיד וברבים, בלי לחשוף את התשובה לפני הניסיון.', prompts: [
      ['caiet', 'אמרו את הצורה המלאה ביחיד וברבים, עם un / o ו־doi / două.', 'un caiet — două caiete'],
      ['carte', 'אמרו את הצורה המלאה ביחיד וברבים.', 'o carte — două cărți'],
      ['băiat', 'אמרו את הצורה המלאה ביחיד וברבים.', 'un băiat — doi băieți'],
      ['scaun', 'אמרו את הצורה המלאה ביחיד וברבים.', 'un scaun — două scaune'],
    ] },
  ];
  topics.sort((a,b)=>a.lesson-b.lesson);
  const byId = id => topics.find(t => t.id === id) || topics[0];
  let state = { user: null, events: [], minutes: 10, demo: false, topic: null, step: 0, pending: null, storage:'unconfigured', diagnosticItems:[], diagnosticVersion:'', assistance:'none', sessionAssistance:'none', paused:false, mode:'practice', answered:false, sessionCount:0 };
  const offset = days => new Date(Date.now()-days*86400000).toISOString();
  const sample = () => state.diagnosticItems.map((item,index)=>({topic:item.topic,rating:index===4||index===8?'help':'independent',kind:'diagnostic',assistance:index===4||index===8?'hint':'none',at:offset(2),diagnostic:{item:item.id,version:state.diagnosticVersion,correct:true}}));
  const events = () => state.demo ? sample() : state.events;
  const progress = () => diagnosticProgress(events(),state.diagnosticItems,state.diagnosticVersion);
  const date = value => new Intl.DateTimeFormat('he-IL',{day:'numeric',month:'short',timeZone:'Asia/Jerusalem'}).format(new Date(value));
  const storageText = () => !state.user ? 'מרחב לימוד אישי' : state.storage==='cloud' ? 'ההתקדמות שלך נשמרת בענן' : 'הדגמה מקומית · השמירה בענן עדיין לא פעילה כאן';
  function recommendation() { return recommendTopic(events(),topics,progress()); }
  async function api(action, body) {
    let response;
    try { response = await fetch('/api/limba/' + action, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', headers: body === undefined ? {} : {'Content-Type':'application/json'}, ...(body === undefined ? {} : {body: JSON.stringify(body)}) }); }
    catch { throw new Error('אין חיבור לשרת. בדקו את החיבור ונסו שוב.'); }
    const value = await response.json();
    if (!response.ok) {
      if (response.status === 401 && action !== 'login') location.assign('/limba/login');
      throw new Error(value.error || 'משהו השתבש. אפשר לנסות שוב.');
    }
    return value;
  }
  const voice = new VoicePractice({request:api,onStatus:status=>{const label=document.getElementById('session-status');if(label&&state.mode!=='diagnostic')label.textContent=({connecting:'מתחברים למלווה…',live:'שיחה קולית פעילה',paused:'המיקרופון והשמע מושתקים',closing:'מסיימים שיחה…',ended:'השיחה הסתיימה'})[status]||'תרגול עצמי בקול';}});
  const brand = `<a href="/limba" class="brand" aria-label="הרומנית שלי, עמוד הבית"><span lang="ro" dir="ltr">limba<span class="brand-dot">.</span></span><span class="brand-sub">הרומנית שלי</span></a>`;
  function header(active = 'home') {
    return `<header class="site-header"><div class="header-inner">${brand}<nav aria-label="ניווט ראשי"><a href="/limba" ${active === 'home' ? 'aria-current="page"' : ''}>הלימוד שלי</a><a href="/limbaromana.html?library=1">ספר הלימוד</a></nav><div class="account"><span class="avatar">${esc(state.user.name.charAt(0))}</span><span>${esc(state.user.name)}</span><button class="icon-button" id="logout" title="יציאה מהחשבון" aria-label="יציאה מהחשבון">${icon('exit')}</button></div></div></header>`;
  }
  function footer() { return `<footer class="site-footer"><span lang="ro" dir="ltr">Puțin câte puțin. <span lang="he" dir="rtl">קצת, בכל פעם.</span></span><span>${storageText()}</span></footer>`; }
  function bindHeader() {
    document.getElementById('logout')?.addEventListener('click', async (event) => {
      event.currentTarget.disabled = true;
      try { await voice.stop(); await api('logout', {}); location.assign('/limba/login'); }
      catch (error) { event.currentTarget.disabled = false; alert(error.message); }
    });
  }
  function login() {
    root.innerHTML = `<header class="login-header">${brand}<span class="quiet">מרחב לימוד אישי · רומנית B1</span></header><main id="main" class="login-layout"><section class="login-copy"><div class="eyebrow">מהשיעור. אל השיחה.</div><h1>הרומנית שלך,<br>צעד אחר צעד.</h1><p class="lead">החומר מהקורס, התרגול שמתאים לך<br class="desktop-break"> והצעד הבא, במקום אחד.</p><form id="login-form"><h2>נכנסים וממשיכים ללמוד</h2><label for="username">שם משתמש</label><input id="username" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" dir="ltr" required placeholder="amit / neta"><label for="password">סיסמה</label><div class="password-field"><input id="password" name="password" type="password" autocomplete="current-password" dir="ltr" required><button type="button" id="show-password" aria-label="הצגת הסיסמה" aria-pressed="false">הצגה</button></div><p id="login-error" class="error" role="alert"></p><button type="submit" class="primary login-submit">כניסה ללימוד שלי ${icon('arrow')}</button><p class="form-note">החשבון כבר מוכן עבורך. אין צורך בהרשמה.</p></form></section><aside class="login-art" aria-label="לימוד בקצב שלך"><span class="art-label">LIMBA ROMÂNĂ · ÎN FIECARE ZI</span><div class="art-orbit" aria-hidden="true"><span>ă</span><span>ș</span><span>ț</span></div><div class="art-words" lang="ro" dir="ltr">Puțin<br>câte puțin<span>.</span></div><p>עוד משפט שמצליחים לומר.<br>עוד שיחה שמרגישה טבעית.</p><div class="art-bottom"><span>ללמוד. לדבר. לחזור.</span><span>B1</span></div></aside></main>${footer()}`;
    const toggle = document.getElementById('show-password');
    toggle.addEventListener('click', () => {
      const input = document.getElementById('password');
      const show = input.type === 'password'; input.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'הסתרה' : 'הצגה'; toggle.setAttribute('aria-pressed', String(show)); toggle.setAttribute('aria-label', show ? 'הסתרת הסיסמה' : 'הצגת הסיסמה');
    });
    document.getElementById('login-form').addEventListener('submit', async event => {
      event.preventDefault();
      const button = event.currentTarget.querySelector('[type=submit]'); button.disabled = true; button.textContent = 'נכנסים…';
      document.getElementById('login-error').textContent = '';
      try { await api('login', { username: document.getElementById('username').value, password: document.getElementById('password').value }); location.assign('/limba'); }
      catch (error) { document.getElementById('login-error').textContent = error.message; button.disabled = false; button.innerHTML = 'כניסה ללימוד שלי ' + icon('arrow'); }
    });
  }
  const ratingLabel = rating => ({ again: 'רוצה לחזור על זה', help: 'הצלחתי עם עזרה', independent: 'הצלחתי ללא עזרה' }[rating]);
  function demoNotice() { return state.demo ? `<div class="demo-notice" role="status">נתוני דוגמה בלבד · אלה אינם הישגים או המלצות המבוססים על התרגול האישי שלך.<button id="leave-demo" class="text-button">חזרה לחשבון שלי</button></div>` : ''; }
  function dashboard() {
    view='home';
    const p=progress(),rec=recommendation(),diagnostic=rec.kind==='diagnostic';
    const affirmation=p.completed===0?'Fiecare pas contează.':p.next?'Ai curaj să încerci.':'Înveți în ritmul tău.';
    const translation=p.completed===0?'כל צעד נחשב.':p.next?'יש לך אומץ לנסות.':'לומדים בקצב שלך.';
    const milestones=[{done:p.completed>0,title:'הצעד הראשון',sub:'התחלת להכיר את נקודת הפתיחה שלך'},{done:p.independent>0,title:'בכוחות עצמך',sub:'תשובה נכונה בלי להיעזר בחומר'},{done:p.total>0&&!p.next,title:'מפת פתיחה מוכנה',sub:'עברנו יחד על שש תחנות מהקורס'}];
    const reason=diagnostic?'נתחיל מהחומר המוקדם ונגלה מה כבר מוכר לך. כל תשובה נשמרת, ואפשר לעצור ולהמשיך בפעם הבאה.':rec.kind==='strengthen'?'במיפוי מצאנו כאן מקום לחיזוק. ננסה שוב עם הסבר זמין לצד השיחה.':rec.kind==='review'?'זה זמן טוב לחזרה קצרה על נושא שכבר פגשת.':'נבחר נושא מוכר ונרחיב בהדרגה את הביטחון שלך.';
    root.innerHTML=`${header()}<main id="main" class="dashboard">${demoNotice()}<div class="page-heading affirmation-heading"><div><h2 class="personal-greeting">שלום, ${esc(state.user.name)}</h2><h1 lang="ro" dir="ltr">${affirmation}</h1><p class="affirmation-translation">${translation}</p></div><div class="course-marker"><span>הדרך לרומנית B1</span><strong>מרץ 2027</strong><span>הקורס: עד שיעור 20</span></div></div>
    <div class="companion-note"><span class="companion-seal">${icon('sun')}</span><div><strong>${p.next?'בואו נכיר את הרומנית שכבר יש לך.':'כבר יש לנו נקודת פתיחה. מכאן נבנה יחד.'}</strong><p>${p.next?'אין צורך להתכונן. גם ״עוד לא יודע/ת״ עוזר לבחור את התרגול הנכון.':`במיפוי ענית עצמאית על ${p.independent} מתוך ${p.total} שאלות. נשתמש בזה כדי לבחור מה לחזק.`}</p></div><span class="companion-caption">הליווי שלך</span></div>
    <div class="study-layout"><section class="study-main" aria-labelledby="session-heading"><div class="section-heading"><h2 id="session-heading">${diagnostic?'קודם מכירים. אחר כך מתקדמים.':'הצעד הבא שלך'}</h2><span>${diagnostic?'מיפוי פתיחה':'המלצה אישית'}</span></div><div class="recommendation"><div class="recommend-top"><span class="tag">${icon(diagnostic?'sun':'repeat')}${diagnostic?'מתחילים מהבסיס':rec.kind==='strengthen'?'בונים ביטחון':'חזרה שמקדמת'}</span><span class="lesson">שיעור ${rec.topic.lesson}</span></div><h3>${diagnostic?(p.completed?'ממשיכים להכיר את הידע שלך':'בואו נגלה מה כבר ידוע לך'):rec.topic.title}</h3><p class="romanian-heading" lang="ro" dir="ltr">${diagnostic?'Începem de la început.':rec.topic.ro}</p><p class="recommend-reason">${reason}</p>${diagnostic?`<div class="mapping-progress"><div><strong>${p.completed} מתוך ${p.total}</strong><span>שאלות במיפוי הפתיחה</span></div><progress value="${p.completed}" max="${p.total}" aria-label="התקדמות במיפוי"></progress><p>התחנה הבאה: ${rec.topic.title}</p></div>`:''}
    <fieldset class="time-picker"><legend>כמה זמן מתאים לך עכשיו?</legend><div>${[5,10,15,20].map(n=>`<label><input type="radio" name="minutes" value="${n}" ${state.minutes===n?'checked':''}><span>${n} דקות</span></label>`).join('')}</div></fieldset><a class="primary practice-start" href="${diagnostic?diagnosticURL():practiceURL(rec.topic.id)}">${icon(diagnostic?'arrow':'mic')}${diagnostic?(p.completed?'ממשיכים במיפוי':'מתחילים להכיר'):'מתחילים לתרגל'} ${icon('arrow')}</a><p class="voice-footnote">${diagnostic?'המיפוי כרגע בכתב. הוא דוגם ידע מהקורס ואינו מבחן הסמכה או בדיקת דיבור.':'תרגול עצמי בקול · GPT-Live עדיין לא מחובר'}</p></div>
    <section class="topics-section"><div class="section-heading"><h2>או בוחרים נושא בעצמנו</h2><a class="text-link" href="/limbaromana.html?library=1">לספר ${icon('arrow')}</a></div><div class="topic-list">${topics.map(t=>`<a class="topic-row" href="${practiceURL(t.id)}"><span class="topic-number">${String(t.lesson).padStart(2,'0')}</span><div><strong>${t.title}</strong><span>${t.skill}</span></div>${icon('arrow')}</a>`).join('')}</div></section></section>
    <aside class="progress-panel"><div class="section-heading"><h2>${milestones.some(m=>m.done)?'דברים שכבר עשית':'ההישגים שבדרך'}</h2>${icon('star')}</div><div class="milestone-list">${milestones.map(m=>`<div class="milestone ${m.done?'earned':'upcoming'}"><span>${icon(m.done?'star':'clock')}</span><div><strong>${m.title}</strong><p>${m.done?m.sub:'עוד צעד בדרך'}</p></div>${m.done?'<small>הושג</small>':''}</div>`).join('')}</div><section class="knowledge-map"><h3>מפת הידע שלך</h3><p>מבדילים בין מה שנבדק לבין דיווח עצמי.</p>${topics.map(t=>{const checked=p.records.filter(e=>e.topic===t.id);const independent=checked.filter(e=>e.rating==='independent').length;const self=events().filter(e=>e.topic===t.id&&e.kind==='self-report').at(-1);return `<div class="skill-row"><strong>${t.skill}</strong><span class="skill-status ${checked.length&&independent===checked.length?'independent':''}">${checked.length?`${independent} מתוך ${checked.length} תשובות עצמאיות במיפוי`:'עוד לא נבדק כאן'}</span>${self?`<small>תרגול עצמי: ${ratingLabel(self.rating)}</small>`:''}</div>`;}).join('')}</section><section class="recent"><h3>התקדמות אחרונה</h3>${events().length?`<ol>${events().slice(-3).reverse().map(e=>`<li><time>${date(e.at)}</time><div><strong>${byId(e.topic).title}</strong><span>${e.kind==='diagnostic'?(e.diagnostic.correct?'תשובה נכונה'+(e.assistance==='none'?' בעצמך':' אחרי עזרה'):'זיהינו נקודה לחיזוק'):ratingLabel(e.rating)}</span></div></li>`).join('')}</ol>`:'<p>כאן יופיעו הצעדים שלך אחרי המיפוי הראשון.</p>'}</section><button class="text-button demo-toggle" id="demo-toggle">${state.demo?'חזרה לנתונים שלי':'איך זה ייראה בהמשך? הצגת דוגמה'} ${icon('arrow')}</button></aside></div>
    <a class="audio-banner" href="/limbaromana.html?library=1#dlall"><span class="audio-icon">${icon('download')}</span><div><strong>יוצאים מהבית? לוקחים את השמע איתנו.</strong><span>מורידים את שמע הספר ב־Wi-Fi, ומאזינים בדרכים.</span></div><span class="audio-cta">לספר ולהורדת השמע ${icon('arrow')}</span></a><p class="sync-status" id="sync-status" role="status">${icon(state.storage==='cloud'?'check':'clock')}${storageText()}</p></main>${footer()}`;
    bindHeader();
    document.querySelectorAll('[name=minutes]').forEach(input=>input.addEventListener('change',()=>{state.minutes=Number(input.value);document.querySelector('.practice-start').href=diagnostic?diagnosticURL():practiceURL(rec.topic.id);document.querySelectorAll('.topic-row').forEach(a=>{const u=new URL(a.href);u.searchParams.set('minutes',state.minutes);a.href=u;});}));
    document.getElementById('demo-toggle').addEventListener('click',toggleDemo);
    document.getElementById('leave-demo')?.addEventListener('click',toggleDemo);
  }
  function toggleDemo(){state.demo=!state.demo;dashboard();document.getElementById('demo-toggle').focus();}
  function practiceURL(id){return `/limba/practice?topic=${id}&minutes=${state.minutes}${state.demo?'&demo=1':''}`;}
  function diagnosticURL(){return `/limba/practice?mode=diagnostic&minutes=${state.minutes}${state.demo?'&demo=1':''}`;}
  function practice(){
    view='practice';const params=new URLSearchParams(location.search);
    state.mode=params.get('mode')==='diagnostic'?'diagnostic':'practice';state.demo=params.get('demo')==='1';
    state.minutes=[5,10,15,20].includes(Number(params.get('minutes')))?Number(params.get('minutes')):10;
    state.topic=byId(params.get('topic'));state.step=0;state.sessionCount=0;state.sessionAssistance='none';
    startQuestion();
  }
  const currentItem=()=>state.mode==='diagnostic'?progress().next:null;
  function startQuestion(){
    const item=currentItem();
    if(state.mode==='diagnostic'&&!item){mappingSummary();return;}
    if(item)state.topic=byId(item.topic);state.currentDiagnostic=item;
    state.assistance='none';state.paused=false;state.answered=false;state.pending=null;
    const t=state.topic;
    root.innerHTML=`${header('practice')}<main id="main" class="practice-page integrated-practice">${state.demo?'<div class="demo-notice">מצב דוגמה · התוצאות אינן נשמרות בחשבון.</div>':''}<a class="back-link" href="/limba">→ ללימוד שלי</a><div class="practice-heading"><div class="eyebrow">${state.mode==='diagnostic'?'מיפוי פתיחה':'תרגול עצמי בקול'} · שיעור ${t.lesson}</div><h1>${t.title}</h1><p>${state.mode==='diagnostic'?'מתחילים ממה שכבר מוכר. כל תשובה עוזרת להתאים את ההמשך.':t.description}</p></div><div class="workspace-tabs" role="group" aria-label="תצוגת התרגול"><button data-view="question" aria-pressed="true">${icon('mic')} ${state.mode==='diagnostic'?'המיפוי':'התרגול'}</button><button data-view="material" aria-pressed="false">${icon('book')} החומר לצדי</button></div>
    <div class="learning-workspace" data-view="question"><section class="question-zone" aria-label="השאלה הנוכחית"><div class="question-coach"><span class="companion-seal small">${icon('sun')}</span><p id="coach-line">${state.mode==='diagnostic'?'אפשר לנסות, להיעזר או לדלג. אין כאן ציון שצריך להשיג.':'קחו רגע לחשוב. ההסבר כאן אם צריך אותו.'}</p></div>${state.mode!=='diagnostic'?'<div id="voice-panel" class="voice-panel"></div>':''}<div class="practice-card compact-question"><div class="practice-card-top"><span>${state.mode==='diagnostic'?'בודקים נקודת פתיחה':'מנסים בקול'}</span><span>${state.mode==='diagnostic'?`${progress().completed+1} / ${progress().total}`:`${state.step+1} / ${questionCount()}`}</span></div><h2 class="spoken-prompt" tabindex="-1" lang="ro" dir="ltr">${esc(item?item.prompt:t.prompts[state.step][0])}</h2><p class="question-instruction">${esc(item?item.instruction:t.prompts[state.step][1])}</p>${item?`<form id="diagnostic-form"><label for="diagnostic-answer">המילה החסרה ברומנית</label><input id="diagnostic-answer" dir="ltr" lang="ro" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="100"><div class="diacritic-keys" aria-label="אותיות רומניות">${['ă','â','î','ș','ț'].map(letter=>`<button type="button" data-letter="${letter}" lang="ro">${letter}</button>`).join('')}</div><button class="primary" type="submit" id="check-answer">בדיקה ושמירה ${icon('arrow')}</button><button class="text-button skip-item" type="button" id="skip-item">עוד לא יודע/ת · אפשר להמשיך</button></form>`:`<button class="secondary reveal" id="reveal">סיימתי לנסות · הצגת דוגמה</button>`}<p id="question-error" class="error" role="alert"></p><div id="question-feedback" aria-live="polite"></div><p class="assistance-status" id="assistance-status">הניסיון הזה עדיין עצמאי</p></div></section>
    <aside class="material-zone" aria-labelledby="material-heading"><div class="section-heading"><h2 id="material-heading">החומר, ממש כאן</h2><span>מתוך ספר הקורס</span></div><div class="help-levels" role="group" aria-label="כמה עזרה לפתוח"><button data-help="hint" aria-pressed="false">רמז קטן</button><button data-help="theory" aria-pressed="false">להיזכר בכלל</button><button data-help="full" aria-pressed="false">הנושא המלא</button></div><div class="reading-pane" id="reading-pane"><div class="reading-empty">${icon('book')}<h3>אפשר להיעזר. אפשר גם לנסות לבד.</h3><p>פתחו רמז, כלל או את חומר הלימוד המלא. השאלה והתשובה שלכם יישארו כאן.</p><p>פתיחת עזרה תסומן, כדי שנדע להבחין בין ידע עצמאי לבין ידע שנעזר בחומר.</p></div></div></aside></div>
    <div class="session-dock"><span class="dock-symbol">${icon('mic')}</span><div><strong id="session-status">${state.mode==='diagnostic'?'מיפוי בכתב':'תרגול עצמי בקול'}</strong><small>${state.mode==='diagnostic'?'מיפוי בכתב · הקול זמין בתרגול הנושאים':state.voiceAvailable?'GPT Live · התחלה בכפתור השיחה':'הקול ממתין להפעלה'}</small></div><button class="secondary" id="pause-session" aria-pressed="false">${icon('pause')} רגע, אני קורא/ת</button><button class="text-button" id="back-to-question">בחזרה לשאלה</button></div></main>${footer()}`;
    bindHeader();bindWorkspace();
    if(state.mode!=='diagnostic'){voice.mount(document.getElementById('voice-panel'),{topic:t,minutes:state.minutes,available:state.voiceAvailable,demo:state.demo});voice.setContext(t.prompts[state.step][0]+' — '+t.prompts[state.step][1]);}
    if(item){
      document.getElementById('diagnostic-form').addEventListener('submit',e=>{e.preventDefault();submitDiagnostic(false);});
      document.getElementById('skip-item').addEventListener('click',()=>submitDiagnostic(true));
      document.querySelectorAll('[data-letter]').forEach(button=>button.addEventListener('click',()=>{const input=document.getElementById('diagnostic-answer');input.setRangeText(button.dataset.letter,input.selectionStart,input.selectionEnd,'end');input.focus();}));
    }else document.getElementById('reveal').addEventListener('click',()=>{
      document.getElementById('reveal').hidden=true;
      document.getElementById('question-feedback').innerHTML=`<div class="answer"><span>תשובה אפשרית</span><p lang="ro" dir="ltr">${esc(t.prompts[state.step][2])}</p><button class="primary" id="next">${state.step+1===questionCount()?'מסכמים את התרגול':'לשאלה הבאה'} ${icon('arrow')}</button></div>`;
      document.getElementById('next').addEventListener('click',()=>{if(state.step+1===questionCount())summary();else{state.step++;startQuestion();}});document.getElementById('next').focus();
    });
  }
  function questionCount(){return state.minutes===5?2:state.minutes===10?3:4;}
  function showView(name){const workspace=document.querySelector('.learning-workspace');if(!workspace)return;workspace.dataset.view=name;document.querySelectorAll('[data-view]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.view===name));});}
  function setPaused(paused){
    state.paused=paused;voice.pause(paused);
    const button=document.getElementById('pause-session');if(!button)return;
    button.setAttribute('aria-pressed',String(paused));button.innerHTML=icon(paused?'arrow':'pause')+(paused?'ממשיכים בתרגול':'רגע, אני קורא/ת');
    document.getElementById('session-status').textContent=paused?'התרגול ממתין לך':state.mode==='diagnostic'?'מיפוי בכתב':'תרגול עצמי בקול';
    document.querySelectorAll('#diagnostic-form input,#diagnostic-form button,#reveal').forEach(control=>control.disabled=paused||state.answered||!!state.pending);document.querySelectorAll('#next,#diagnostic-next').forEach(control=>control.disabled=paused);
  }
  function bindWorkspace(){
    document.querySelectorAll('button[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
    document.getElementById('pause-session').addEventListener('click',()=>{setPaused(!state.paused);if(!state.paused)showView('question');});
    document.getElementById('back-to-question').addEventListener('click',()=>{setPaused(false);showView('question');document.querySelector('#diagnostic-answer,.spoken-prompt').focus();});
    document.querySelectorAll('[data-help]').forEach(b=>b.addEventListener('click',()=>openHelp(b.dataset.help)));
  }
  async function openHelp(level){
    const pane=document.getElementById('reading-pane');const item=state.currentDiagnostic;
    if(!state.answered&&!state.pending){state.assistance=highestAssistance(state.assistance,level==='hint'?'hint':'theory');state.sessionAssistance=highestAssistance(state.sessionAssistance,state.assistance);document.getElementById('assistance-status').textContent=state.assistance==='hint'?'נפתח רמז לניסיון הזה':'נעזרת בחומר במהלך הניסיון';}
    document.querySelectorAll('[data-help]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.help===level)));showView('material');
    if(level==='hint'){pane.innerHTML=`<div class="reading-hint">${icon('sun')}<h3>כיוון קטן למחשבה</h3><p>${esc(item?item.hint:state.topic.hint)}</p></div>`;return;}
    setPaused(true);pane.innerHTML='<p role="status">פותחים את ההסבר מהספר…</p>';
    try{
      materialPromise ||= fetch('/limba-personal/materials.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error();return r.json();}).catch(error=>{materialPromise=null;throw error;});
      const materials=await materialPromise;
      const sections=level==='theory'?[item?item.section:state.topic.section]:state.topic.full;
      pane.innerHTML=`<div class="reading-source">${icon('book')} חומר המקור של הקורס · אפשר לקרוא ולחזור באותו מסך</div>`+sections.map(id=>{if(!materials.units[id])throw new Error();return `<article class="book-material" data-source="${id}">${materials.units[id].html}</article>`;}).join('');
    }catch{pane.innerHTML='<p class="error" role="alert">החומר לא נטען. אפשר לנסות לפתוח אותו שוב או לחזור לשאלה.</p>';}
  }
  async function submitDiagnostic(skipped){
    if(state.paused||state.answered)return;
    const item=state.currentDiagnostic,input=document.getElementById('diagnostic-answer');
    if(!skipped&&!input.value.trim()){document.getElementById('question-error').textContent='כתבו מילה, או בחרו ״עוד לא יודע/ת״.';input.focus();return;}
    state.pending ||= {id:crypto.randomUUID(),item:item.id,answer:skipped?'':input.value.trim(),assistance:state.assistance,skipped};
    document.querySelectorAll('#diagnostic-form input,#diagnostic-form button').forEach(c=>c.disabled=true);
    document.getElementById('question-error').textContent='';document.getElementById('check-answer').textContent='בודקים ושומרים…';
    try{
      const data=await api('diagnostic',state.pending);
      state.events=data.events;state.answered=true;state.pending=null;state.sessionCount++;
      document.getElementById('diagnostic-form').hidden=true;
      const result=data.result;
      const heading=result.correct?(state.assistance==='none'?'Bine! הצלחת בעצמך.':'יפה, השתמשת בעזרה והגעת לתשובה.'):result.near?'כמעט. נוסיף את הסימנים הרומניים.':'מצאנו נקודה שכדאי לחזק.';
      document.getElementById('question-feedback').innerHTML=`<div class="checked-feedback ${result.correct?'correct':'support'}"><span class="feedback-symbol">${icon(result.correct?'star':'sun')}</span><h3>${heading}</h3><p>${result.correct?'הצעד הזה נוסף למפת הידע שלך.':'זה בדיוק תפקיד המיפוי. נשמור את הנושא לתרגול מתאים.'}</p><p class="checked-answer" lang="ro" dir="ltr">${esc(result.explanation)}</p><span class="saved-indicator">${icon('check')} נשמר${state.storage==='cloud'?' בענן':''}</span><button class="primary" id="diagnostic-next">${progress().next?'ממשיכים לצעד הבא':'למפת הידע שלי'} ${icon('arrow')}</button><button class="text-button" id="finish-for-now">מספיק להיום · נשמר ונמשיך אחר כך</button></div>`;
      document.getElementById('diagnostic-next').addEventListener('click',()=>{const limit=state.minutes===5?2:state.minutes===10?4:state.minutes===15?6:12;if(!progress().next||state.sessionCount>=limit)mappingSummary();else startQuestion();});
      document.getElementById('finish-for-now').addEventListener('click',mappingSummary);document.getElementById('diagnostic-next').focus();
    }catch(error){document.getElementById('question-error').textContent=error.message;const button=document.getElementById('check-answer');button.disabled=false;button.textContent='ניסיון שמירה נוסף';}
  }
  function mappingSummary(){
    view='summary';const p=progress();
    root.innerHTML=`${header()}<main id="main" class="summary-page"><div class="summary-mark">${icon('star')}</div><p class="eyebrow">Pas cu pas. צעד אחר צעד.</p><h1>${p.next?'כל צעד כזה מלמד אותנו משהו.':'מפת הפתיחה שלך מוכנה.'}</h1><p class="lead">${p.completed} מתוך ${p.total} שאלות כבר נשמרו</p><p>${p.next?'אפשר לעצור כאן. בכניסה הבאה נמשיך בדיוק מהשאלה הבאה.':'כעת נוכל להציע תרגולים לפי התשובות שלך, ולהמשיך ללמוד תוך כדי תנועה.'}</p><p>${p.independent} תשובות נכונות ללא עזרה במיפוי הזה.</p>${p.next?`<a class="primary" href="${diagnosticURL()}">יש לי עוד זמן · ממשיכים ${icon('arrow')}</a>`:''}<a class="${p.next?'secondary':'primary'}" href="/limba">ללימוד שלי ${icon('arrow')}</a><p class="small-note">${storageText()}</p><p class="small-note">זו דגימת ידע מהקורס. מיומנויות שיחה, האזנה והיגוי עדיין לא נבדקו.</p></main>${footer()}`;bindHeader();
  }
  async function summary(){
    await voice.stop();
    view='summary';
    root.innerHTML=`${header('practice')}<main id="main" class="summary-page"><div class="summary-mark">${icon('star')}</div><div class="eyebrow">עוד ניסיון. עוד צעד.</div><h1>איך הרגיש התרגול?</h1><p class="lead">${state.topic.title}</p><p>הדיווח שלך יעזור לבחור מתי לחזור לנושא.<br>זו הערכה עצמית, גם אם נעזרת במלווה הקולי. אינה ציון אוטומטי.</p>${state.sessionAssistance!=='none'?'<p class="assistance-summary">נעזרת בחומר במהלך התרגול. נשמור גם את זה, כדי להתאים את החזרה.</p>':''}<fieldset class="rating-picker"><legend>מה מתאים לחוויה שלך?</legend>${[['independent','הצלחתי ללא עזרה','נחזור בעוד שבוע'],['help','הצלחתי עם עזרה','נקבע חזרה בעוד שלושה ימים'],['again','רוצה לחזור על זה','נחזור לנושא כבר מחר']].filter(([id])=>id!=='independent'||state.sessionAssistance==='none').map(([id,label,sub])=>`<label><input type="radio" name="rating" value="${id}"><span><strong>${label}</strong><small>${sub}</small></span></label>`).join('')}</fieldset><p class="error" id="save-error" role="alert"></p><button class="primary" id="save" disabled>${state.demo?'סיום הדוגמה · ללא שמירה':'שמירת התרגול'} ${icon('arrow')}</button><a class="text-link summary-back" href="/limba">חזרה בלי לשמור</a><p class="small-note">${state.demo?'מצב דוגמה · שום תוצאה לא נשמרת':storageText()}</p></main>${footer()}`;
    bindHeader();document.querySelectorAll('[name=rating]').forEach(input=>input.addEventListener('change',()=>{state.pending=null;document.getElementById('save').disabled=false;}));
    document.getElementById('save').addEventListener('click',async event=>{
      if(state.demo){location.assign('/limba');return;}
      const button=event.currentTarget,rating=document.querySelector('[name=rating]:checked')?.value;if(!rating)return;
      state.pending||={id:crypto.randomUUID(),topic:state.topic.id,rating,assistance:state.sessionAssistance};button.disabled=true;button.textContent='שומרים…';document.querySelectorAll('[name=rating]').forEach(i=>i.disabled=true);
      try{await api('events',state.pending);root.querySelector('main').innerHTML=`<div class="summary-mark">${icon('star')}</div><h1>Încă un pas înainte!</h1><p class="lead">עוד צעד קדימה. התרגול נשמר.</p><p>בפעם הבאה נתחשב גם במה שלמדנו היום.</p><a class="primary" href="/limba">ללימוד שלי ${icon('arrow')}</a><p class="small-note">${storageText()}</p>`;}catch(error){document.getElementById('save-error').textContent=error.message;button.disabled=false;button.textContent='ניסיון שמירה נוסף';}
    });
  }
  async function init() {
    if (location.pathname === '/limba/login') { login(); return; }
    try {
      const [data,diagnostic] = await Promise.all([api('me'),api('diagnostic')]); state.user = data.user; state.events = data.events; state.storage=data.storage; state.voiceAvailable=data.voice; state.diagnosticItems=diagnostic.items;state.diagnosticVersion=diagnostic.version;
      if (location.pathname === '/limba/practice') practice(); else dashboard();
    } catch(error) {
      root.innerHTML = `<main id="main" class="loading"><h1>עוד רגע חוזרים ללמוד</h1><p class="error" role="alert">${esc(error.message)}</p><button class="primary" id="retry">ניסיון נוסף</button><a href="/limba/login">לעמוד הכניסה</a></main>`;
      document.getElementById('retry').addEventListener('click', init);
    }
  }
  document.addEventListener('visibilitychange',async()=>{
    if(document.visibilityState!=='visible'||view!=='home'||!state.user||state.demo||refreshing)return;
    refreshing=true;
    try{const data=await api('me');state.events=data.events;state.storage=data.storage;dashboard();}catch(error){const status=document.getElementById('sync-status');if(status)status.textContent='הסנכרון לא הושלם. '+error.message;}finally{refreshing=false;}
  });
  init();
})();
