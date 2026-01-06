import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rows = await prisma.setting.findMany()

  const settings: Record<string, any> = {}

  for (const row of rows) {
    settings[row.key] =
      row.key === 'social_links'
        ? JSON.parse(row.value || '{}')
        : row.value
  }

  return NextResponse.json({
    siteName: settings.site_name || 'BlueBlog',
    siteLogo: settings.site_logo || null,
  })
}
