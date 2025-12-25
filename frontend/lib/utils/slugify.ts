export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

export function unslugify(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

export function generateSlugFromTitle(title: string): string {
  return slugify(title.substring(0, 60)) // Limit to 60 chars for slugs
}

export function getSlugError(slug: string): string | null {
  if (!slug) return 'Slug is required'
  if (slug.length > 60) return 'Slug must be 60 characters or less'
  if (!isValidSlug(slug)) return 'Slug can only contain lowercase letters, numbers, and hyphens'
  return null
}