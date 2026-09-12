/* Personal pilot. This file is independent of the digital-book generation pipeline. */
(() => {
  'use strict';
  const root = document.getElementById('app');
  const icons = {
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
    { id: 'routine20', title: 'לספר על היום שלך', ro: 'O zi din viața mea', lesson: 20, skill: 'שגרת יום ופעלים רפלקסיביים', link: '/limbaromana-p3.html#rutina20', description: 'מהקימה בבוקר ועד הערב. מתרגלים משפטים קצרים על השגרה שלך.', prompts: [
      ['La ce oră te trezești?', 'באיזו שעה את/ה מתעורר/ת?', 'Mă trezesc la ora șapte.'],
      ['Ce faci dimineața?', 'מה את/ה עושה בבוקר?', 'Dimineața mă spăl, mă îmbrac și beau o cafea.'],
      ['La ce oră te culci?', 'באיזו שעה את/ה הולך/ת לישון?', 'Mă culc la ora unsprezece.'],
      ['Povestește despre o zi obișnuită.', 'ספר/י על יום רגיל בשלושה משפטים.', 'Mă trezesc la șapte. După micul dejun, merg la serviciu. Seara învăț română.'],
    ] },
    { id: 'past17', title: 'לספר מה היה אתמול', ro: 'Ce ai făcut ieri?', lesson: 17, skill: 'עבר מורכב · perfect compus', link: '/limbaromana-p3.html#perfect17', description: 'מעבירים את השיחה לעבר: מה עשית, לאן הלכת ועם מי דיברת.', prompts: [
      ['Ce ai făcut ieri?', 'מה עשית אתמול?', 'Ieri am lucrat și am învățat română.'],
      ['Unde ai fost ieri?', 'איפה היית אתמול?', 'Ieri am fost acasă.'],
      ['Cu cine ai vorbit?', 'עם מי דיברת?', 'Am vorbit cu sora mea.'],
      ['Ce ai mâncat la cină?', 'מה אכלת לארוחת ערב?', 'Am mâncat o salată.'],
    ] },
    { id: 'agreement2', title: 'יחיד, רבים ומה שביניהם', ro: 'Un caiet, două caiete', lesson: 2, skill: 'מין ומספר בשמות עצם', link: '/limbaromana-p4.html#gender', description: 'מתרגלים צורה מלאה ביחיד וברבים, בלי לחשוף את התשובה לפני הניסיון.', prompts: [
      ['caiet', 'אמרו את הצורה המלאה ביחיד וברבים, עם un / o ו־doi / două.', 'un caiet — două caiete'],
      ['carte', 'אמרו את הצורה המלאה ביחיד וברבים.', 'o carte — două cărți'],
      ['băiat', 'אמרו את הצורה המלאה ביחיד וברבים.', 'un băiat — doi băieți'],
      ['scaun', 'אמרו את הצורה המלאה ביחיד וברבים.', 'un scaun — două scaune'],
    ] },
  ];
  const byId = id => topics.find(t => t.id === id) || topics[0];
  let state = { user: null, events: [], minutes: 10, demo: false, topic: null, step: 0, shown: false, pending: null };
  const offset = (days) => new Date(Date.now() - days * 86400000).toISOString();
  const sample = () => state.user.id === 'amit' ? [
    { topic: 'agreement2', rating: 'independent', at: offset(7) },
    { topic: 'routine20', rating: 'independent', at: offset(1) },
    { topic: 'past17', rating: 'help', at: offset(1) },
  ] : [
    { topic: 'past17', rating: 'independent', at: offset(2) },
    { topic: 'routine20', rating: 'again', at: offset(1) },
  ];
  const events = () => state.demo ? sample() : state.events;
  const latest = (topic) => events().filter(e => e.topic === topic).at(-1);
  const interval = rating => ({ again: 1, help: 3, independent: 7 }[rating]);
  const dueDate = e => new Date(new Date(e.at).getTime() + interval(e.rating) * 86400000);
  const date = value => new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short', timeZone: 'Asia/Jerusalem' }).format(new Date(value));
  function recommendation() {
    const due = topics.filter(t => latest(t.id) && dueDate(latest(t.id)) <= new Date()).sort((a,b) => dueDate(latest(a.id)) - dueDate(latest(b.id)));
    if (due.length) return { topic: due[0], reason: 'הגיע הזמן לחזור לנושא הזה, לפי התרגול הקודם שלך.', label: 'חזרה בזמן הנכון' };
    const needsHelp = topics.find(t => latest(t.id)?.rating === 'again');
    if (needsHelp) return { topic: needsHelp, reason: 'בתרגול הקודם סימנת שכדאי לחזור לנושא הזה.', label: 'עוד קצת ביטחון' };
    const fresh = topics.find(t => !latest(t.id));
    return { topic: fresh || topics[0], reason: fresh ? (fresh.lesson === 20 ? 'נושא משיעור 20, העדכני בספר. נתחיל בכמה משפטים ונכיר את נקודת הפתיחה שלך.' : 'נושא מהקורס שעדיין לא תרגלת כאן. הזדמנות לבדוק איך הוא מרגיש בקול.') : 'חזרה קצרה על חומר מוכר, כדי לשמור אותו זמין בשיחה.', label: fresh ? 'ממשיכים מהקורס' : 'שומרים על הרצף' };
  }
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
  const brand = `<a href="/limba" class="brand" aria-label="הרומנית שלי, עמוד הבית"><span lang="ro" dir="ltr">limba<span class="brand-dot">.</span></span><span class="brand-sub">הרומנית שלי</span></a>`;
  function header(active = 'home') {
    return `<header class="site-header"><div class="header-inner">${brand}<nav aria-label="ניווט ראשי"><a href="/limba" ${active === 'home' ? 'aria-current="page"' : ''}>הלימוד שלי</a><a href="/limbaromana.html?library=1">ספר הלימוד</a></nav><div class="account"><span class="avatar">${esc(state.user.name.charAt(0))}</span><span>${esc(state.user.name)}</span><button class="icon-button" id="logout" title="יציאה מהחשבון" aria-label="יציאה מהחשבון">${icon('exit')}</button></div></div></header>`;
  }
  function footer() { return `<footer class="site-footer"><span lang="ro" dir="ltr">Puțin câte puțin. <span lang="he" dir="rtl">קצת, בכל פעם.</span></span><span>הדגמה מקומית · ההתקדמות נשמרת במחשב הזה</span></footer>`; }
  function bindHeader() {
    document.getElementById('logout')?.addEventListener('click', async (event) => {
      event.currentTarget.disabled = true;
      try { await api('logout', {}); location.assign('/limba/login'); }
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
    const rec = recommendation();
    const due = topics.filter(t => latest(t.id) && dueDate(latest(t.id)) <= new Date());
    root.innerHTML = `${header()}<main id="main" class="dashboard">${demoNotice()}<div class="page-heading"><div><div class="eyebrow">הדרך שלך לרומנית · B1</div><h1>שלום, ${esc(state.user.name)}<span class="greeting-dot">.</span></h1><p class="lead">קצת תרגול היום. יותר ביטחון בשיחה הבאה.</p></div><div class="course-marker"><span>לומדים לקראת</span><strong>מרץ 2027</strong><span>חומר הקורס: עד שיעור 20</span></div></div><div class="study-layout"><section class="study-main" aria-labelledby="session-heading"><div class="section-heading"><h2 id="session-heading">מה נתרגל היום?</h2><span>ההמלצה שלך</span></div><div class="recommendation"><div class="recommend-top"><span class="tag">${icon(latest(rec.topic.id) ? 'repeat' : 'sun')}${rec.label}</span><span class="lesson">שיעור ${rec.topic.lesson}</span></div><h3>${rec.topic.title}</h3><p class="romanian-heading" lang="ro" dir="ltr">${rec.topic.ro}</p><p class="recommend-reason">${rec.reason}</p><fieldset class="time-picker"><legend>כמה זמן יש לך?</legend><div>${[5,10,15,20].map(n => `<label><input type="radio" name="minutes" value="${n}" ${state.minutes === n ? 'checked' : ''}><span>${n} דקות</span></label>`).join('')}</div></fieldset><div class="session-plan" id="session-plan">${sessionPlan()}</div><a class="primary practice-start" href="${practiceURL(rec.topic.id)}">${icon('mic')} מתחילים לתרגל ${icon('arrow')}</a><p class="voice-footnote">בהדגמה: תרגול עצמי בקול · החיבור למורה הקולי יתווסף בהמשך</p></div><section class="topics-section" aria-labelledby="topics-heading"><div class="section-heading"><h2 id="topics-heading">אפשר גם לבחור נושא</h2><a class="text-link" href="/limbaromana.html?library=1">לכל הספר ${icon('arrow')}</a></div><div class="topic-list">${topics.filter(t => t.id !== rec.topic.id).map(t => `<a class="topic-row" href="${practiceURL(t.id)}"><span class="topic-number">${String(t.lesson).padStart(2,'0')}</span><div><strong>${t.title}</strong><span>${t.skill}</span></div>${icon('arrow')}</a>`).join('')}</div></section></section><aside class="progress-panel" aria-labelledby="progress-heading"><div class="section-heading"><h2 id="progress-heading">איפה אני עומד/ת</h2></div>${events().length ? `<p class="progress-intro">תמונה מהתרגולים שלך כאן.<br>הסימונים מבוססים על הדיווח שלך.</p><div class="skill-list">${topics.map(t => { const e = latest(t.id); return `<div class="skill-row"><strong>${t.skill}</strong><span class="skill-status ${e ? e.rating : 'new'}">${e ? icon(e.rating === 'independent' ? 'check' : 'repeat') : ''}${e ? ratingLabel(e.rating) : 'עוד לא תרגלת כאן'}</span></div>`; }).join('')}</div><div class="next-review">${icon('clock')}<div><strong>${due.length ? (due.length === 1 ? 'נושא אחד לחזרה' : `${due.length} נושאים לחזרה`) : 'החזרה הבאה'}</strong><span>${due.length ? 'מוכנים להיכנס לתרגול הבא שלך' : date(new Date(Math.min(...topics.map(t => latest(t.id)).filter(Boolean).map(e => dueDate(e).getTime()))))}</span></div></div>` : `<div class="empty-progress"><span class="empty-mark">${icon('book')}</span><h3>מתחילים להכיר אותך</h3><p>אחרי התרגול הראשון יופיעו כאן מה שכבר מרגיש מוכר, ומה כדאי לחזק.</p><p class="small-note">קריאה בספר לא מסומנת אוטומטית כשליטה בחומר.</p></div>`}<section class="recent"><h3>לאחרונה</h3>${events().length ? `<ol>${events().slice(-3).reverse().map(e => `<li><time>${date(e.at)}</time><div><strong>${byId(e.topic).title}</strong><span>${ratingLabel(e.rating)}</span></div></li>`).join('')}</ol>` : `<p>התרגולים שלך ייאספו כאן, אחד־אחד.</p>`}</section><button class="text-button demo-toggle" id="demo-toggle">${state.demo ? 'חזרה לנתונים שלי' : 'איך זה ייראה בהמשך? הצגת דוגמה'} ${icon('arrow')}</button></aside></div><a class="audio-banner" href="/limbaromana.html?library=1#dlall"><span class="audio-icon">${icon('download')}</span><div><strong>יוצאים מהבית? לוקחים את השמע איתנו.</strong><span>פותחים את הספר ומורידים את קובצי השמע ב־Wi-Fi, להאזנה בדרכים.</span></div><span class="audio-cta">לספר ולהורדת השמע ${icon('arrow')}</span></a></main>${footer()}`;
    bindHeader();
    document.querySelectorAll('[name=minutes]').forEach(input => input.addEventListener('change', () => {
      state.minutes = Number(input.value); document.getElementById('session-plan').innerHTML = sessionPlan();
      document.querySelector('.practice-start').href = practiceURL(rec.topic.id);
      document.querySelectorAll('.topic-row').forEach(a => { const url = new URL(a.href); url.searchParams.set('minutes', state.minutes); a.href = url; });
    }));
    document.getElementById('demo-toggle').addEventListener('click', toggleDemo);
    document.getElementById('leave-demo')?.addEventListener('click', toggleDemo);
  }
  function toggleDemo() { state.demo = !state.demo; dashboard(); document.getElementById('demo-toggle').focus(); }
  function sessionPlan() {
    const lead = state.minutes === 5 ? 'חימום קצר' : 'נזכרים בחומר';
    const middle = state.minutes <= 10 ? 'מתרגלים בקול' : 'מתרגלים ומרחיבים';
    return `<span>01 ${lead}</span><span class="plan-divider">←</span><span>02 ${middle}</span><span class="plan-divider">←</span><span>03 מסכמים</span>`;
  }
  function practiceURL(id) { return `/limba/practice?topic=${id}&minutes=${state.minutes}${state.demo ? '&demo=1' : ''}`; }
  function practice() {
    const params = new URLSearchParams(location.search);
    state.topic = byId(params.get('topic')); state.minutes = [5,10,15,20].includes(Number(params.get('minutes'))) ? Number(params.get('minutes')) : 10; state.demo = params.get('demo') === '1';
    state.step = 0;
    renderPractice();
  }
  function renderPractice() {
    const t = state.topic;
    const count = state.minutes === 5 ? 2 : state.minutes === 10 ? 3 : 4;
    const prompt = t.prompts[state.step];
    root.innerHTML = `${header('practice')}<main id="main" class="practice-page">${state.demo ? '<div class="demo-notice">מצב דוגמה · שום תוצאה כאן לא תישמר בחשבון.</div>' : ''}<a class="back-link" href="/limba">→ חזרה ללימוד שלי</a><div class="practice-heading"><div class="eyebrow">שיעור ${t.lesson} · מסגרת של ${state.minutes} דקות</div><h1>${t.title}</h1><p>${t.description}</p></div><div class="practice-layout"><section class="practice-card" aria-labelledby="prompt-heading"><div class="practice-card-top"><span>${icon('mic')} תרגול עצמי בקול</span><span>שאלה ${state.step + 1} מתוך ${count}</span></div><div class="step-dots" aria-hidden="true">${Array.from({length:count},(_,i)=>`<span class="${i<=state.step?'done':''}"></span>`).join('')}</div><p class="prompt-label" id="prompt-heading">${state.step ? 'ממשיכים. אמרו את התשובה בקול.' : 'קחו רגע. נסו לענות בקול לפני שמגלים.'}</p><h2 class="spoken-prompt" lang="ro" dir="ltr">${prompt[0]}</h2><details class="translation"><summary>עזרה בעברית</summary><p>${prompt[1]}</p></details><button class="secondary reveal" id="reveal">סיימתי לנסות · הצגת דוגמה</button><div class="answer" id="answer" hidden><span>תשובה לדוגמה. גם ניסוחים אחרים יכולים להתאים</span><p lang="ro" dir="ltr">${prompt[2]}</p>${state.minutes >= 15 ? '<p class="extension">עוד צעד: נסו משפט נוסף עם פרט שונה, בלי להסתכל בדוגמה.</p>' : ''}<button class="primary" id="next">${state.step + 1 === count ? 'מסכמים את התרגול' : 'לשאלה הבאה'} ${icon('arrow')}</button></div></section><aside class="practice-aside"><div class="voice-preview">${icon('mic')}<h2>בקרוב, זו תהיה שיחה</h2><p>המורה הקולי ישאל, יקשיב ויתאים את ההמשך אליך.</p><span class="status-neutral">GPT-Live עדיין לא מחובר</span><p class="small-note">כרגע לא מופעל מיקרופון ולא נשלחת הקלטה. מתרגלים בקול באופן עצמאי.</p></div><a class="book-link" href="${t.link}" target="_blank" rel="noopener">${icon('book')}<span><strong>רגע, נחזור לחומר</strong><small>פתיחת הנושא בספר בחלונית חדשה</small></span>${icon('arrow')}</a></aside></div></main>${footer()}`;
    bindHeader();
    document.getElementById('reveal').addEventListener('click', event => { event.currentTarget.hidden = true; document.getElementById('answer').hidden = false; document.getElementById('next').focus(); });
    document.getElementById('next').addEventListener('click', () => {
      if (state.step + 1 < count) { state.step++; renderPractice(); document.getElementById('prompt-heading').setAttribute('tabindex','-1'); document.getElementById('prompt-heading').focus(); }
      else summary();
    });
  }
  function summary() {
    root.innerHTML = `${header('practice')}<main id="main" class="summary-page"><div class="summary-mark">${icon('check')}</div><div class="eyebrow">עוד קצת רומנית, שלך</div><h1>איך הרגיש התרגול?</h1><p class="lead">${state.topic.title}</p><p>הדיווח שלך יעזור לבחור מתי לחזור לנושא.<br>זו הערכה עצמית, לא בדיקה של המורה הקולי.</p><fieldset class="rating-picker"><legend>בחרו את המשפט שמתאים</legend>${[['independent','הצלחתי ללא עזרה','נחזור על הנושא בעוד שבוע'],['help','הצלחתי עם עזרה','נקבע חזרה בעוד שלושה ימים'],['again','רוצה לחזור על זה','נחזור לנושא כבר מחר']].map(([id,label,sub])=>`<label><input type="radio" name="rating" value="${id}"><span><strong>${label}</strong><small>${sub}</small></span></label>`).join('')}</fieldset><p class="error" id="save-error" role="alert"></p><button class="primary" id="save" disabled>${state.demo ? 'סיום הדוגמה · ללא שמירה' : 'שמירה וחזרה ללימוד שלי'} ${icon('arrow')}</button><a class="text-link summary-back" href="/limba">חזרה בלי לשמור</a>${state.demo ? '<p class="demo-label">מצב דוגמה · ההתקדמות האישית שלך לא תשתנה</p>' : '<p class="small-note">השמירה בהדגמה הזו היא במחשב הזה בלבד.</p>'}</main>${footer()}`;
    bindHeader();
    document.querySelectorAll('[name=rating]').forEach(input => input.addEventListener('change', () => { state.pending = null; document.getElementById('save').disabled = false; }));
    document.getElementById('save').addEventListener('click', async event => {
      if (state.demo) { location.assign('/limba'); return; }
      const button = event.currentTarget; const rating = document.querySelector('[name=rating]:checked')?.value;
      if (!rating) return;
      state.pending ||= { id: crypto.randomUUID(), topic: state.topic.id, rating };
      button.disabled = true; button.textContent = 'שומרים…';
      document.querySelectorAll('[name=rating]').forEach(i=>i.disabled=true);
      try {
        await api('events', state.pending);
        // Only show success after the server has acknowledged persistence.
        root.querySelector('main').innerHTML = `<div class="summary-mark">${icon('check')}</div><h1>התרגול נשמר.</h1><p class="lead">הצעד הבא שלך כבר קצת יותר אישי.</p><p>הדיווח נשמר עבור ${esc(state.user.name)}.</p><a class="primary" href="/limba">בחזרה ללימוד שלי ${icon('arrow')}</a>`;
      } catch (error) { document.getElementById('save-error').textContent = error.message; button.disabled = false; button.textContent = 'ניסיון שמירה נוסף'; /* Preserve exact event ID/rating for a safe retry after an uncertain response. */ }
    });
  }
  async function init() {
    if (location.pathname === '/limba/login') { login(); return; }
    try {
      const data = await api('me'); state.user = data.user; state.events = data.events;
      if (location.pathname === '/limba/practice') practice(); else dashboard();
    } catch(error) {
      root.innerHTML = `<main id="main" class="loading"><h1>עוד רגע חוזרים ללמוד</h1><p class="error" role="alert">${esc(error.message)}</p><button class="primary" id="retry">ניסיון נוסף</button><a href="/limba/login">לעמוד הכניסה</a></main>`;
      document.getElementById('retry').addEventListener('click', init);
    }
  }
  init();
})();
