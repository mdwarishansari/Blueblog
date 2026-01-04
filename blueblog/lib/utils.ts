import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export function generateExcerpt(content: any, maxLength: number = 160): string {
  if (typeof content === 'string') {
    return truncate(content, maxLength)
  }
  
  if (Array.isArray(content)) {
    const text = content
      .filter((block: any) => block.type === 'paragraph' || block.type === 'heading')
      .map((block: any) => block.content?.map((item: any) => item.text).join(' ') || '')
      .join(' ')
    
    return truncate(text, maxLength)
  }
  
  return ''
}