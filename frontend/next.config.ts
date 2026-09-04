import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server output used by the Docker runtime stage
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.prismic.io",
      },
      {
        protocol: "https",
        hostname: "jaipur.manipal.edu",
      },
    ],
  },
  async redirects() {
    // Pages used to live under /dashboard/*; keep old links and bookmarks working.
    return [
      { source: "/dashboard", destination: "/login", permanent: true },
      { source: "/dashboard/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
