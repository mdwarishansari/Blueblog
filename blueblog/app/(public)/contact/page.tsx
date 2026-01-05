import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'
import ContactClient from './ContactClient'

export const metadata: Metadata = generateSEO({
  title: 'Contact Us',
  description: 'Get in touch with us',
})

export default function ContactPage() {
  return <ContactClient />
}
