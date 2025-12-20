import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = []
const domains: string[] = []

if (supabaseUrl) {
  try {
    const host = new URL(supabaseUrl).host
    remotePatterns = [
      {
        protocol: 'https',
        hostname: host,
        pathname: '/storage/v1/object/public/*',
      },
    ]
    domains.push(host)
  } catch {
    remotePatterns = []
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    domains,
  },
  transpilePackages: ['pdfjs-dist'],
};

export default nextConfig;
