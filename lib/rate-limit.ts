import { LRUCache } from 'lru-cache'

interface RateLimitOptions {
  interval: number
  uniqueTokenPerInterval: number
}

interface RateLimitResult {
  check: (limit: number, token: string) => Promise<void>
}

export default function rateLimit(options: RateLimitOptions): RateLimitResult {
  const tokenCache = new LRUCache<string, number>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        // Always get a number
        const currentUsage = tokenCache.get(token) ?? 0
        const nextUsage = currentUsage + 1

        tokenCache.set(token, nextUsage)

        if (nextUsage > limit) {
          reject(new Error('Rate limit exceeded'))
        } else {
          resolve()
        }
      }),
  }
}
