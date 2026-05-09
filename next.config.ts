import type { NextConfig } from "next";

const GORLIN_HOSTS = ["gorlin.help", "www.gorlin.help"];

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: GORLIN_HOSTS.flatMap((host) => [
        // gorlin.help/  →  /gorlin (Next serves public/gorlin/index.html)
        {
          source: "/",
          has: [{ type: "host", value: host }],
          destination: "/gorlin",
        },
        // gorlin.help/anything  →  /gorlin/anything
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
