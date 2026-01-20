// lib/cloudinary.utils.ts
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number
): string {
  if (!url.includes('cloudinary.com')) return url

  const transformations = []
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  transformations.push('c_fill', 'q_auto', 'f_auto')

  return url.replace(
    '/upload/',
    `/upload/${transformations.join(',')}/`
  )
}
