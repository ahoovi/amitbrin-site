import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

/**
 * Nothing that matters is blocked — in particular NOT GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended or CCBot. Until this file existed there was
 * no robots.txt at all, which is the only reason they were not blocked; one
 * careless line here would erase the site from every AI engine at once.
 *
 * Note: gorlin.help is served from this same app and gets its own robots.txt
 * through the host rewrite in next.config.ts, so this file only ever answers
 * for amitbrin.com.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/_next/", "/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
