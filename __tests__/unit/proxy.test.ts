import { NextRequest } from 'next/server'
import { proxy } from '@/proxy'

function createRequest(path: string, cookie?: string) {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: cookie ? { cookie: `access_token=${cookie}` } : {},
  })
}

describe('proxy middleware', () => {
  it('allows public login and register routes', () => {
    expect(proxy(createRequest('/login')).status).toBe(200)
    expect(proxy(createRequest('/register')).status).toBe(200)
  })

  it('redirects unauthenticated admin requests to login', () => {
    const response = proxy(createRequest('/admin/dashboard'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('allows authenticated admin requests', () => {
    const response = proxy(createRequest('/admin/posts', 'valid-token'))
    expect(response.status).toBe(200)
    expect(response.headers.get('x-pathname')).toBe('/admin/posts')
  })
})
