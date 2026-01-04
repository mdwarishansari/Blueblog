import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, Tag, Share2, Facebook, Twitter, Linkedin, Clock } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { generateSEO, generateJSONLD } from '@/lib/seo'
import { formatDate, formatDateTime } from '@/lib/utils'
import { getOptimizedImageUrl } from '@/lib/cloudinary'
import { Button } from '@/components/ui/Button'

async function getPost(slug: string) {
  return await prisma.post.findUnique({
    where: { 
      slug,
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          bio: true,
          profileImage: true,
        },
      },
      bannerImage: true,
      categories: true,
    },
  })
}

async function getRelatedPosts(postId: string, categoryIds: string[]) {
  return await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
      id: { not: postId },
      categories: {
        some: {
          id: { in: categoryIds },
        },
      },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
      bannerImage: true,
      categories: true,
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  })
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  if (!post) {
    return generateSEO()
  }

  const imageUrl = post.bannerImage?.url
    ? getOptimizedImageUrl(post.bannerImage.url, 1200, 630)
    : undefined

  return generateSEO({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    image: imageUrl,
    url: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt?.toISOString(),
    author: post.author.name,
    tags: post.categories.map(cat => cat.name),
  })
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
    },
    select: { slug: true },
  })
  
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(
    post.id,
    post.categories.map(cat => cat.id)
  )

  const imageUrl = post.bannerImage?.url
    ? getOptimizedImageUrl(post.bannerImage.url, 1200, 400)
    : null

  const jsonLd = generateJSONLD({
    title: post.title,
    description: post.excerpt || undefined,
    image: post.bannerImage?.url,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    type: 'Article',
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt?.toISOString(),
    author: {
      name: post.author.name,
    },
  })

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
  const shareText = `Check out: ${post.title}`
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {imageUrl && (
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={post.bannerImage?.altText || post.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>
          )}
          
          <div className="relative py-20">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-3xl text-white">
                {/* Categories */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm hover:bg-white/30"
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      {category.name}
                    </Link>
                  ))}
                </div>
                
                <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
                  {post.title}
                </h1>
                
                {post.excerpt && (
                  <p className="mb-8 text-xl opacity-90">{post.excerpt}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-400" />
                    <div>
                      <div className="font-medium">{post.author.name}</div>
                      <div className="text-sm opacity-80">Author</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.publishedAt?.toISOString()}>
                      {post.publishedAt ? formatDate(post.publishedAt) : 'Not published'}
                    </time>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>5 min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
                
                {/* Share Buttons */}
                <div className="mt-12 border-t pt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-700">Share this article:</span>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                        aria-label="Share on Twitter"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                        aria-label="Share on Facebook"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                      <a
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                        aria-label="Share on LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Author Bio */}
              <div className="mt-8 rounded-2xl border bg-white p-8 shadow-lg">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-600 to-primary-400" />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-900">{post.author.name}</h3>
                    <p className="mt-2 text-gray-600">
                      {post.author.bio || 'Writer at BlueBlog sharing insights and stories.'}
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                      Published on {post.publishedAt ? formatDateTime(post.publishedAt) : 'Draft'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-12">
                  <h2 className="mb-8 text-2xl font-bold text-gray-900">Related Articles</h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    {relatedPosts.map((relatedPost) => (
                      <article key={relatedPost.id} className="rounded-xl border bg-white p-6 shadow-sm">
                        <Link href={`/blog/${relatedPost.slug}`} className="group">
                          <h3 className="mb-3 text-lg font-bold text-gray-900 group-hover:text-primary-600">
                            {relatedPost.title}
                          </h3>
                          <p className="mb-4 text-gray-600 line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{relatedPost.author.name}</span>
                            </div>
                            <div>
                              {relatedPost.publishedAt && formatDate(relatedPost.publishedAt)}
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to Blog */}
              <div className="mt-12 text-center">
                <Link href="/blog">
                  <Button variant="outline" className="gap-2">
                    ← Back to Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}