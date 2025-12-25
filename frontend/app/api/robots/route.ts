import { NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function GET() {
  const robotsTxt = `# *
User-agent: *
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# Host
Host: ${BASE_URL}

# Crawl-delay
Crawl-delay: 10

# Disallow
Disallow: /admin/
Disallow: /api/
Disallow: /*/edit$
Disallow: /*/delete$

# Allow important pages
Allow: /blog/
Allow: /category/
Allow: /author/

# Googlebot specific
User-agent: Googlebot
Allow: /
Crawl-delay: 5

# Bingbot
User-agent: bingbot
Allow: /
Crawl-delay: 10

# Bad bots
User-agent: MJ12bot
Disallow: /

User-agent: AhrefsBot
Crawl-delay: 30

# Development
${process.env.NODE_ENV === 'development' ? 'Disallow: /' : ''}`

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}