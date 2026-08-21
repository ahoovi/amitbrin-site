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

const POSTS_RAW: PostRef[] = [
  {
    slug: "instagram-cursive-logo",
    href: "/blog/instagram-cursive-logo",
    cover: "/media/blog/instagram-cursive-logo/cover.jpg",
    ogImage: "/media/blog/instagram-cursive-logo/cover-og.jpg",
    title: "כשהמשתמשים שלך לא יודעים לקרוא את השם שלך",
    description:
      "הלוגו החדש של אינסטגרם מסתיר החלטה מהותית: הלוגו הישן היה כתב מחובר, ודור שלם כבר לא יודע לקרוא אותיות כאלה.",
    intro:
      "אז השבוע הם שינו את הלוגו שלהם. לכאורה עוד ״ריענון למותג״… אבל זה הכיל בתוכו שינוי מהותי.",
    published: "2026-08-16",
    modified: "2026-08-21",
  },
  {
    slug: "human-chatbot",
    href: "/blog/human-chatbot",
    cover: "/media/blog/human-chatbot/billboard-hero.jpg",
    ogImage: "/media/og/og-human-chatbot.png",
    cardTitle: "הצ׳טבוט האנושי שלך",
    title: "הצ׳טבוט האנושי שלך",
    description:
      "מה שלט חוצות ב-6,000 דולר בפינת השישי ופולסום בסן פרנסיסקו מגלה על מה שאנחנו באמת מוכנים למסור למכונה.",
    intro:
      "בפינת הרחובות השישי ופולסום בסן פרנסיסקו יש שלט חוצות בעלות 6,000 דולר שמבטיח לכם את ממשק הצ'אט המוביל, המופעל על ידי AI.",
    published: "2026-08-12",
    modified: "2026-08-21",
  },
  {
    slug: "client-refused-ai-work",
    href: "/blog/client-refused-ai-work",
    cover: "/media/blog/client-refused-ai-work/snakes-cover.jpg",
    ogImage: "/media/og/og-client-refused-ai-work.png",
    title: "פרי עץ הדעת",
    description:
      "מה קורה לאמון בין מעצב ללקוח כשההנחה שמשהו נוצר במכונה מספיקה כדי לפסול אותו, בלי לבדוק.",
    intro:
      "לפני כמה ימים לקוח סרב לקבל ממני עבודה כי היא יצירה של בינה מלאכותית (כך הוא טען).",
    published: "2026-07-04",
    modified: "2026-08-21",
  },
  {
    slug: "mother-load",
    href: "/blog/mother-load",
    cover: "/media/blog/mother-load/cover.jpg",
    ogImage: "/media/og/og-mother-load.png",
    title: "Mother Load",
    description:
      "רייצ׳ל מאני הדפיסה את החשבון הפתוח של אימהות יוצרות — פוסטרים, קבלה אחת ארוכה, ומסה. על עיצוב ככלי טיעון.",
    intro:
      "יש מסמך חשבונאי אחד שאף רואה חשבון לא יחתום עליו, והוא נפתח כל ערב ב־23:00 בראש של כל אמא יוצרת.",
    published: "2026-07-09",
    modified: "2026-08-21",
  },
  {
    slug: "whatsapp-broke-communication",
    href: "/blog/whatsapp-broke-communication",
    cover: "/media/blog/whatsapp-broke-communication/cover.jpg",
    ogImage: "/media/og/og-whatsapp-broke-communication.png",
    title: "סליחה ששלחתי וואטסאפ",
    description:
      "ווטסאפ היא אפליקציית תקשורת שמשבשת תקשורת אנושית. ניתוח של מוצר שהמשתמשים שברו את התקרה שלו, והוא שבר את הגבולות שלהם.",
    intro: "וואטסאפ היא אפליקציית תקשורת שמשבשת את התקשורת האנושית. לא פחות.",
    published: "2026-05-25",
    modified: "2026-08-21",
  },
];

/**
 * Newest first, by the real publication dates. Everything downstream — the
 * blog index, the rail, the sitemap, the RSS feed and llms.txt — reads this,
 * so the order is right in all five places without anyone maintaining it.
 * A post with no date yet sorts to the end rather than to the top.
 */
export const POSTS_INDEX: PostRef[] = [...POSTS_RAW].sort((a, b) =>
  (b.published || "").localeCompare(a.published || "")
);

export function getPost(slug: string) {
  return POSTS_INDEX.find((p) => p.slug === slug);
}

/** the three most recent posts that are not the one being read */
export function relatedTo(slug: string, n = 3) {
  return POSTS_INDEX.filter((p) => p.slug !== slug).slice(0, n);
}
