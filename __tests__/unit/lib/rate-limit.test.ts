import rateLimit from '@/lib/rate-limit'

describe('lib/rate-limit', () => {
  it('allows requests within the limit', async () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 10 })

    await expect(limiter.check(3, '127.0.0.1')).resolves.toBeUndefined()
    await expect(limiter.check(3, '127.0.0.1')).resolves.toBeUndefined()
    await expect(limiter.check(3, '127.0.0.1')).resolves.toBeUndefined()
  })

  it('rejects requests exceeding the limit', async () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 10 })

    await limiter.check(2, '192.168.1.1')
    await limiter.check(2, '192.168.1.1')

    await expect(limiter.check(2, '192.168.1.1')).rejects.toThrow(
      'Rate limit exceeded'
    )
  })

  it('tracks limits independently per token', async () => {
    const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 10 })

    await limiter.check(1, 'client-a')
    await expect(limiter.check(1, 'client-b')).resolves.toBeUndefined()
  })
})
