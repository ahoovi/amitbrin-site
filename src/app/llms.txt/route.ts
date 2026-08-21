import { SITE_URL } from "../../lib/site";
import { POSTS_INDEX } from "../../components/postsIndex";

/**
 * llms.txt — generated from the same registry as the sitemap so it cannot
 * go stale. Calibrated expectation: Google says outright that it ignores this
 * file. The value is in the other engines. Zero cost, no downside, and no
 * reason to expect it to move anything in Google.
 */
export const dynamic = "force-static";

export function GET() {
  const lines = [
    "# עמית ברין — עיצוב, חשיבה עיצובית ובינה יוצרת",
    "",
    "מעצב תקשורת חזותית ומרצה. עשור של הוראת UX/UI ועיצוב גרפי, הפקות דפוס מורכבות,",
    "עיצוב ספרים ואריזות, ועבודה עם בינה יוצרת כשותפה ביקורתית ולא כקיצור דרך.",
    "",
    "## עיקרי האתר",
    "",
    `- [עמוד הבית](${SITE_URL}/): פורטפוליו, קייס סטאדיז, הספרייה של תה, וכתיבה על עיצוב.`,
    `- [תרחיב — הבלוג](${SITE_URL}/blog): כתיבה על עיצוב, מוצר, טיפוגרפיה ובינה מלאכותית, מתוך עשייה.`,
    "",
    "## פוסטים",
    "",
    ...POSTS_INDEX.map((p) => `- [${p.title}](${SITE_URL}${p.href}): ${p.description}`),
    "",
    "## קשר",
    "",
    "- LinkedIn: https://www.linkedin.com/in/amit-brin",
    "- Behance: https://www.behance.net/amitbrin",
    "- X: https://x.com/amit_brin",
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
