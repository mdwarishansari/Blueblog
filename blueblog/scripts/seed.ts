import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')

  /* ---------------- ADMIN (CREATE ONCE) ---------------- */

  const adminEmail = process.env['ADMIN_EMAIL'] || 'admin@blog.com'
  const adminPassword = process.env['ADMIN_PASSWORD'] || 'Admin@123'
  const adminName = process.env['ADMIN_NAME'] || 'Blog Administrator'

  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  })

  let admin = existingAdmin

  if (!existingAdmin) {
    const hashedPassword = await hash(adminPassword, 12)

    admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
        bio: 'Administrator of BlueBlog',
      },
    })

    console.log(`✅ Admin created: ${admin.email}`)
  } else {
    console.log(`ℹ️ Admin already exists: ${existingAdmin.email}`)
  }

  if (!admin) {
    throw new Error('Admin creation failed')
  }

  /* ---------------- CATEGORIES (UPSERT) ---------------- */

  const categoryData = [
    { name: 'Technology', slug: 'technology' },
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Design', slug: 'design' },
    { name: 'Business', slug: 'business' },
  ]

  for (const c of categoryData) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    })
  }

  console.log(`✅ Categories ensured`)

  /* ---------------- SAMPLE POSTS (CREATE ONCE) ---------------- */

  const existingPost = await prisma.post.findFirst({
    where: { slug: 'welcome-to-blueblog' },
  })

  if (!existingPost) {
    await prisma.post.create({
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
              content: [{ type: 'text', text: 'Welcome to BlueBlog' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This is a sample post showcasing the features of BlueBlog.',
                },
              ],
            },
          ],
        },
        authorId: admin.id,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        categories: {
          connect: [{ slug: 'technology' }],
        },
      },
    })

    console.log('✅ Sample post created')
  } else {
    console.log('ℹ️ Sample post already exists')
  }

  /* ---------------- SETTINGS (UPSERT, ENV AS DEFAULT) ---------------- */

  const settings = [
    {
      key: 'site_name',
      value: process.env['NEXT_PUBLIC_SITE_NAME'] || 'BlueBlog',
    },
    {
      key: 'site_description',
      value:
        process.env['NEXT_PUBLIC_SITE_DESCRIPTION'] ||
        'A modern, SEO-optimized blogging platform',
    },
    {
      key: 'contact_email',
      value: admin.email,
    },
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }

  console.log('✅ Default settings ensured')
  console.log('🌱 Seeding completed successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
