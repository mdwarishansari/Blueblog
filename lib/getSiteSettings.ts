// lib/getSiteSettings.ts
import { prisma } from '@/lib/prisma'

export async function getSiteSettings() {
  const settings = await prisma.setting.findMany()
  return Object.fromEntries(
    settings.map(s => [s.key, s.value])
  )
}
