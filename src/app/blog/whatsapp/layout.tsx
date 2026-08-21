import type { Metadata } from "next";
import ArticleLd from "../../../components/ArticleLd";

/* Per-post metadata. The page itself is a client component, so title,
   description and share image live here. */
export const metadata: Metadata = {
  title: "סליחה ששלחתי וואטסאפ - ביקורת עיצובית על אפליקציה ששברה את גבולותיה",
  description: "ווטסאפ היא אפליקציית תקשורת שמשבשת תקשורת אנושית. ניתוח של מוצר שהמשתמשים שברו את התקרה שלו, והוא שבר את הגבולות שלהם.",
  alternates: { canonical: "/blog/whatsapp" },
  openGraph: {
    type: "article",
    locale: "he_IL",
    url: "/blog/whatsapp",
    siteName: "עמית ברין",
    title: "סליחה ששלחתי וואטסאפ",
    description: "ווטסאפ היא אפליקציית תקשורת שמשבשת תקשורת אנושית. ניתוח של מוצר שהמשתמשים שברו את התקרה שלו, והוא שבר את הגבולות שלהם.",
    images: [{ url: "/media/og/og-whatsapp.png", width: 1200, height: 630, alt: "שיחת וואטסאפ פתוחה על רקע הטפט המוכר" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@amit_brin",
    title: "סליחה ששלחתי וואטסאפ",
    description: "ווטסאפ היא אפליקציית תקשורת שמשבשת תקשורת אנושית. ניתוח של מוצר שהמשתמשים שברו את התקרה שלו, והוא שבר את הגבולות שלהם.",
    images: ["/media/og/og-whatsapp.png"],
  },
};

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArticleLd slug="whatsapp" />
      {children}
    </>
  );
}
