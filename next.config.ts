import type { NextConfig } from "next";

const GORLIN_HOSTS = ["gorlin.help", "www.gorlin.help"];

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: GORLIN_HOSTS.flatMap((host) => [
        // gorlin.help/  →  /gorlin (root rewrite, exact match)
        {
          source: "/",
          has: [{ type: "host", value: host }],
          destination: "/gorlin",
        },
        // gorlin.help/anything (path+ requires at least 1 char, never matches root)
        {
          source: "/:path+",
          has: [{ type: "host", value: host }],
          destination: "/gorlin/:path+",
        },
      ]),
    };
  },
};

export default nextConfig;
