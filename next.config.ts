import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", has: [{ type: "host", value: "gorlin.help" }], destination: "/gorlin" },
        { source: "/", has: [{ type: "host", value: "www.gorlin.help" }], destination: "/gorlin" },
      ],
    };
  },
};

export default nextConfig;
