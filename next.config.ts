import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
      dangerouslyAllowSVG: true,
      // This skips Next.js Image Optimization API
      unoptimized: true,
      // Setting domains is no longer needed with unoptimized: true, but keep it for reference
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
          pathname: '**',
        },
        {
          protocol: 'http',
          hostname: '**',
          pathname: '**',
        }
      ]
    },
    // HTTP Keep-Alive option
    httpAgentOptions: {
      keepAlive: true
    }
};

export default nextConfig;
