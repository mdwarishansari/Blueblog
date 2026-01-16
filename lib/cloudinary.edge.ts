// lib/cloudinary.edge.ts

export async function deleteFromCloudinary(publicId: string) {
  const timestamp = Math.floor(Date.now() / 1000)

  const payload = `public_id=${publicId}&timestamp=${timestamp}${process.env['CLOUDINARY_API_SECRET']}`

  const hashBuffer = await crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(payload)
  )

  const signature = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const form = new FormData()
  form.append('public_id', publicId)
  form.append('timestamp', timestamp.toString())
  form.append('api_key', process.env['CLOUDINARY_API_KEY']!)
  form.append('signature', signature)

  await fetch(
    `https://api.cloudinary.com/v1_1/${process.env['CLOUDINARY_CLOUD_NAME']}/image/destroy`,
    {
      method: 'POST',
      body: form,
    }
  )
}
