import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true
  }
};

export default nextConfig;
