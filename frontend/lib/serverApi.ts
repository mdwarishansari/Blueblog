/**
 * Server-side API helper (for Next.js Server Components / Route handlers).
 * Uses the backend Express API as the single source of truth (no Prisma in frontend).
 */

const API_BASE_URL =
  process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:4000/api'

export async function serverApiGet<T = any>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  opts?: { revalidate?: number }
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${endpoint}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue
      url.searchParams.set(k, String(v))
    }
  }

  const res = await fetch(url.toString(), {
    // Cache control for Next.js (Server Components)
    next: { revalidate: opts?.revalidate ?? 60 },
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data as T
}

