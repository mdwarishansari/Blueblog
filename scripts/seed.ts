import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')

  /* ===============================
     GLOBAL SAFETY GUARD (KEY PART)
     =============================== */
  const adminExists = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  })

  if (adminExists) {
    console.log('ℹ️ Database already seeded. Skipping seed.')
    return
  }

  /* ===============================
     ADMIN (CREATE ONCE)
     =============================== */

  const adminEmail = process.env['ADMIN_EMAIL'] || 'admin@blog.com'
  const adminPassword = process.env['ADMIN_PASSWORD'] || 'Admin@123'
  const adminName = process.env['ADMIN_NAME'] || 'Blog Administrator'

  const hashedPassword = await hash(adminPassword, 12)

  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      bio: 'Administrator of BlueBlog',
    },
  })

  console.log(`✅ Admin created: ${admin.email}`)

  /* ===============================
     CATEGORIES (UPSERT)
     =============================== */

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

  console.log('✅ Categories ensured')

  /* ===============================
     SAMPLE POST (CREATE ONCE)
     =============================== */

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

  /* ===============================
     SETTINGS (UPSERT)
     =============================== */

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
