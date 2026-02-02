import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/* ---------------- GET SETTINGS ---------------- */
export async function GET() {
  try {
    await requireAuth()

    const rows = await prisma.setting.findMany()

    const settings = {
      site_name: '',
      site_description: '',
      contact_email: '',
      footer_text: '',
      social_links: {},
    }

    for (const row of rows) {
      if (row.key === 'social_links') {
        try {
          settings.social_links = JSON.parse(row.value)
        } catch {
          settings.social_links = {}
        }
      } else {
        ;(settings as any)[row.key] = row.value
      }
    }

    return NextResponse.json(settings)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Failed to load settings' },
      { status: 500 }
    )
  }
}

/* ---------------- UPDATE SETTINGS ---------------- */
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    const entries: Array<[string, string]> = [
      ['site_name', body.site_name || ''],
      ['site_description', body.site_description || ''],
      ['contact_email', body.contact_email || ''],
      ['footer_text', body.footer_text || ''],
      ['site_logo', body.site_logo || ''], 
      ['social_links', JSON.stringify(body.social_links || {})],
    ]

    for (const [key, value] of entries) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    }

    return NextResponse.json({ message: 'Settings saved successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
