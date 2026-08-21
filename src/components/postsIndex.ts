/**
 * ONE registry for the blog.
 *
 * Everything downstream reads from here — the related rail at the end of each
 * post, the /blog index, sitemap.xml, the RSS feed, llms.txt and the Article
 * JSON-LD. A new post is a single entry; a corrected date propagates to all
 * six places at once.
 *
 * `published` / `modified` are ISO dates. An empty `published` means the date
 * is not yet verified — see claude/POST-DATES.md in the project. Nothing
 * fabricates a date: an unverified post simply carries no <time> and no
 * datePublished, which is honest and reversible.
 */

export type PostRef = {
  slug: string;
  /** the canonical path — kept explicit so a future slug change is one edit */
  href: string;
  cover: string;
  /** 1200x630 share image; falls back to the site default */
  ogImage?: string;
  /** the <h1> of the post page — the single source of truth for its name */
  title: string;
  /** the name used on cards, where the full headline is too long */
  cardTitle?: string;
  /** 140–160 chars, unique per post */
  description: string;
  /** the opening sentence, used on cards */
  intro: string;
  published?: string;
  modified?: string;
};

export const POSTS_INDEX: PostRef[] = [
  {
    slug: "instagram",
    href: "/blog/instagram",
    cover: "/media/blog/instagram/cover.jpg",
    ogImage: "/media/blog/instagram/cover-og.jpg",
    title: "כשהמשתמשים שלך לא יודעים לקרוא את השם שלך",
    description:
      "הלוגו החדש של אינסטגרם מסתיר החלטה מהותית: הלוגו הישן היה כתב מחובר, ודור שלם כבר לא יודע לקרוא אותיות כאלה.",
    intro:
      "אז השבוע הם שינו את הלוגו שלהם. לכאורה עוד ״ריענון למותג״… אבל זה הכיל בתוכו שינוי מהותי.",
    published: "",
    modified: "2026-08-21",
  },
  {
    slug: "chattjb",
    href: "/blog/chattjb",
    cover: "/media/blog/chattjb/billboard-hero.jpg",
    ogImage: "/media/og/og-chattjb.png",
    cardTitle: "הצ׳טבוט האנושי שלך",
    title: "הצ׳טבוט האנושי שלך",
    description:
      "מה שלט חוצות ב-6,000 דולר בפינת השישי ופולסום בסן פרנסיסקו מגלה על מה שאנחנו באמת מוכנים למסור למכונה.",
    intro:
      "בפינת הרחובות השישי ופולסום בסן פרנסיסקו יש שלט חוצות בעלות 6,000 דולר שמבטיח לכם את ממשק הצ'אט המוביל, המופעל על ידי AI.",
    published: "",
    modified: "2026-08-21",
  },
  {
    slug: "pri-etz-hadaat",
    href: "/blog/pri-etz-hadaat",
    cover: "/media/blog/pri-etz-hadaat/snakes-cover.jpg",
    ogImage: "/media/og/og-pri-etz-hadaat.png",
    title: "פרי עץ הדעת",
    description:
      "מה קורה לאמון בין מעצב ללקוח כשההנחה שמשהו נוצר במכונה מספיקה כדי לפסול אותו, בלי לבדוק.",
    intro:
      "לפני כמה ימים לקוח סרב לקבל ממני עבודה כי היא יצירה של בינה מלאכותית (כך הוא טען).",
    published: "",
    modified: "2026-08-21",
  },
  {
    slug: "motherload",
    href: "/blog/motherload",
    cover: "/media/blog/motherload/cover.jpg",
    ogImage: "/media/og/og-motherload.png",
    title: "Mother Load",
    description:
      "רייצ׳ל מאני הדפיסה את החשבון הפתוח של אימהות יוצרות — פוסטרים, קבלה אחת ארוכה, ומסה. על עיצוב ככלי טיעון.",
    intro:
      "יש מסמך חשבונאי אחד שאף רואה חשבון לא יחתום עליו, והוא נפתח כל ערב ב־23:00 בראש של כל אמא יוצרת.",
    published: "",
    modified: "2026-08-21",
  },
  {
    slug: "whatsapp",
    href: "/blog/whatsapp",
    cover: "/media/blog/whatsapp/cover.jpg",
    ogImage: "/media/og/og-whatsapp.png",
    title: "סליחה ששלחתי וואטסאפ",
    description:
      "ווטסאפ היא אפליקציית תקשורת שמשבשת תקשורת אנושית. ניתוח של מוצר שהמשתמשים שברו את התקרה שלו, והוא שבר את הגבולות שלהם.",
    intro: "וואטסאפ היא אפליקציית תקשורת שמשבשת את התקשורת האנושית. לא פחות.",
    published: "",
    modified: "2026-08-21",
  },
];

/** newest first — the registry order is the editorial order */
export const POSTS_BY_DATE = POSTS_INDEX;

export function getPost(slug: string) {
  return POSTS_INDEX.find((p) => p.slug === slug);
}

/** the three most recent posts that are not the one being read */
export function relatedTo(slug: string, n = 3) {
  return POSTS_INDEX.filter((p) => p.slug !== slug).slice(0, n);
}
