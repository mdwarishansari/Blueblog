
import { Users, Target, Award, Globe } from 'lucide-react'

import { prisma } from '@/lib/prisma'
import TeamMember from '@/components/TeamMember'

import { generateSEO } from '@/lib/seo'

export const metadata = generateSEO({
  title: 'About Us',
  description: 'Learn more about BlueBlog, our mission, and our team.',
  url: '/about',
})

async function getTeamMembers() {
  return await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'EDITOR'] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      role: true,
      profileImage: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

export default async function AboutPage() {
  const teamMembers = await getTeamMembers()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-400 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
              About BlueBlog
            </h1>
            <p className="text-xl opacity-90">
              A modern blogging platform built for creators, by creators
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-primary-700">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Empowering voices in the digital age
              </h2>
              <p className="text-lg text-gray-600">
                BlueBlog was founded with a simple mission: to create the most 
                user-friendly, powerful, and accessible blogging platform for 
                writers of all backgrounds. We believe everyone has a story to tell.
              </p>
              <p className="text-gray-600">
                Our platform combines cutting-edge technology with intuitive design 
                to help you focus on what matters most—your content. Whether you're 
                a seasoned writer or just starting, BlueBlog gives you the tools to 
                succeed.
              </p>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">Our Vision</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Building a global community of creators
              </h2>
              <p className="text-lg text-gray-600">
                We envision a world where every creator has the tools and platform 
                to share their unique perspective with a global audience.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="text-3xl font-bold text-primary-600">100K+</div>
                  <div className="mt-2 text-sm text-gray-600">Monthly Readers</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="text-3xl font-bold text-primary-600">500+</div>
                  <div className="mt-2 text-sm text-gray-600">Published Authors</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="text-3xl font-bold text-primary-600">10K+</div>
                  <div className="mt-2 text-sm text-gray-600">Articles Published</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="text-3xl font-bold text-primary-600">50+</div>
                  <div className="mt-2 text-sm text-gray-600">Countries Reached</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-12 text-3xl font-bold text-gray-900">Our Values</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Community First</h3>
              <p className="text-gray-600">
                We build for our community. Every feature is designed with real 
                creators' needs in mind.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Quality Content</h3>
              <p className="text-gray-600">
                We're committed to maintaining high standards for content quality 
                and credibility.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Global Reach</h3>
              <p className="text-gray-600">
                We help creators reach audiences worldwide with multi-language 
                support and global distribution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-12 text-3xl font-bold text-gray-900">Meet Our Team</h2>
            <p className="mb-12 text-gray-600">
              The passionate people behind BlueBlog who work tirelessly to bring 
              you the best blogging experience.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <TeamMember key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-400 p-12 text-center text-white shadow-xl">
            <h2 className="mb-4 text-3xl font-bold">Ready to Start Writing?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
              Join thousands of creators who are already sharing their stories 
              with the world.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="/blog"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-medium text-primary-600 hover:bg-gray-100"
              >
                Read Our Blog
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-white/20 px-6 py-3 font-medium text-white backdrop-blur-sm hover:bg-white/30"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}