import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

const settingsSchema = z.object({
  site_name: z.string().min(1, 'Site name is required'),
  site_description: z.string().optional(),
  contact_email: z.string().email('Invalid email').optional(),
  social_links: z.record(z.string()).optional(),
  footer_text: z.string().optional(),
  feature_flags: z.record(z.any()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    await requireAuth(['ADMIN'])
    
    const settings = await prisma.setting.findMany()
    
    // Convert to key-value object
    const settingsObj: Record<string, any> = {}
    settings.forEach(setting => {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value)
      } catch {
        settingsObj[setting.key] = setting.value
      }
    })
    
    return NextResponse.json(settingsObj)
  } catch (error: any) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth(['ADMIN'])
    
    const body = await request.json()
    const data = settingsSchema.parse(body)
    
    const updates = Object.entries(data).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: {
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        },
        create: {
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        },
      })
    })
    
    await prisma.$transaction(updates)
    
    return NextResponse.json({
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('Update settings error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Failed to update settings' },
      { status: 500 }
    )
  }
}