import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@blog.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
  const adminName = process.env.ADMIN_NAME || 'Blog Administrator'

  const hashedPassword = await hash(adminPassword, 12)

  // Delete existing admin if exists
  await prisma.user.deleteMany({
    where: { email: adminEmail }
  })

  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      bio: 'Administrator of BlueBlog',
    }
  })

  console.log(`✅ Admin user created: ${admin.email}`)

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Technology',
        slug: 'technology',
      }
    }),
    prisma.category.create({
      data: {
        name: 'Web Development',
        slug: 'web-development',
      }
    }),
    prisma.category.create({
      data: {
        name: 'Design',
        slug: 'design',
      }
    }),
    prisma.category.create({
      data: {
        name: 'Business',
        slug: 'business',
      }
    }),
  ])

  console.log(`✅ ${categories.length} categories created`)

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Welcome to BlueBlog',
        slug: 'welcome-to-blueblog',
        excerpt: 'A modern blogging platform built with Next.js and Prisma',
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Welcome to BlueBlog' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'This is a sample post showcasing the features of BlueBlog.' }
              ]
            }
          ]
        },
        authorId: admin.id,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        categories: {
          connect: [{ id: categories[0].id }]
        }
      }
    }),
    prisma.post.create({
      data: {
        title: 'Getting Started with Next.js 14',
        slug: 'getting-started-with-nextjs-14',
        excerpt: 'Learn how to build modern web applications with Next.js 14',
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Getting Started with Next.js 14' }]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Next.js 14 introduces powerful new features for building web applications.' }
              ]
            }
          ]
        },
        authorId: admin.id,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        categories: {
          connect: [{ id: categories[1].id }]
        }
      }
    }),
  ])

  console.log(`✅ ${posts.length} sample posts created`)

  // Create default settings
  const settings = await Promise.all([
    prisma.setting.upsert({
      where: { key: 'site_name' },
      update: {},
      create: {
        key: 'site_name',
        value: process.env.NEXT_PUBLIC_SITE_NAME || 'BlueBlog'
      }
    }),
    prisma.setting.upsert({
      where: { key: 'site_description' },
      update: {},
      create: {
        key: 'site_description',
        value: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern, SEO-optimized blogging platform'
      }
    }),
    prisma.setting.upsert({
      where: { key: 'contact_email' },
      update: {},
      create: {
        key: 'contact_email',
        value: 'contact@blueblog.com'
      }
    }),
  ])

  console.log(`✅ ${settings.length} settings created`)
  console.log('🌱 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })