import type { Metadata } from "next";
import ArticleLd from "../../../components/ArticleLd";

/* Per-post metadata. The page itself is a client component, so title,
   description and share image live here. */
export const metadata: Metadata = {
  title: "הצ׳טבוט האנושי שלך - על שלט חוצות אחד בסן פרנסיסקו",
  description: "מה שלט חוצות ב-6,000 דולר בפינת השישי ופולסום בסן פרנסיסקו מגלה על מה שאנחנו באמת מוכנים למסור למכונה.",
  alternates: { canonical: "/blog/human-chatbot" },
  openGraph: {
    type: "article",
    locale: "he_IL",
    url: "/blog/human-chatbot",
    siteName: "עמית ברין",
    title: "הצ׳טבוט האנושי שלך",
    description: "מה שלט חוצות ב-6,000 דולר בפינת השישי ופולסום בסן פרנסיסקו מגלה על מה שאנחנו באמת מוכנים למסור למכונה.",
    images: [{ url: "/media/og/og-human-chatbot.jpg", width: 1200, height: 630, alt: "שלט חוצות של ChatTJB.org בפינת רחוב בסן פרנסיסקו" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@amit_brin",
    title: "הצ׳טבוט האנושי שלך",
    description: "מה שלט חוצות ב-6,000 דולר בפינת השישי ופולסום בסן פרנסיסקו מגלה על מה שאנחנו באמת מוכנים למסור למכונה.",
    images: ["/media/og/og-human-chatbot.jpg"],
  },
};

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArticleLd slug="human-chatbot" />
      {children}
    </>
  );
}
