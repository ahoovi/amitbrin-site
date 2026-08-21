import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
import { POSTS_INDEX } from "../components/postsIndex";

/**
 * Indexable URLs only. /site is deliberately absent: it is a near-duplicate of
 * / and carries a canonical back to it (see src/app/site/layout.tsx).
 * The posts come from the same registry that feeds the cards, the RSS feed and
 * llms.txt — one source, not four.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const dateOf = (v?: string) => (v ? new Date(v) : now);

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...POSTS_INDEX.map((p) => ({
      url: `${SITE_URL}${p.href}`,
      lastModified: dateOf(p.modified || p.published),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
