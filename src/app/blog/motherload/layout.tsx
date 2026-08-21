import type { Metadata } from "next";
import ArticleLd from "../../../components/ArticleLd";

/* Per-post metadata. The page itself is a client component, so title,
   description and share image live here. */
export const metadata: Metadata = {
  title: "Mother Load - המסמך החשבונאי שאף רואה חשבון לא יחתום עליו",
  description: "רייצ׳ל מאני הדפיסה את החשבון הפתוח של אימהות יוצרות — פוסטרים, קבלה אחת ארוכה, ומסה. על עיצוב ככלי טיעון.",
  alternates: { canonical: "/blog/motherload" },
  openGraph: {
    type: "article",
    locale: "he_IL",
    url: "/blog/motherload",
    siteName: "עמית ברין",
    title: "Mother Load",
    description: "רייצ׳ל מאני הדפיסה את החשבון הפתוח של אימהות יוצרות — פוסטרים, קבלה אחת ארוכה, ומסה. על עיצוב ככלי טיעון.",
    images: [{ url: "/media/og/og-motherload.png", width: 1200, height: 630, alt: "הפוסטרים של Mother Load תלויים ברחוב" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@amit_brin",
    title: "Mother Load",
    description: "רייצ׳ל מאני הדפיסה את החשבון הפתוח של אימהות יוצרות — פוסטרים, קבלה אחת ארוכה, ומסה. על עיצוב ככלי טיעון.",
    images: ["/media/og/og-motherload.png"],
  },
};

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArticleLd slug="motherload" />
      {children}
    </>
  );
}
