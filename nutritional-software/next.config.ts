import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Explicitly set root so Turbopack doesn't pick up a parent package-lock.json as the workspace root
  turbopack: {
    root: path.resolve(__dirname),
  },
  webpack: (config) => {
    config.externals.push({ "better-sqlite3": "commonjs better-sqlite3" });
    return config;
  },
};

export default nextConfig;
