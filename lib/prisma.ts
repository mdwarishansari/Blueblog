import { PrismaClient } from '@prisma/client/edge'
// import { withAccelerate } from '@prisma/extension-accelerate'

// IMPORTANT:
// - No global caching
// - New client is safe per request in Edge
// - Same `prisma` export name → NO changes needed elsewhere

export const prisma = new PrismaClient()