/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  env: {
    siteName: process.env['NEXT_PUBLIC_SITE_NAME'],
    siteUrl: process.env['NEXT_PUBLIC_SITE_URL'],
    JWT_ACCESS_SECRET: process.env['JWT_ACCESS_SECRET'],
    JWT_REFRESH_SECRET: process.env['JWT_REFRESH_SECRET'],
  },
}

module.exports = nextConfig