"use client"
import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  schema?: any;
}

export default function SEO({
  title,
  description,
  canonical,
  ogImage = process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  schema,
}: SEOProps) {
  const siteTitle = process.env.NEXT_PUBLIC_SITE_NAME || 'Blog Platform';
  const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const seoTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const seoDescription = description || siteDescription;
  const seoImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const seoCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;

  return (
    <Head>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={seoCanonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoCanonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      {process.env.NEXT_PUBLIC_TWITTER_HANDLE && (
        <meta name="twitter:site" content={process.env.NEXT_PUBLIC_TWITTER_HANDLE} />
      )}
      
      {/* Schema.org */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  );
}