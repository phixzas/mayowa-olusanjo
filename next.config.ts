import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? "/mayowa-olusanjo" : undefined,
  trailingSlash: isGitHubPages ? true : undefined,
  images: isGitHubPages ? { unoptimized: true } : undefined,
  cacheComponents: !isGitHubPages,
  partialPrefetching: !isGitHubPages,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
