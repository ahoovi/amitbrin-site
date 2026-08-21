import JsonLd from "./JsonLd";
import { SITE_URL, AUTHOR_ID } from "../lib/site";
import { getPost } from "./postsIndex";

/**
 * Article + BreadcrumbList for one post, read from the shared registry.
 * A post whose date is not yet verified simply carries no datePublished —
 * a missing field beats a guessed one.
 */
export default function ArticleLd({ slug }: { slug: string }) {
  const p = getPost(slug);
  if (!p) return null;
  const url = `${SITE_URL}${p.href}`;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: p.title.slice(0, 110),
    description: p.description,
    image: [`${SITE_URL}${p.ogImage || p.cover}`],
    inLanguage: "he",
    author: { "@id": AUTHOR_ID },
    publisher: { "@id": AUTHOR_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(p.published ? { datePublished: p.published } : {}),
    ...(p.modified ? { dateModified: p.modified } : {}),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ראשי", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "תרחיב", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: p.title, item: url },
    ],
  };

  return <JsonLd data={[article, breadcrumb]} />;
}
