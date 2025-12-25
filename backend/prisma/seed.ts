import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@blog.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'Blog Administrator';

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      bio: 'Administrator of the blog platform'
    }
  });

  // Create default categories
  const categories = [
    { name: 'Technology', slug: 'technology' },
    { name: 'Programming', slug: 'programming' },
    { name: 'Web Development', slug: 'web-development' },
    { name: 'SEO', slug: 'seo' },
    { name: 'Productivity', slug: 'productivity' },
    { name: 'Business', slug: 'business' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  // Create sample writer
  const writer = await prisma.user.upsert({
    where: { email: 'writer@blog.com' },
    update: {},
    create: {
      name: 'Sample Writer',
      email: 'writer@blog.com',
      passwordHash: await bcrypt.hash('Writer@123', 12),
      role: UserRole.WRITER,
      bio: 'Professional content writer'
    }
  });

  // Create sample editor
  const editor = await prisma.user.upsert({
    where: { email: 'editor@blog.com' },
    update: {},
    create: {
      name: 'Sample Editor',
      email: 'editor@blog.com',
      passwordHash: await bcrypt.hash('Editor@123', 12),
      role: UserRole.EDITOR,
      bio: 'Content editor and reviewer'
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin credentials: ${adminEmail} / ${adminPassword}`);
  console.log(`👤 Writer credentials: writer@blog.com / Writer@123`);
  console.log(`👤 Editor credentials: editor@blog.com / Editor@123`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });