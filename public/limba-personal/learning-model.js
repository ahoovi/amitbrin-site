// Shared, deterministic learning decisions. No model guesses or reading-to-mastery inference.
export function diagnosticProgress(events, items, version) {
  const first = new Map();
  for (const event of events) {
    if (event.kind === 'diagnostic' && event.diagnostic?.version === version && items.some(i => i.id === event.diagnostic.item) && !first.has(event.diagnostic.item)) first.set(event.diagnostic.item, event);
  }
  const records = items.map(item => first.get(item.id)).filter(Boolean);
  return { records, completed: records.length, total: items.length, next: items.find(item => !first.has(item.id)), independent: records.filter(e => e.diagnostic.correct && (e.assistance || 'none') === 'none').length };
}
export function highestAssistance(a='none',b='none') {
  const levels=['none','hint','theory','answer'];
  return levels[Math.max(levels.indexOf(a),levels.indexOf(b),0)];
}
export function recommendTopic(events,topics,progress,now=Date.now()) {
  if(progress.next) return {kind:'diagnostic',topic:topics.find(t=>t.id===progress.next.topic),item:progress.next};
  const weak=topics.find(t=>progress.records.some(e=>e.topic===t.id && (e.rating!=='independent')) && !events.some(e=>e.topic===t.id && e.kind==='self-report'));
  if(weak) return {kind:'strengthen',topic:weak};
  const days={again:1,help:3,independent:7};
  const latest=topic=>events.filter(e=>e.topic===topic).at(-1);
  const due=topics.filter(t=>latest(t.id)&&Date.parse(latest(t.id).at)+days[latest(t.id).rating]*86400000<=now);
  if(due.length) return {kind:'review',topic:due[0]};
  return {kind:'practice',topic:topics.find(t=>!events.some(e=>e.topic===t.id&&e.kind==='self-report'))||topics[0]};
}
