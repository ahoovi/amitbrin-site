import type { Metadata } from "next";
import JsonLd from "../../components/JsonLd";
import BlogIndex from "./BlogIndex";
import { POSTS_INDEX } from "../../components/postsIndex";
import { SITE_URL, SITE_NAME, AUTHOR_ID, OG_DEFAULT } from "../../lib/site";

export const metadata: Metadata = {
  title: "תרחיב - כתיבה על עיצוב וחוויית שימוש",
  description:
    "הבלוג של עמית ברין: מחשבות על עיצוב, מוצר, טיפוגרפיה ובינה מלאכותית - מתוך עשייה, לא מתוך סיכום.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "תרחיב — הבלוג של עמית ברין" }] },
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "/blog",
    siteName: SITE_NAME,
    title: "תרחיב - כתיבה על עיצוב וחוויית שימוש",
    description:
      "מחשבות על עיצוב, מוצר, טיפוגרפיה ובינה מלאכותית - מתוך עשייה, לא מתוך סיכום.",
    images: [{ url: OG_DEFAULT, width: 1200, height: 630, alt: "תרחיב — הבלוג של עמית ברין" }],
  },
  twitter: { card: "summary_large_image", creator: "@amit_brin", images: [OG_DEFAULT] },
};

export default function BlogPage() {
  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: "תרחיב",
    description:
      "כתיבה על עיצוב, מוצר, טיפוגרפיה ובינה מלאכותית — מתוך עשייה, לא מתוך סיכום.",
    inLanguage: "he",
    url: `${SITE_URL}/blog`,
    author: { "@id": AUTHOR_ID },
    publisher: { "@id": AUTHOR_ID },
    blogPost: POSTS_INDEX.map((p) => ({
      "@type": "BlogPosting",
      "@id": `${SITE_URL}${p.href}#article`,
      headline: p.title,
      url: `${SITE_URL}${p.href}`,
      ...(p.published ? { datePublished: p.published } : {}),
    })),
  };
  return (
    <>
      <JsonLd data={blogLd} />
      <BlogIndex />
    </>
  );
}
