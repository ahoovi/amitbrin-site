import type { Metadata } from "next";
import ArticleLd from "../../../components/ArticleLd";

/* Per-post metadata. The page itself is a client component, so title,
   description and share image live here. The OG image is the cover cropped
   to 1200x630 — it is what WhatsApp / LinkedIn / X show next to a shared
   quote or link. */
const DESC = "״טעם״ הפך למונח החם של השנה כשכולם רוויים בסלופ. פוסט שמייצר לעצמו עיצוב חדש בלחיצה — וכל פעם יוצא ״עיצוב״ שלא קרא את הטקסט.";

export const metadata: Metadata = {
  title: "מה הטעם לעצב בלי טעם?",
  description: DESC,
  alternates: { canonical: "/blog/taste" },
  openGraph: {
    type: "article",
    locale: "he_IL",
    url: "/blog/taste",
    siteName: "עמית ברין",
    title: "מה הטעם לעצב בלי טעם?",
    description: DESC,
    images: [{ url: "/media/og/og-taste.png", width: 1200, height: 630, alt: "דיאלוג Mac OS X Aqua: מה הטעם לעצב בלי טעם? You cannot undo this action." }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@amit_brin",
    title: "מה הטעם לעצב בלי טעם?",
    description: DESC,
    images: ["/media/og/og-taste.png"],
  },
};

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArticleLd slug="taste" />
      {children}
    </>
  );
}
