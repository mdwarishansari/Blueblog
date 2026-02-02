import { generateSEO } from '@/lib/seo'
import ContactClient from './ContactClient'

export const metadata = generateSEO({
  title: 'Contact BlueBlog – Get in Touch',
  description:
    'Contact the BlueBlog team for support, questions, or collaboration opportunities.',
  url: '/contact',
})


export default function ContactPage() {
  return <ContactClient />
}
