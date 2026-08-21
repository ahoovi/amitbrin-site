import { SITE_URL, SITE_NAME } from "../../../lib/site";
import { POSTS_INDEX } from "../../../components/postsIndex";

export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = POSTS_INDEX.map((p) => {
    const date = p.published || p.modified;
    return [
      "    <item>",
      `      <title>${esc(p.title)}</title>`,
      `      <link>${SITE_URL}${p.href}</link>`,
      `      <guid isPermaLink="true">${SITE_URL}${p.href}</guid>`,
      `      <description>${esc(p.description)}</description>`,
      date ? `      <pubDate>${new Date(date).toUTCString()}</pubDate>` : "",
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n");
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>תרחיב — הבלוג של ${esc(SITE_NAME)}</title>
    <link>${SITE_URL}/blog</link>
    <description>כתיבה על עיצוב, מוצר, טיפוגרפיה ובינה מלאכותית — מתוך עשייה, לא מתוך סיכום.</description>
    <language>he</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
