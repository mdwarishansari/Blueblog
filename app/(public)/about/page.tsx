import { Suspense } from 'react'
import { Users, Target, Award, Globe } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import TeamMember from '@/components/TeamMember'
import { generateSEO } from '@/lib/seo'
import TeamMemberSkeleton from '@/components/skeletons/TeamMemberSkeleton'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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

  if (teamMembers.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-slate-gray">
        No team members found.
      </div>
    )
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {teamMembers.map((member) => (
        <TeamMember key={member.id} member={member} />
      ))}
    </div>
  )
}

/* ================= PAGE ================= */
export default async function AboutPage() {
  const [postCount, authorCount, categoryCount] = await Promise.all([
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.user.count(),
    prisma.category.count(),
  ])

  return (
    <div className="min-h-screen bg-canvas-cream pb-12">
      
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-canvas-cream to-lavender-mist/50 py-20 border-b border-hairline">
        <Container className="relative z-10 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-pure-white border border-hairline px-3.5 py-1 text-xs font-semibold text-vivid-violet shadow-sm">
            About Us
          </div>
          <h1 className="mb-6 text-3xl sm:text-[48px] md:text-[57px] font-bold tracking-tight text-ink-charcoal leading-tight">
            About BlueBlog
          </h1>
          <p className="text-base sm:text-lg text-slate-gray max-w-xl mx-auto">
            A modern blogging platform built for creators, by creators.
          </p>
        </Container>
      </section>
 
      {/* ================= MISSION & VISION ================= */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
 
            {/* Mission */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-lavender-mist px-3.5 py-1 text-xs font-medium text-vivid-violet">
                <Target className="h-3.5 w-3.5" />
                Our Mission
              </div>
 
              <h2 className="text-3xl font-bold tracking-tight text-ink-charcoal leading-tight">
                Empowering voices in the digital age
              </h2>
 
              <p className="text-base text-slate-gray leading-relaxed">
                BlueBlog was founded with a simple mission: to create the most
                user-friendly, powerful, and accessible blogging platform for
                writers of all backgrounds.
              </p>
 
              <p className="text-sm text-slate-gray leading-relaxed">
                Our platform combines cutting-edge technology with intuitive
                design to help you focus on what matters most—your content.
              </p>
            </div>
 
            {/* Vision */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-powder-blue/40 px-3.5 py-1 text-xs font-medium text-electric-cobalt">
                <Globe className="h-3.5 w-3.5" />
                Our Vision
              </div>
 
              <h2 className="text-3xl font-bold tracking-tight text-ink-charcoal leading-tight">
                Building a global community of creators
              </h2>
 
              <p className="text-base text-slate-gray leading-relaxed mb-6">
                We envision a world where every creator has the tools and
                platform to share their unique perspective with a global
                audience.
              </p>
 
              <div className="grid grid-cols-3 gap-4">
                {[
                  [postCount, 'Articles Published', 'text-electric-cobalt'],
                  [authorCount, 'Registered Authors', 'text-vivid-violet'],
                  [categoryCount, 'Tech Categories', 'text-forest'],
                ].map(([value, label, colorClass]) => (
                  <Card
                    key={label}
                    variant="white"
                    className="p-5 text-center"
                  >
                    <div className={`text-2xl sm:text-3xl font-bold ${colorClass}`}>
                      {value}
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-gray">
                      {label}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
 
          </div>
        </Container>
      </Section>

      {/* ================= VALUES ================= */}
      <Section className="bg-pure-white border-y border-hairline py-16">
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink-charcoal">
              Our Values
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'Community First',
                text: "We build for our community. Every feature is designed with real creators' needs in mind.",
              },
              {
                icon: Award,
                title: 'Quality Content',
                text: "We're committed to maintaining high standards for content quality and credibility.",
              },
              {
                icon: Globe,
                title: 'Global Reach',
                text: 'We help creators reach audiences worldwide with global distribution.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <Card
                key={title}
                variant="ivory"
                className="text-center p-8 flex flex-col items-center"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-pure-white border border-hairline text-vivid-violet shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mb-3 text-lg font-bold text-ink-charcoal">
                  {title}
                </h3>

                <p className="text-sm text-slate-gray leading-relaxed">
                  {text}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ================= TEAM (SUSPENSE) ================= */}
      <Section>
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink-charcoal">
              Meet Our Team
            </h2>
            <p className="mt-2 text-sm text-slate-gray">
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
        </Container>
      </Section>

      {/* ================= CTA ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-canvas-cream via-powder-blue to-electric-cobalt py-20 border-t border-hairline">
        <Container className="relative z-10 text-center">
          <h2 className="text-3xl sm:text-[40px] font-bold text-ink-charcoal tracking-tight mb-6 leading-tight">
            Ready to Start Writing?
          </h2>
          <p className="text-base sm:text-lg text-ink-charcoal/85 mb-10 max-w-xl mx-auto font-normal">
            Join thousands of creators who are already sharing their stories with the world.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/blog" aria-label="Read blog posts on BlueBlog">
              <Button variant="default" size="lg">
                Read Our Blog
              </Button>
            </Link>

            <Link href="/contact" aria-label="Contact the BlueBlog team">
              <Button variant="secondary" size="lg" className="bg-pure-white border-hairline shadow-sm">
                Contact Us
              </Button>
            </Link>
          </div>
        </Container>
      </section>

    </div>
  )
}
