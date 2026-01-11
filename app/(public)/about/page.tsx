import { Suspense } from 'react'
import { Users, Target, Award, Globe } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import TeamMember from '@/components/TeamMember'
import { generateSEO } from '@/lib/seo'
import TeamMemberSkeleton from '@/components/skeletons/TeamMemberSkeleton'
import Link from 'next/link'  
export const revalidate = 60

export const metadata = generateSEO({
  title: 'About BlueBlog – Our Mission, Vision, and Team',
  description:
    'Learn more about BlueBlog, our mission, vision, values, and the team behind the platform.',
  url: '/about',
})


/* ================= TEAM DATA ================= */
async function getTeamMembers() {
  return prisma.user.findMany({
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

/* ================= TEAM SECTION (ASYNC) ================= */
async function TeamSection() {
  const teamMembers = await getTeamMembers()

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {teamMembers.map(member => (
        <TeamMember key={member.id} member={member} />
      ))}
    </div>
  )
}

/* ================= PAGE ================= */
export default async function AboutPage() {
  return (
    <div className="min-h-screen bg-bg">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 py-24">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              About BlueBlog
            </h1>
            <p className="text-xl text-white/90">
              A modern blogging platform built for creators, by creators
            </p>
          </div>
        </div>
      </section>

      {/* ================= MISSION & VISION ================= */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-14 lg:grid-cols-2">

            {/* Mission */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-indigo-700">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">Our Mission</span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-fg">
                Empowering voices in the digital age
              </h2>

              <p className="text-lg text-slate-600">
                BlueBlog was founded with a simple mission: to create the most
                user-friendly, powerful, and accessible blogging platform for
                writers of all backgrounds.
              </p>

              <p className="text-slate-600">
                Our platform combines cutting-edge technology with intuitive
                design to help you focus on what matters most—your content.
              </p>
            </div>

            {/* Vision */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-violet-700">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">Our Vision</span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-fg">
                Building a global community of creators
              </h2>

              <p className="text-lg text-slate-600">
                We envision a world where every creator has the tools and
                platform to share their unique perspective with a global
                audience.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ['100K+', 'Monthly Readers'],
                  ['500+', 'Published Authors'],
                  ['10K+', 'Articles Published'],
                  ['50+', 'Countries Reached'],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-card p-6 elev-sm"
                  >
                    <div className="text-3xl font-bold text-indigo-600">
                      {value}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="bg-card py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-fg">
              Our Values
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'Community First',
                text:
                  "We build for our community. Every feature is designed with real creators' needs in mind.",
                color: 'indigo',
              },
              {
                icon: Award,
                title: 'Quality Content',
                text:
                  "We're committed to maintaining high standards for content quality and credibility.",
                color: 'emerald',
              },
              {
                icon: Globe,
                title: 'Global Reach',
                text:
                  'We help creators reach audiences worldwide with global distribution.',
                color: 'violet',
              },
            ].map(({ icon: Icon, title, text, color }) => (
              <div
                key={title}
                className="rounded-2xl bg-[var(--muted)] p-8 text-center ui-transition hover:elev-md"
              >
                <div
                  className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-${color}-100 text-${color}-600`}
                >
                  <Icon className="h-8 w-8" />
                </div>

                <h3 className="mb-4 text-xl font-bold text-fg">
                  {title}
                </h3>

                <p className="text-slate-600">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TEAM (SUSPENSE) ================= */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-fg">
              Meet Our Team
            </h2>
            <p className="mt-4 text-slate-600">
              The passionate people behind BlueBlog
            </p>
          </div>

          <Suspense
            fallback={
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TeamMemberSkeleton key={i} />
                ))}
              </div>
            }
          >
            <TeamSection />
          </Suspense>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 p-14 text-center text-white elev-lg">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to Start Writing?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90">
              Join thousands of creators who are already sharing their stories
              with the world.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
  <Link
    href="/blog"
    aria-label="Read blog posts on BlueBlog"
    className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-medium text-indigo-600 ui-transition hover:bg-slate-100"
  >
    Read Our Blog
  </Link>

  <Link
    href="/contact"
    aria-label="Contact the BlueBlog team"
    className="inline-flex items-center justify-center rounded-lg bg-white/20 px-6 py-3 font-medium text-white backdrop-blur-sm ui-transition hover:bg-white/30"
  >
    Contact Us
  </Link>
</div>
          </div>
        </div>
      </section>

    </div>
  )
}
