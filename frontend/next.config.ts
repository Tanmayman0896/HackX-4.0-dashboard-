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
};

export default nextConfig;
