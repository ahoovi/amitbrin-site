import type { Metadata } from "next";
import ArticleLd from "../../../components/ArticleLd";

/* Per-post metadata (the page itself is a client component, so the
   title / description / share image live here). */
export const metadata: Metadata = {
  metadataBase: new URL("https://www.amitbrin.com"),
  title: "כשהמשתמשים שלך לא יודעים לקרוא את השם שלך – עמית ברין",
  description:
    "אז השבוע הם שינו את הלוגו שלהם. הלוגו הישן היה עשוי מאותיות בסגנון cursive – והנוער של היום כבר לא יודע לקרוא אותיות כאלה.",
  alternates: { canonical: "/blog/instagram" },
  openGraph: {
    type: "article",
    locale: "he_IL",
    url: "/blog/instagram",
    siteName: "עמית ברין",
    title: "כשהמשתמשים שלך לא יודעים לקרוא את השם שלך",
    description:
      "אז השבוע הם שינו את הלוגו שלהם. הלוגו הישן היה עשוי מאותיות בסגנון cursive – והנוער של היום כבר לא יודע לקרוא אותיות כאלה.",
    images: [
      {
        url: "/media/blog/instagram/cover-og.jpg",
        width: 1200,
        height: 630,
        alt: "הלוגו של אינסטגרם בכתב מחובר, בין שתי דמויות בצללית",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "כשהמשתמשים שלך לא יודעים לקרוא את השם שלך",
    description:
      "אז השבוע הם שינו את הלוגו שלהם. הלוגו הישן היה עשוי מאותיות בסגנון cursive – והנוער של היום כבר לא יודע לקרוא אותיות כאלה.",
    images: ["/media/blog/instagram/cover-og.jpg"],
  },
};

export default function InstagramPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ArticleLd slug="instagram" />
      {children}
    </>
  );
}
