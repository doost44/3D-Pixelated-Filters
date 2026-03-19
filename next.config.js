/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const repoName = '3D-Pixelated-Filters'

const nextConfig = {
  output: 'export',
  ...(isProd
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
      }
    : {}),
}
module.exports = nextConfig
