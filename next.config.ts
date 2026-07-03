import type { NextConfig } from "next";

const GORLIN_HOSTS = ["gorlin.help", "www.gorlin.help"];

const nextConfig: NextConfig = {
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
