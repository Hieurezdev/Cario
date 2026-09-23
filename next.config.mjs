/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Keep verification builds and parallel development servers off the same cache.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
