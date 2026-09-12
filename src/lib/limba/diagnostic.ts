export const DIAGNOSTIC_VERSION = 'foundation-1';
export type Assistance = 'none' | 'hint' | 'theory' | 'answer';
export const assistanceLevels: Assistance[] = ['none', 'hint', 'theory', 'answer'];
export const diagnosticItems = [
  { id:'intro-1', topic:'intro1', section:'intro', lesson:1, prompt:'Mă ___ Ana.', instruction:'השלימו מילה אחת: קוראים לי אנה.', hint:'חושבים על אחת הדרכים לומר ״אני נקראת״.', answers:['numesc','cheamă'], explanation:'Mă numesc Ana. / Mă cheamă Ana.' },
  { id:'intro-2', topic:'intro1', section:'greet', lesson:1, prompt:'Bună ___!', instruction:'השלימו את ברכת ״ערב טוב״.', hint:'המילה החסרה מציינת את חלק היום.', answers:['seara'], explanation:'Bună seara! = ערב טוב.' },
  { id:'afi-1', topic:'afi2', section:'afi', lesson:2, prompt:'Eu ___ student.', instruction:'השלימו את הפועל ״להיות״ בצורה המתאימה.', hint:'הנושא הוא eu: אני.', answers:['sunt'], explanation:'Eu sunt student.' },
  { id:'afi-2', topic:'afi2', section:'afi', lesson:2, prompt:'Noi ___ acasă.', instruction:'השלימו: אנחנו בבית.', hint:'מחפשים את צורת ״אנחנו״ של a fi.', answers:['suntem'], explanation:'Noi suntem acasă.' },
  { id:'gender-1', topic:'agreement2', section:'gender', lesson:2, prompt:'un caiet → două ___', instruction:'כתבו את צורת הרבים של caiet.', hint:'זה שם עצם ניטרלי: זכר ביחיד, נקבה ברבים.', answers:['caiete'], explanation:'un caiet — două caiete' },
  { id:'gender-2', topic:'agreement2', section:'gender', lesson:2, prompt:'o carte → două ___', instruction:'כתבו את צורת הרבים של carte.', hint:'יש שינוי בצליל של העיצור לפני הסיומת.', answers:['cărți'], explanation:'o carte — două cărți' },
  { id:'avea-1', topic:'avea4', section:'avea', lesson:4, prompt:'Eu ___ o carte.', instruction:'השלימו: יש לי ספר.', hint:'משתמשים בפועל a avea עם eu.', answers:['am'], explanation:'Eu am o carte.' },
  { id:'avea-2', topic:'avea4', section:'avea', lesson:4, prompt:'Tu ___ timp?', instruction:'השלימו: יש לך זמן?', hint:'מהי צורת ״אתה/את״ של a avea?', answers:['ai'], explanation:'Tu ai timp?' },
  { id:'past-1', topic:'past17', section:'perfect17', lesson:17, prompt:'Ieri eu ___ lucrat.', instruction:'השלימו: אתמול עבדתי.', hint:'בעבר המורכב צריך פועל עזר לפני participiu.', answers:['am'], explanation:'Ieri eu am lucrat.' },
  { id:'past-2', topic:'past17', section:'perfect17', lesson:17, prompt:'Noi am ___ acasă.', instruction:'השלימו: היינו בבית.', hint:'נדרשת צורת participiu של a fi.', answers:['fost'], explanation:'Noi am fost acasă.' },
  { id:'routine-1', topic:'routine20', section:'rutina20', lesson:20, prompt:'Eu ___ trezesc la șapte.', instruction:'השלימו: אני מתעורר/ת בשבע.', hint:'הפעולה חוזרת אל מי שעושה אותה; מהו הכינוי של eu?', answers:['mă'], explanation:'Eu mă trezesc la șapte.' },
  { id:'routine-2', topic:'routine20', section:'rutina20', lesson:20, prompt:'Tu ___ culci la zece.', instruction:'השלימו: את/ה הולך/ת לישון בעשר.', hint:'מחפשים את הכינוי הרפלקסיבי של tu.', answers:['te'], explanation:'Tu te culci la zece.' },
];
export const normalizeAnswer = (s:string) => s.normalize('NFC').toLocaleLowerCase('ro-RO').replace(/[şţ]/g,c=>c==='ş'?'ș':'ț').trim().replace(/[.!?]+$/,'').trim().replace(/\s+/g,' ');
export function gradeItem(itemId:string, answer:string, assistance:Assistance) {
  const item=diagnosticItems.find(i=>i.id===itemId);
  if (!item) throw new Error('Unknown diagnostic item');
  const normalized=normalizeAnswer(answer);
  const correct=item.answers.some(a=>normalizeAnswer(a)===normalized);
  const plain=(s:string)=>s.normalize('NFD').replace(/\p{M}/gu,'');
  const near=!correct && item.answers.some(a=>plain(normalizeAnswer(a))===plain(normalized));
  return { correct, near, rating: correct && assistance==='none' ? 'independent' as const : correct || near ? 'help' as const : 'again' as const };
}
export const publicDiagnosticItems = () => diagnosticItems.map(item=>({id:item.id,topic:item.topic,section:item.section,lesson:item.lesson,prompt:item.prompt,instruction:item.instruction,hint:item.hint}));
