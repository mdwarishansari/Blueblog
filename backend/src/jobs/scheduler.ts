// src/jobs/scheduler.ts
import cron from 'node-cron'
import prisma from '../utils/prisma'
import { PostStatus } from '@prisma/client'

cron.schedule('* * * * *', async () => {
  const now = new Date()

  const duePosts = await prisma.post.findMany({
    where: {
      status: PostStatus.SCHEDULED,
      scheduledAt: { lte: now },
    },
  })

  if (!duePosts.length) return

  await prisma.post.updateMany({
    where: { id: { in: duePosts.map(p => p.id) } },
    data: {
      status: PostStatus.PUBLISHED,
      publishedAt: now,
      scheduledAt: null,
    },
  })

  console.log(`✅ Published ${duePosts.length} scheduled posts`)
})

