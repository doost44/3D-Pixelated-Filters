/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const repoFromEnv = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : ''
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH || repoFromEnv || ''
const basePathSegment = configuredBasePath ? configuredBasePath.replace(/^\/|\/$/g, '') : ''

const nextConfig = {
  output: 'export',
  ...(isProd && basePathSegment
    ? {
        basePath: `/${basePathSegment}`,
        assetPrefix: `/${basePathSegment}/`,
      }
    : {}),
}
module.exports = nextConfig
