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
      <head>
        {/*
          The webfonts used to be pulled in by an @import inside each page's
          inline <style>. An @import is invisible to the browser's preload
          scanner: it is only discovered after the stylesheet is parsed, which
          puts a whole new connection to fonts.googleapis.com on the critical
          path. On slow mobile that cost about 1.8 seconds. As real link tags
          in the head they are found in the first bytes of the document and
          fetched in parallel with everything else. Same fonts, same weights.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Alef:wght@400;700&family=Noto+Sans+Hebrew:wght@400;500;600;700&display=swap"
        />
      </head>
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
