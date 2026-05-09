import type { NextConfig } from "next";

const GORLIN_HOSTS = ["gorlin.help", "www.gorlin.help"];

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: GORLIN_HOSTS.flatMap((host) => [
        // Map gorlin.help/ → /gorlin/ (with implicit index.html)
        {
          source: "/",
          has: [{ type: "host", value: host }],
          destination: "/gorlin/index.html",
        },
        // Map gorlin.help/anything → /gorlin/anything
        {
          source: "/:path*",
          has: [{ type: "host", value: host }],
          destination: "/gorlin/:path*",
        },
      ]),
    };
  },
};

export default nextConfig;
