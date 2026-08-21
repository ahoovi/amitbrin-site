/**
 * One registry for the blog. The related-posts rail at the end of every post
 * reads from here, so a new post is a single edit.
 * Titles and intros are the same ones used on the one-pager's blog rail.
 */
export type PostRef = { slug: string; href: string; cover: string; title: string; intro: string };

export const POSTS_INDEX: PostRef[] = [
  {
    slug: "instagram",
    href: "/blog/instagram",
    cover: "/media/blog/instagram/cover.jpg",
    title: "כשהמשתמשים שלך לא יודעים לקרוא את השם שלך",
    intro: "אז השבוע הם שינו את הלוגו שלהם. לכאורה עוד ״ריענון למותג״… אבל זה הכיל בתוכו שינוי מהותי.",
  },
  {
    slug: "chattjb",
    href: "/blog/chattjb",
    cover: "/media/blog/chattjb/billboard-hero.jpg",
    title: "הצ׳טבוט האנושי שלך",
    intro:
      "בפינת הרחובות השישי ופולסום בסן פרנסיסקו יש שלט חוצות בעלות 6,000 דולר שמבטיח לכם את ממשק הצ'אט המוביל, המופעל על ידי AI.",
  },
  {
    slug: "pri-etz-hadaat",
    href: "/blog/pri-etz-hadaat",
    cover: "/media/blog/pri-etz-hadaat/snakes-cover.jpg",
    title: "פרי עץ הדעת",
    intro: "לפני כמה ימים לקוח סרב לקבל ממני עבודה כי היא יצירה של בינה מלאכותית (כך הוא טען).",
  },
  {
    slug: "motherload",
    href: "/blog/motherload",
    cover: "/media/blog/motherload/cover.jpg",
    title: "Mother Load",
    intro:
      "יש מסמך חשבונאי אחד שאף רואה חשבון לא יחתום עליו, והוא נפתח כל ערב ב־23:00 בראש של כל אמא יוצרת.",
  },
  {
    slug: "whatsapp",
    href: "/blog/whatsapp",
    cover: "/media/blog/whatsapp/cover.jpg",
    title: "סליחה ששלחתי וואטסאפ",
    intro: "וואטסאפ היא אפליקציית תקשורת שמשבשת את התקשורת האנושית. לא פחות.",
  },
];

/** the three most recent posts that are not the one being read */
export function relatedTo(slug: string, n = 3) {
  return POSTS_INDEX.filter((p) => p.slug !== slug).slice(0, n);
}
