import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('access_token')?.value

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
