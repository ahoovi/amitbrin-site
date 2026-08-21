import type { Metadata } from "next";
import ArticleLd from "../../../components/ArticleLd";

/* Per-post metadata. The page itself is a client component, so title,
   description and share image live here. */
export const metadata: Metadata = {
  title: "פרי עץ הדעת - כשלקוח מסרב לקבל עבודה כי ״זה AI״",
  description: "מה קורה לאמון בין מעצב ללקוח כשההנחה שמשהו נוצר במכונה מספיקה כדי לפסול אותו, בלי לבדוק.",
  alternates: { canonical: "/blog/pri-etz-hadaat" },
  openGraph: {
    type: "article",
    locale: "he_IL",
    url: "/blog/pri-etz-hadaat",
    siteName: "עמית ברין",
    title: "פרי עץ הדעת",
    description: "מה קורה לאמון בין מעצב ללקוח כשההנחה שמשהו נוצר במכונה מספיקה כדי לפסול אותו, בלי לבדוק.",
    images: [{ url: "/media/og/og-pri-etz-hadaat.png", width: 1200, height: 630, alt: "איור נחשים בעבודה על מסך, מתוך הפוסט" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@amit_brin",
    title: "פרי עץ הדעת",
    description: "מה קורה לאמון בין מעצב ללקוח כשההנחה שמשהו נוצר במכונה מספיקה כדי לפסול אותו, בלי לבדוק.",
    images: ["/media/og/og-pri-etz-hadaat.png"],
  },
};

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArticleLd slug="pri-etz-hadaat" />
      {children}
    </>
  );
}
