import type { NextConfig } from "next";

// GitHub Pages 在 https://<user>.github.io/<repo>/ 提供服務，需要 basePath
// 在 GitHub Actions 中自動由 GITHUB_REPOSITORY 取得 repo 名稱
// 本機 dev 不套用，所以 localhost:3000 行為不變
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isGithubPages = process.env.GITHUB_ACTIONS === "true" && !!repoName;

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: isGithubPages ? `/${repoName}` : "",
  assetPrefix: isGithubPages ? `/${repoName}/` : "",
};

export default nextConfig;
