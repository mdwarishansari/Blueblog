
import { generateSEO } from '@/lib/seo'
import ContactClient from './ContactClient'


export const metadata = generateSEO({
  title: 'Contact Us',
  description: 'Get in touch with the BlueBlog team.',
  url: '/contact',
})


export default function ContactPage() {
  return <ContactClient />
}
