import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { type SessionData, sessionOptions } from '@/lib/session'

const RESERVED_SUBDOMAINS = [
  'www', 'api', 'admin', 'mail', 'ftp', 'smtp',
  'localhost', 'staging', 'dev', 'test'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes (except /admin/login) and /api/admin routes (except /api/admin/login)
  if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin'))
      && pathname !== '/api/admin/login') {
    if (pathname !== '/admin/login') {
      // request.cookies is read-only; middleware never calls session.save(), so set() is a no-op.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = await getIronSession<SessionData>(request.cookies as any, sessionOptions)
      if (!session.admin) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
    return NextResponse.next()
  }

  const hostname = request.headers.get('host') || ''
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'mivia.es'

  // Only handle subdomains of baseDomain
  if (!hostname.includes(`.${baseDomain}`)) {
    return NextResponse.next()
  }

  // Extract subdomain (strip ports)
  const rawUsername = hostname
    .replace(`.${baseDomain}`, '')
    .replace(/:\d+$/, '')

  // Validate subdomain format: 3-30 lowercase alphanumeric + hyphens
  if (!/^[a-z0-9-]{3,30}$/.test(rawUsername)) {
    return new NextResponse('Invalid subdomain format', { status: 400 })
  }

  // Pass reserved subdomains through unchanged
  if (RESERVED_SUBDOMAINS.includes(rawUsername)) {
    return NextResponse.next()
  }

  // Rewrite to /[username] route, preserving the path
  const url = new URL(
    `/${rawUsername}${pathname === '/' ? '' : pathname}`,
    request.url
  )
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
