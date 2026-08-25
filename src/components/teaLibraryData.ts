/* Tea Library — book data. Dimensions in mm, measured from the print PDFs
   (TrimBox / crop marks). Asset slices live in /public/tea-library. */

export type TeaBook = {
  id: string;
  title: string;
  w: number; // cover width, mm
  h: number; // cover height, mm
  t: number; // spine thickness, mm
  year: string;
  syn: string;
  front: string;
  back: string;
  spine?: string;   // vertical strip (standing book)
  spineH?: string;  // rotated strip (lying pile)
  spineColor?: string;
  sleeve?: string;        // outer sleeve front (קוראים לי תה)
  sleeveSpine?: string;   // sleeve spine (author obscured)
  sleeveSpineH?: string;
  eng?: boolean;    // english binding — spine on the left
  url?: string;     // product page (store) — TODO: per-book links from Amit
  noStore?: boolean;
};

const A = "/tea-library";

export const TEA_STORE = "https://www.wanderingtea.com/"; // TODO: replace with the store link

export const TEA_BOOKS: TeaBook[] = [
  {
    id: "korim", title: "קוראים לי תה", w: 140.7, h: 200, t: 30.5, year: "אוגוסט 2026",
    syn: "זהו ספרו השמיני של הסופר 'תה', הסופר האנונימי המוכר ביותר בישראל. 'קוראים לי תה' הוא רומן אוטוביוגרפי של דמות בדיונית: בבסיסו נמצא סיפורו האמתי לחלוטין של סופר ישראלי שכתב במשך 15 שנה תחת שם עט — אך הוא מכיל מידה שווה של מציאות ובדיון. בין שיחות עם סופרים מתים, עסקה כלכלית עם אישה שרוכשת את 'תה' למשך שנה שלמה ומחלת סרטן הלובשת צורה, הקורא יוכל רק לנחש אילו חלקים התרחשו באמת ואילו הם פרי הדמיון הצרוף. שמו האמתי של 'תה' נמצא בין דפי ספר זה.",
    front: `${A}/korim-front.webp`, back: `${A}/korim-back.webp`,
    spine: `${A}/korim-spine.webp`, spineH: `${A}/korim-spineH.webp`,
    sleeve: `${A}/korim-sleeve.webp`,
    sleeveSpine: `${A}/korim-spine-sleeve.webp`, sleeveSpineH: `${A}/korim-spineH-sleeve.webp`,
  },
  {
    id: "tower", title: "האיש במגדל הספרים", w: 126, h: 218, t: 10, year: "דצמבר 2024", noStore: true,
    syn: "הרחק בשחקים, במגדל של מילים, גר איש התה וקורא בספרים. ובלילות, כשהוא קצת בודד, האיש יושב לבדו בביתו וכותב. על מה ועל מי? זהו סוד שידוע רק למעטים — אותו תגלו אם תציצו בפנים. ספר ילדים מאויר, פרי שיתוף פעולה בין תה לעמית.",
    front: `${A}/tower-front.webp`, back: `${A}/tower-back.webp`,
    spine: `${A}/tower-spine.webp`, spineH: `${A}/tower-spineH.webp`,
  },
  {
    id: "veshuv", title: "ושוב הזמן", w: 140, h: 200, t: 20.1, year: "ינואר 2019",
    syn: "\"ושוב הזמן\" נועד להיות רגע של השתהות בלב היומיום. אסופת סיפורים וקטעים קצרים שנעה בין זיכרון לדמיון, בין התקווה שהעבר יישמר לרצון לשנותו, בין העיסוק באהבה לניסיון להתגבר על האובדן. ואולי הרגע הזה יילכד בזיכרונו של אחד מכם, שיחשוב עליו, באחד הימים, בחיוך של עצב. ספרו הרביעי של תה.",
    front: `${A}/veshuv-front.webp`, back: `${A}/veshuv-back.webp`,
    spine: `${A}/veshuv-spine.webp`, spineH: `${A}/veshuv-spineH.webp`,
  },
  {
    id: "eliot", title: "אליוט", w: 135, h: 210, t: 18, year: "ינואר 2018",
    syn: "אליוט חי בשלושה עולמות. בראשון הוא גר לבדו עם אמו ונמנע ממגע עם אנשים אחרים. בשני הוא גנרל מהולל מאחורי מסך המחשב, מנהיג שעליו סומכים בעיניים עצומות. ובשלישי, זה שאיש אינו מכיר, אליוט פוגש את השבעה — דמויות שנמצאות במאבק תמידי מאחורי קלעי המציאות. כשאליוט מחליט להשתתף בתחרות בינלאומית של משחק המחשב האהוב עליו כדי לזכות בפרס כספי שיעזור לאמו, העולמות השונים מתחילים לחלחל זה לתוך זה — ובסופו של דבר יהיה עליו לבחור היכן באמת ברצונו לחיות. ספרו השלישי של תה.",
    front: `${A}/eliot-front.webp`, back: `${A}/eliot-back.webp`,
    spine: `${A}/eliot-spine.webp`, spineH: `${A}/eliot-spineH.webp`,
  },
  {
    id: "meahav", title: "מאהבים", w: 135, h: 210, t: 14.2, year: "יולי 2023",
    syn: "סיפורה של רוני — סיפור חיים מלא תשוקה הנגלל מבעד להיכרויותיה עם הגברים שחלפו בחייה. מן האהבות הקטנות, הזמניות, ועד הגדולות שלעולם אינן מרפות מהלב. זהו ספר המתאר מסע של גוף ולב, ולא היעד הסופי הוא עיקרו, אלא האופן שבו מגיעים אליו. בכישרון עדין, תה משרטט את דמותה של רוני דרך נקודות המפגש המשמעותיות עם מאהביה. ספרו השישי של תה, וספרו הראשון בסוגה האירוטית-רומנטית.",
    front: `${A}/meahav-front.webp`, back: `${A}/meahav-back.webp`,
    spine: `${A}/meahav-spine.webp`, spineH: `${A}/meahav-spineH.webp`,
  },
  {
    id: "masa", title: "מסע קצר כדי לחזור", w: 129.8, h: 212.6, t: 7.2, year: "אפריל 2021",
    syn: "זהו ספרון משונה: אוגדן קטעים שנכתבו לאורך דרך שהייתה בו-זמנית ארוכה וקצרה מדי. יומן מסע המערב בין הפנטסטי ובין האמתי — בין מפגשים עם אלים ועצים מדברים ובין רגשות כנים של חרטה ואשמה. לא פסיפס ולא תצרף, אלא נתיב מרוצף הלוקח את הקורא למסע אל החדווה האבודה — נתיב שבו אפשר לפסוע לאחור בכל עת, כדי להיזכר ולשוב לשורש הימים.",
    front: `${A}/masa-front.webp`, back: `${A}/masa-back.webp`,
    spine: `${A}/masa-spine.webp`, spineH: `${A}/masa-spineH.webp`,
  },
  {
    id: "odktzat", title: "עוד קצת על אהבה", w: 135, h: 210, t: 8.6, year: "2024",
    syn: "עשר שנים חלפו מאז צאת הספר 'על אהבה ומעשיות אחרות' לאור. עשר שנים שבהן הזמן נשא הלאה אנשים, מערכות יחסים, זיכרונות ואהבות. ספרון זה, שהודפס במהדורה מוגבלת, מכיל שברים מן העבר: חלקם קטעים קצרים שנכתבו אז, לפני עשור, ואחרים נתווספו בשנים האחרונות. זהו ספרון מחווה לשבורי הלב שממשיכים הלאה, אבל עצרו להביט לאחור.",
    front: `${A}/odktzat-front.webp`, back: `${A}/odktzat-back.webp`,
    spine: `${A}/odktzat-spine.webp`, spineH: `${A}/odktzat-spineH.webp`,
  },
  {
    id: "al24", title: "על אהבה ומעשיות אחרות", w: 138.4, h: 216, t: 26.9, year: "2014 · מהדורת עשור 2024",
    syn: "לפניכם מצוי אוגדן, אסופת סיפורים ייחודית העוסקת ברגש שאינו כלה, בעולם הפרטי שנוצר כשאדם אחר הופך בעל-משמעות, ובתחושת הבדידות המתלווה לאבדן אהוב לנחשולי הזמן. חלק מהסיפורים המופיעים בספר זה הם אך שורות קצרות שנועדו ללכוד את תחושת הרגע טרם יחלוף; אחרים הם סיפורי עלילה פנטסטיים הנפרשים על גבי עמודים רבים. ספרו הראשון של סופר-הרשת תה.",
    front: `${A}/al24-front.webp`, back: `${A}/al24-back.webp`,
    spine: `${A}/al24-spine.webp`, spineH: `${A}/al24-spineH.webp`,
  },
  {
    id: "onlove", title: "On Love and Other Fables", w: 140.2, h: 216, t: 17.8, year: "English Edition", eng: true,
    syn: "Before you lies a unique collection of stories; tales about feelings that linger, about the private world that emerges through the meaningfulness of another person, and the loneliness that accompanies the loss of a loved one to the swells and currents of time. From the man watching us from the time observatory to a sperm donor who cannot find meaning in life — each story is meant to take you back to a moment from your own life. \"On Love and Other Fables\" is the first book by the web author Tea.",
    front: `${A}/onlove-front.webp`, back: `${A}/onlove-back.webp`,
    spine: `${A}/onlove-spine.webp`, spineH: `${A}/onlove-spineH.webp`,
  },
  {
    id: "wander", title: "Wandering Thought", w: 210, h: 297, t: 14.2, year: "Graphic Novel", eng: true,
    syn: "Night. A man lies on the border of sleep and wakefulness, and his thoughts wander. As with all people, there is a world in his mind — a cosmos of its own rules and order, foreign to ours. Into this world, a thought is born, one that should not be. This is the story of her journey through the Head. \"Wandering Thought\" is the second book by Tea, a graphic novel illustrated by Tali Genshaft, which weaves words and art into a singular piece of storytelling.",
    front: `${A}/wander-front.webp`, back: `${A}/wander-back.webp`,
    spine: `${A}/wander-spine.webp`, spineH: `${A}/wander-spineH.webp`,
  },
];
