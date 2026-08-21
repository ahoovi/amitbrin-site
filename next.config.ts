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
