import { PrismaClient, UserRole, PostStatus } from '@prisma/client'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding check...')

  // Check if admin user exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@blueblog.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!'
  const adminName = process.env.ADMIN_NAME || 'Admin'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  // If admin exists, skip all seeding (already deployed)
  if (existingAdmin) {
    console.log('✅ Admin user already exists. Skipping seeding (already deployed).')
    console.log('📊 Checking database status...')
    
    const [userCount, postCount, categoryCount, settingCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.category.count(),
      prisma.setting.count()
    ])
    
    console.log(`📈 Database status:`)
    console.log(`   👥 Users: ${userCount}`)
    console.log(`   📝 Posts: ${postCount}`)
    console.log(`   📂 Categories: ${categoryCount}`)
    console.log(`   ⚙️ Settings: ${settingCount}`)
    
    return
  }

  console.log('🚀 First-time deployment detected. Starting full seeding...')

  // Create admin user (first-time deployment)
  console.log('👤 Creating admin user...')
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  const adminUser = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      bio: 'System Administrator',
    },
  })
  console.log(`✅ Admin user created: ${adminUser.email}`)

  // Create default categories (only if none exist)
  console.log('📂 Creating default categories...')
  const categoryCount = await prisma.category.count()
  
  if (categoryCount === 0) {
    const defaultCategories = [
      { name: 'Technology', slug: 'technology' },
      { name: 'Lifestyle', slug: 'lifestyle' },
      { name: 'Travel', slug: 'travel' },
      { name: 'Food', slug: 'food' },
      { name: 'Health', slug: 'health' },
    ]

    for (const category of defaultCategories) {
      await prisma.category.create({
        data: category,
      })
    }
    console.log('✅ 5 default categories created')
  } else {
    console.log(`📂 ${categoryCount} categories already exist, skipping...`)
  }

  // Create default settings (only if none exist)
  console.log('⚙️ Creating default settings...')
  const settingCount = await prisma.setting.count()
  
  if (settingCount === 0) {
    const defaultSettings = [
      {
        key: 'siteName',
        value: JSON.stringify('BlueBlog'),
      },
      {
        key: 'siteUrl',
        value: JSON.stringify('http://localhost:3000'),
      },
      {
        key: 'description',
        value: JSON.stringify('A modern, SEO-optimized blogging platform'),
      },
      {
        key: 'contactEmail',
        value: JSON.stringify('contact@blueblog.com'),
      },
      {
        key: 'social',
        value: JSON.stringify({
          twitter: '@blueblog',
          facebook: 'blueblog',
          instagram: 'blueblog',
        }),
      },
      {
        key: 'footerHtml',
        value: JSON.stringify('<p>© 2024 BlueBlog. All rights reserved.</p>'),
      },
    ]

    for (const setting of defaultSettings) {
      await prisma.setting.create({
        data: setting,
      })
    }
    console.log('✅ Default settings created')
  } else {
    console.log(`⚙️ ${settingCount} settings already exist, skipping...`)
  }

  // Create sample posts (only if none exist and we have categories)
  console.log('📝 Creating sample posts...')
  const postCount = await prisma.post.count()
  
  if (postCount === 0) {
    const categories = await prisma.category.findMany()
    
    if (categories.length > 0) {
      const samplePosts = [
        {
          title: 'Welcome to BlueBlog',
          slug: 'welcome-to-blueblog',
          excerpt: 'A brief introduction to our new blogging platform',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Welcome to BlueBlog! This is our first post showcasing the features of our new platform.',
                  },
                ],
              },
            ],
          },
          status: PostStatus.PUBLISHED, // Fixed: Use enum value
          publishedAt: new Date(),
          authorId: adminUser.id,
          categoryIds: categories.slice(0, 2).map(c => c.id),
        },
        {
          title: 'Getting Started with Blogging',
          slug: 'getting-started-with-blogging',
          excerpt: 'Tips for new bloggers to get started',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Blogging can be an amazing way to share your thoughts and expertise with the world. In this post, we\'ll explore how to get started.',
                  },
                ],
              },
            ],
          },
          status: PostStatus.PUBLISHED, // Fixed: Use enum value
          publishedAt: new Date(),
          authorId: adminUser.id,
          categoryIds: categories.slice(1, 3).map(c => c.id),
        },
      ]

      for (const post of samplePosts) {
        const { categoryIds, ...postData } = post
        
        await prisma.post.create({
          data: {
            ...postData,
            categories: {
              connect: categoryIds.map(id => ({ id })),
            },
          },
        })
      }
      console.log('✅ 2 sample posts created')
    } else {
      console.log('⚠️ No categories found, skipping sample posts creation')
    }
  } else {
    console.log(`📝 ${postCount} posts already exist, skipping...`)
  }

  // Create additional sample users (optional)
  console.log('👥 Creating sample users...')
  const userCount = await prisma.user.count()
  
  if (userCount === 1) { // Only admin exists
    const sampleUsers = [
      {
        name: 'Editor User',
        email: 'editor@blueblog.com',
        password: 'Editor123!',
        role: UserRole.EDITOR as UserRole,
        bio: 'Content Editor',
      },
      {
        name: 'Writer User',
        email: 'writer@blueblog.com',
        password: 'Writer123!',
        role: UserRole.WRITER as UserRole,
        bio: 'Content Writer',
      },
    ]

    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10)
      
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordHash: hashedPassword,
          role: user.role,
          bio: user.bio,
        },
      })
    }
    console.log('✅ 2 sample users (editor and writer) created')
  } else {
    console.log(`👥 ${userCount - 1} additional users already exist, skipping...`)
  }

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📋 Summary:')
  console.log(`   👤 Admin: ${adminEmail}`)
  console.log(`   🔑 Password: ${adminPassword}`)
  console.log('   ⚠️  Change these credentials in production!')
}

main()
  .catch((error) => {
    console.error('❌ Error during database seeding:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })