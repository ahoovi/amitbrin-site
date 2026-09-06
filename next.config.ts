import type { NextConfig } from "next";

const GORLIN_HOSTS = ["gorlin.help", "www.gorlin.help"];

/**
 * The blog slugs were normalised on 21.8.2026 — four English, one Hebrew
 * transliteration became five descriptive English ones. The old paths stay
 * alive permanently: a 301 costs nothing and every link ever shared keeps
 * working. Never remove these.
 */
const SLUG_301: Array<[string, string]> = [
  ["chattjb", "human-chatbot"],
  ["whatsapp", "whatsapp-broke-communication"],
  ["pri-etz-hadaat", "client-refused-ai-work"],
  ["instagram", "instagram-cursive-logo"],
  ["motherload", "mother-load"],
];

/**
 * WordPress leftovers. Search Console reported 30 legacy URLs from the old
 * amitbrin.com WordPress install returning 404 (21.8.2026). Most are tag and
 * category archives with no successor — those stay 404, which is the correct
 * answer for deleted content. Only the handful with a real destination on the
 * new site get a permanent redirect.
 */
const LEGACY_301: Array<[string, string]> = [
  ["/about", "/"],
  ["/main", "/"],
  ["/branding", "/"],
  ["/הבלוג", "/blog"],
  ["/feed", "/blog/rss.xml"],
  ["/סליחה-ששלחתי-וואטסאפ", "/blog/whatsapp-broke-communication"],
];

/**
 * The blog og:image files were converted from PNG to JPEG on 6.9.2026 to cut
 * deployment weight (2.6MB -> 320KB). Links already shared on WhatsApp,
 * LinkedIn and X still point at the .png paths, so a re-scrape would 404
 * without these. og-default.png was deliberately left as PNG and is not here.
 */
const OG_JPEG_301 = [
  "taste",
  "human-chatbot",
  "client-refused-ai-work",
  "mother-load",
  "whatsapp-broke-communication",
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // the nested reading version first — a bare /blog/whatsapp rule would
      // otherwise swallow /blog/whatsapp/classic
      // 301 explicitly, not Next's default 308: both are permanent and Google
      // treats them the same, but 301 is the one every tool and every human
      // reads without a second thought
      {
        source: "/blog/whatsapp/classic",
        destination: "/blog/whatsapp-broke-communication/classic",
        statusCode: 301,
      },
      ...SLUG_301.map(([from, to]) => ({
        source: `/blog/${from}`,
        destination: `/blog/${to}`,
        statusCode: 301,
      })),
      // WordPress leftovers — both with and without the trailing slash
      ...LEGACY_301.flatMap(([from, to]) => [
        { source: from, destination: to, statusCode: 301 as const },
        { source: `${from}/`, destination: to, statusCode: 301 as const },
      ]),
      // og:image PNG -> JPEG conversion, 6.9.2026
      ...OG_JPEG_301.map((name) => ({
        source: `/media/og/og-${name}.png`,
        destination: `/media/og/og-${name}.jpg`,
        statusCode: 301 as const,
      })),
    ];
  },
  async rewrites() {
    return {
      beforeFiles: GORLIN_HOSTS.flatMap((host) => [
        { source: "/", has: [{ type: "host", value: host }], destination: "/gorlin" },
        { source: "/en", has: [{ type: "host", value: host }], destination: "/gorlin/en" },
        { source: "/en/:path*", has: [{ type: "host", value: host }], destination: "/gorlin/en/:path*" },
        { source: "/robots.txt", has: [{ type: "host", value: host }], destination: "/gorlin/robots.txt" },
        { source: "/sitemap.xml", has: [{ type: "host", value: host }], destination: "/gorlin/sitemap.xml" },
        { source: "/og-image.jpg", has: [{ type: "host", value: host }], destination: "/gorlin/og-image.jpg" },
      ]),
    };
  },
};

export default nextConfig;
