import { notFound } from 'next/navigation'
import { postApi } from '@/lib/api/posts'
import { categoryApi } from '@/lib/api/categories'
import BlogContent from '@/components/blog/BlogContent'
import RelatedPosts from '@/components/blog/RelatedPosts'
import AuthorBio from '@/components/blog/AuthorBio'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import SEO from '@/components/seo/SEO'
import { FiCalendar, FiClock, FiEye, FiTag } from 'react-icons/fi'
import { formatDate } from '@/lib/utils/formatDate'

interface PageProps {
  params: {
    slug: string
  }
}

// Generate static params for popular posts
export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts?status=PUBLISHED&limit=20&sort=-views`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    const posts = data.data || []
    
    return posts.map((post: any) => ({
      slug: post.slug,
    }))
  } catch (error) {
    return []
  }
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const post = await getPost(params.slug)
    
    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.',
      }
    }
    
    return {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      openGraph: {
        type: 'article',
        publishedTime: post.published_at,
        authors: [post.author?.name],
        tags: post.categories?.map((cat: any) => cat.name),
      },
    }
  } catch (error) {
    return {
      title: 'Error',
      description: 'An error occurred while loading the post.',
    }
  }
}

async function getPost(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts/slug/${slug}`,
      { next: { revalidate: 60 } } // ISR: revalidate every 60 seconds
    )
    
    if (!response.ok) return null
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

async function getRelatedPosts(postId: string, categoryIds: string[]) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/related?limit=3`,
      { next: { revalidate: 300 } }
    )
    
    if (!response.ok) return []
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }
  
  const relatedPosts = await getRelatedPosts(
    post.id,
    post.categories?.map((cat: any) => cat.id) || []
  )
  
  // Calculate reading time (approx 200 words per minute)
  const wordCount = JSON.stringify(post.content).split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)
  
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seo_description || post.excerpt,
    image: post.banner_image?.url,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Person',
      name: post.author?.name,
      description: post.author?.bio,
    },
    publisher: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    },
  }

  return (
    <>
      <SEO
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        canonical={`/blog/${post.slug}`}
        ogImage={post.banner_image?.url}
        ogType="article"
        schema={schemaData}
      />
      
      <article className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            ...(post.categories?.[0] ? [
              { 
                label: post.categories[0].name, 
                href: `/category/${post.categories[0].slug}` 
              }
            ] : []),
            { label: post.title, href: `/blog/${post.slug}`, current: true },
          ]}
        />
        
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <img
                src={post.author?.profile_image || '/default-avatar.png'}
                alt={post.author?.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <span className="font-medium text-gray-900">{post.author?.name}</span>
                <div className="text-sm flex items-center gap-2">
                  <FiCalendar size={14} />
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6 ml-4 border-l pl-6">
              <div className="flex items-center gap-2">
                <FiClock size={18} />
                <span>{readingTime} min read</span>
              </div>
              
              <div className="flex items-center gap-2">
                <FiEye size={18} />
                <span>1.2K views</span>
              </div>
            </div>
          </div>
          
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((category: any) => (
                <a
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm hover:bg-primary-100 transition-colors"
                >
                  <FiTag size={14} />
                  {category.name}
                </a>
              ))}
            </div>
          )}
          
          {/* Featured Image */}
          {post.banner_image && (
            <div className="relative rounded-2xl overflow-hidden mb-8">
              <img
                src={post.banner_image.url}
                alt={post.banner_image.alt_text || post.title}
                width={1200}
                height={630}
                className="w-full h-auto object-cover"
              />
              {post.banner_image.caption && (
                <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                  {post.banner_image.caption}
                </figcaption>
              )}
            </div>
          )}
        </div>
        
        {/* Blog Content */}
        <div className="prose prose-lg max-w-none">
          <BlogContent content={post.content} />
        </div>
        
        {/* Author Bio */}
        <div className="mt-12 pt-8 border-t">
          <AuthorBio author={post.author} />
        </div>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <RelatedPosts posts={relatedPosts} currentPostId={post.id} />
          </div>
        )}
        
        {/* Comments Section (Optional) */}
        {process.env.NEXT_PUBLIC_ENABLE_COMMENTS === 'true' && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-2xl font-bold mb-6">Comments</h3>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Comments feature coming soon!</p>
              <button className="btn-primary">
                Enable Notifications for Comments
              </button>
            </div>
          </div>
        )}
      </article>
    </>
  )
}