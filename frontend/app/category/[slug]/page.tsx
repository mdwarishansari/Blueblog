import { notFound } from 'next/navigation'
import { categoryApi } from '@/lib/api/categories'
import { postApi } from '@/lib/api/posts'
import BlogCard from '@/components/blog/BlogCard'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import SEO from '@/components/seo/SEO'
import { FiGrid, FiList, FiFilter } from 'react-icons/fi'
import { Suspense } from 'react'
import Loading from '@/components/ui/Loading'

interface PageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
    view?: 'grid' | 'list'
  }
}

export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    const categories = data.data || []
    
    return categories.map((category: any) => ({
      slug: category.slug,
    }))
  } catch (error) {
    return []
  }
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const category = await getCategory(params.slug)
    
    if (!category) {
      return {
        title: 'Category Not Found',
        description: 'The requested category could not be found.',
      }
    }
    
    return {
      title: `${category.name} - Blog Posts`,
      description: `Explore ${category.post_count || 0} articles about ${category.name}`,
    }
  } catch (error) {
    return {
      title: 'Error',
      description: 'An error occurred while loading the category.',
    }
  }
}

async function getCategory(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories/slug/${slug}`,
      { next: { revalidate: 300 } } // ISR every 5 minutes
    )
    
    if (!response.ok) return null
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

async function getCategoryPosts(slug: string, page = 1) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}/posts?page=${page}&limit=12&status=PUBLISHED&sort=-published_at`,
      { next: { revalidate: 60 } } // ISR every minute
    )
    
    if (!response.ok) return { data: [], pagination: null }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching category posts:', error)
    return { data: [], pagination: null }
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = await getCategory(params.slug)
  
  if (!category) {
    notFound()
  }
  
  const page = parseInt(searchParams.page || '1')
  const view = searchParams.view || 'grid'
  const postsData = await getCategoryPosts(params.slug, page)
  const posts = postsData.data || []
  const pagination = postsData.pagination
  
  return (
    <>
      <SEO
        title={`${category.name} Articles`}
        description={`Browse ${category.post_count || 0} articles about ${category.name}`}
        canonical={`/category/${category.slug}`}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Categories', href: '/categories' },
            { label: category.name, href: `/category/${category.slug}`, current: true },
          ]}
        />
        
        {/* Category Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
            <span className="text-2xl font-bold">{category.name.charAt(0)}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{category.name}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our collection of {category.post_count || 0} articles about {category.name}.
            Stay updated with the latest insights and tutorials.
          </p>
        </div>
        
        {/* View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {pagination?.total || 0} Articles Found
            </h2>
            <p className="text-sm text-gray-600">
              Page {page} of {pagination?.pages || 1}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">View:</label>
              <div className="flex border rounded-lg overflow-hidden">
                <a
                  href={`?view=grid${page > 1 ? `&page=${page}` : ''}`}
                  className={`p-2 border-r ${view === 'grid' ? 'bg-primary-50 text-primary-600' : 'bg-white text-gray-600'}`}
                >
                  <FiGrid size={20} />
                </a>
                <a
                  href={`?view=list${page > 1 ? `&page=${page}` : ''}`}
                  className={`p-2 ${view === 'list' ? 'bg-primary-50 text-primary-600' : 'bg-white text-gray-600'}`}
                >
                  <FiList size={20} />
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FiFilter size={18} className="text-gray-500" />
              <select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Latest</option>
                <option>Most Popular</option>
                <option>Most Viewed</option>
                <option>A-Z</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Posts Grid/List */}
        <Suspense fallback={<Loading />}>
          {posts.length > 0 ? (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post: any) => (
                    <BlogCard key={post.id} post={post} variant="default" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post: any) => (
                    <BlogCard key={post.id} post={post} variant="compact" />
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center gap-2">
                    {page > 1 && (
                      <a
                        href={`?page=${page - 1}${view !== 'grid' ? `&view=${view}` : ''}`}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Previous
                      </a>
                    )}
                    
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum
                      if (pagination.pages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }
                      
                      return (
                        <a
                          key={pageNum}
                          href={`?page=${pageNum}${view !== 'grid' ? `&view=${view}` : ''}`}
                          className={`px-4 py-2 border rounded-lg ${
                            page === pageNum
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </a>
                      )
                    })}
                    
                    {page < pagination.pages && (
                      <a
                        href={`?page=${page + 1}${view !== 'grid' ? `&view=${view}` : ''}`}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Next
                      </a>
                    )}
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FiGrid size={24} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                No articles have been published in this category yet. Check back soon!
              </p>
            </div>
          )}
        </Suspense>
        
        {/* Category Description */}
        <div className="mt-16 p-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About {category.name}</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              This category features articles about {category.name}. Our writers cover various 
              aspects including tutorials, best practices, industry trends, and expert insights.
              Whether you're a beginner or an experienced professional, you'll find valuable 
              content to enhance your knowledge.
            </p>
            <p className="text-gray-700 mt-4">
              Subscribe to our newsletter to get notified when new articles are published in 
              this category. You can also follow specific authors to get personalized updates.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <button className="btn-primary">
              Subscribe to Category
            </button>
            <button className="btn-secondary">
              Follow Category
            </button>
          </div>
        </div>
      </div>
    </>
  )
}