import { notFound } from 'next/navigation'
import { userApi } from '@/lib/api/users'
import { postApi } from '@/lib/api/posts'
import BlogCard from '@/components/blog/BlogCard'
import Breadcrumbs from '@/components/seo/Breadcrumbs'
import SEO from '@/components/seo/SEO'
import { FiCalendar, FiMail, FiTwitter, FiLinkedin, FiBook, FiTrendingUp } from 'react-icons/fi'
import { formatDate } from '@/lib/utils/formatDate'
import Image from 'next/image'

interface PageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users?role=WRITER,EDITOR,ADMIN`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    const users = data.data || []
    
    return users.map((user: any) => ({
      slug: user.email.split('@')[0], // Simple slug from email
    }))
  } catch (error) {
    return []
  }
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const author = await getAuthor(params.slug)
    
    if (!author) {
      return {
        title: 'Author Not Found',
        description: 'The requested author could not be found.',
      }
    }
    
    return {
      title: `${author.name} - Author Profile`,
      description: author.bio || `Read articles by ${author.name}`,
    }
  } catch (error) {
    return {
      title: 'Error',
      description: 'An error occurred while loading the author.',
    }
  }
}

async function getAuthor(slug: string) {
  try {
    // In a real app, you'd have an endpoint for author by slug
    // For now, we'll simulate by getting all authors
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users?role=WRITER,EDITOR,ADMIN`,
      { next: { revalidate: 300 } }
    )
    
    if (!response.ok) return null
    const data = await response.json()
    const users = data.data || []
    
    // Find author by slug (using email prefix for demo)
    return users.find((user: any) => 
      user.email.split('@')[0] === slug || 
      user.name.toLowerCase().replace(/\s+/g, '-') === slug
    ) || null
  } catch (error) {
    console.error('Error fetching author:', error)
    return null
  }
}

async function getAuthorPosts(authorId: string, page = 1) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts?author=${authorId}&page=${page}&limit=12&status=PUBLISHED&sort=-published_at`,
      { next: { revalidate: 60 } }
    )
    
    if (!response.ok) return { data: [], pagination: null }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching author posts:', error)
    return { data: [], pagination: null }
  }
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
  const author = await getAuthor(params.slug)
  
  if (!author) {
    notFound()
  }
  
  const page = parseInt(searchParams.page || '1')
  const postsData = await getAuthorPosts(author.id, page)
  const posts = postsData.data || []
  const pagination = postsData.pagination
  
  const stats = {
    totalPosts: pagination?.total || 0,
    totalViews: 12450,
    avgReadTime: 5,
    memberSince: formatDate(author.created_at),
  }

  return (
    <>
      <SEO
  title={`Articles by ${author.name}`}
  description={`Read articles written by ${author.name}.`}
  canonical={`/author/${author.slug}`}
/>

      
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Authors', href: '/authors' },
            { label: author.name, href: `/author/${params.slug}`, current: true },
          ]}
        />
        
        {/* Author Header */}
        <div className="p-8 mb-12 bg-gradient-to-r from-gray-50 to-white rounded-2xl">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            {/* Author Avatar */}
            <div className="relative">
              <div className="w-32 h-32 overflow-hidden border-4 border-white rounded-full shadow-lg">
                <img
                  src={author.profile_image || '/default-avatar.png'}
                  alt={author.name}
                  className="object-cover w-full h-full"
                />
              </div>
              {author.role === 'ADMIN' && (
                <div className="absolute px-3 py-1 text-xs font-bold text-white rounded-full -bottom-2 -right-2 bg-primary-600">
                  Admin
                </div>
              )}
            </div>
            
            {/* Author Info */}
            <div className="flex-1">
              <div className="flex flex-col justify-between gap-4 mb-4 md:flex-row md:items-center">
                <div>
                  <h1 className="mb-2 text-4xl font-bold text-gray-900">
                    {author.name}
                  </h1>
                  <div className="flex items-center gap-4 mb-3 text-gray-600">
                    <span className="flex items-center gap-2">
                      <FiMail size={16} />
                      {author.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <FiCalendar size={16} />
                      Joined {stats.memberSince}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="btn-primary">
                    Follow
                  </button>
                  <button className="btn-secondary">
                    Message
                  </button>
                </div>
              </div>
              
              {/* Bio */}
              {author.bio && (
                <div className="mb-6 prose max-w-none">
                  <p className="text-lg text-gray-700">{author.bio}</p>
                </div>
              )}
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <FiTwitter size={20} className="text-gray-600" />
                </a>
                <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <FiLinkedin size={20} className="text-gray-600" />
                </a>
                <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <FiBook size={20} className="text-gray-600" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Author Stats */}
        <div className="grid grid-cols-2 gap-4 mb-12 md:grid-cols-4">
          <div className="text-center card">
            <div className="mb-2 text-3xl font-bold text-gray-900">
              {stats.totalPosts}
            </div>
            <div className="text-sm text-gray-600">Articles Published</div>
          </div>
          
          <div className="text-center card">
            <div className="mb-2 text-3xl font-bold text-gray-900">
              {(stats.totalViews / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          
          <div className="text-center card">
            <div className="mb-2 text-3xl font-bold text-gray-900">
              {stats.avgReadTime} min
            </div>
            <div className="text-sm text-gray-600">Avg. Read Time</div>
          </div>
          
          <div className="text-center card">
            <div className="mb-2 text-3xl font-bold text-gray-900">
              4.8
            </div>
            <div className="text-sm text-gray-600">Author Rating</div>
          </div>
        </div>
        
        {/* Author's Articles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Latest Articles
            </h2>
            {pagination?.total > 0 && (
              <span className="text-gray-600">
                {pagination.total} articles total
              </span>
            )}
          </div>
          
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post: any) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center gap-2">
                    {page > 1 && (
                      <a
                        href={`?page=${page - 1}`}
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
                          href={`?page=${pageNum}`}
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
                        href={`?page=${page + 1}`}
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
            <div className="py-16 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <FiBook size={24} className="text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                No articles yet
              </h3>
              <p className="max-w-md mx-auto text-gray-600">
                {author.name} hasn't published any articles yet. Check back soon!
              </p>
            </div>
          )}
        </div>
        
        {/* Author Expertise */}
        <div className="p-8 bg-gradient-to-r from-primary-50 to-white rounded-2xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Areas of Expertise
          </h2>
          <div className="flex flex-wrap gap-3">
            {['Web Development', 'SEO', 'Content Strategy', 'Technical Writing', 
              'JavaScript', 'React', 'Next.js', 'TypeScript'].map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 transition-colors bg-white border rounded-full border-primary-200 text-primary-700 hover:bg-primary-50"
              >
                {skill}
              </span>
            ))}
          </div>
          
          <div className="p-6 mt-8 bg-white border rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <FiTrendingUp size={24} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Writing Style
              </h3>
            </div>
            <p className="text-gray-700">
              {author.name} specializes in creating detailed, practical tutorials and 
              comprehensive guides. Their articles are known for clear explanations, 
              code examples, and real-world applications. Follow to get notified 
              when new content is published.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}