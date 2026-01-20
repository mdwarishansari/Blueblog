import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !token) {
  return NextResponse.redirect(new URL('/login', request.url))
}


  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
