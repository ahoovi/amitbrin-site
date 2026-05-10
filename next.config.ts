import type { NextConfig } from "next";

const GORLIN_HOSTS = ["gorlin.help", "www.gorlin.help"];

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: GORLIN_HOSTS.flatMap((host) => [
        // Root → /gorlin (Next serves public/gorlin/index.html)
        { source: "/", has: [{ type: "host", value: host }], destination: "/gorlin" },
        // SEO assets — gorlin.help/robots.txt → public/gorlin/robots.txt, etc.
        { source: "/robots.txt", has: [{ type: "host", value: host }], destination: "/gorlin/robots.txt" },
        { source: "/sitemap.xml", has: [{ type: "host", value: host }], destination: "/gorlin/sitemap.xml" },
        { source: "/og-image.svg", has: [{ type: "host", value: host }], destination: "/gorlin/og-image.svg" },
      ]),
    };
  },
};

export default nextConfig;
