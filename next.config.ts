import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  images: {
    // DiceBear is the avatar fallback for stylists/users (see lib/avatar.ts).
    // Its avatars are SVG, so allow SVG but sandbox it with a strict CSP.
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
