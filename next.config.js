/** @type {import('next').NextConfig} */
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserOrOrgPagesRepo = repositoryName
  .toLowerCase()
  .endsWith(".github.io");
const pagesBasePath = process.env.PAGES_BASE_PATH ?? "";
const fallbackBasePath =
  isGitHubActions && !isUserOrOrgPagesRepo ? `/${repositoryName}` : "";
const basePath = pagesBasePath || fallbackBasePath;

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath || undefined,
};
module.exports = nextConfig;
