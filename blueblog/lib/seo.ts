import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
}

export function generateSEO({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags = [],
}: SEOProps = {}): Metadata {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'BlueBlog'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const defaultDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern, SEO-optimized blogging platform'
  const defaultImage = `${siteUrl}${process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE || '/og-default.png'}`
  const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@techblog'

  const seoTitle = title ? `${title} | ${siteName}` : siteName
  const seoDescription = description || defaultDescription
  const seoImage = image || defaultImage
  const seoUrl = url || siteUrl

  return {
    title: seoTitle,
    description: seoDescription,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: seoUrl,
      siteName,
      images: [
        {
          url: seoImage,
          width: 1200,
          height: 630,
          alt: seoTitle,
        },
      ],
      type,
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [seoImage],
      creator: twitterHandle,
      site: twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: seoUrl,
    },
  }
}

export function generateJSONLD({
  title,
  description,
  image,
  url,
  type = 'Article',
  publishedTime,
  modifiedTime,
  author,
}: {
  title: string
  description?: string
  image?: string
  url: string
  type?: 'Article' | 'BlogPosting'
  publishedTime?: string
  modifiedTime?: string
  author?: {
    name: string
    url?: string
  }
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const defaultImage = `${siteUrl}${process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE || '/og-default.png'}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    headline: title,
    description: description,
    image: image || defaultImage,
    url: url,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: author && {
      '@type': 'Person',
      name: author.name,
      url: author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME || 'BlueBlog',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
  }

  return JSON.stringify(jsonLd)
}