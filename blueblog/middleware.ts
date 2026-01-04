import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ❗ ABSOLUTELY IGNORE LOGIN PAGE
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Protect admin routes EXCEPT login
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('access_token')?.value

    if (!token) {
      return NextResponse.redirect(
        new URL('/admin/login', request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
