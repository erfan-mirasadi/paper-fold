import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.109"],
  async headers() {
    return [
      {
        // The background-music bed is content-stable: a track's bytes never
        // change under its name, so let a returning reader keep every piece
        // they've already heard instead of fetching it again.
        source: "/bg-music/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
