import type { Metadata } from "next";
import "./globals.css";
import { InkDefs, INK_CSS } from "../components/InkFrame";
import JsonLd from "../components/JsonLd";
import { SITE_URL, SITE_NAME, OG_DEFAULT, PERSON_LD } from "../lib/site";

/**
 * Root metadata does double duty: the shared defaults every route inherits
 * (metadataBase, siteName, locale, twitter card) AND the home page's own
 * title/description — `/` is a client component and cannot export metadata of
 * its own. Every other route overrides the title, description and canonical.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "עמית ברין - עיצוב, חשיבה עיצובית ובינה יוצרת",
  description:
    "מעצב תקשורת חזותית ומרצה. עשור של הוראת UX/UI ועיצוב גרפי, הפקות דפוס מורכבות, ועבודה עם בינה יוצרת כשותפה ביקורתית ולא כקיצור דרך.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: SITE_NAME,
    url: "/",
    title: "עמית ברין - עיצוב, חשיבה עיצובית ובינה יוצרת",
    description:
      "מעצב תקשורת חזותית ומרצה. עשור של הוראת UX/UI ועיצוב גרפי, הפקות דפוס מורכבות, ועבודה עם בינה יוצרת כשותפה ביקורתית ולא כקיצור דרך.",
    images: [{ url: OG_DEFAULT, width: 1200, height: 630, alt: "עמית ברין — עיצוב, חשיבה עיצובית ובינה יוצרת" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@amit_brin",
    images: [OG_DEFAULT],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased min-h-screen">
        {/* the ink filters + the frame CSS, mounted once for every route */}
        <style>{INK_CSS}</style>
        <InkDefs />
        {/* the Person entity: what ties the scattered profiles into one thing */}
        <JsonLd data={PERSON_LD} />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
