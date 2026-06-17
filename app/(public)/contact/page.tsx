import { generateSEO } from '@/lib/seo'
import ContactClient from './ContactClient'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = generateSEO({
  title: 'Contact BlueBlog – Get in Touch',
  description:
    'Contact the BlueBlog team for support, questions, or collaboration opportunities.',
  url: '/contact',
})

async function getContactSettings() {
  const rows = await prisma.setting.findMany({
    where: {
      key: {
        in: ['contact_email', 'contact_phone', 'contact_location', 'contact_hours']
      }
    }
  })

  const settings = {
    contact_email: 'contact@blueblog.com',
    contact_phone: '+1 (555) 123-4567',
    contact_location: 'San Francisco, CA',
    contact_hours: 'Mon–Fri, 9am–6pm',
  }

  for (const row of rows) {
    if (row.key === 'contact_email' && row.value) settings.contact_email = row.value
    if (row.key === 'contact_phone' && row.value) settings.contact_phone = row.value
    if (row.key === 'contact_location' && row.value) settings.contact_location = row.value
    if (row.key === 'contact_hours' && row.value) settings.contact_hours = row.value
  }

  return settings
}

export default async function ContactPage() {
  const settings = await getContactSettings()
  return <ContactClient settings={settings} />
}
