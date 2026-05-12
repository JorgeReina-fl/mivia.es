import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'mivia.es'

  // Extraer subdominio
  const username = hostname
    .replace(`.${baseDomain}`, '')
    .replace(':3000', '')
    .replace(':80', '')
    .replace(':443', '')

  const isSubdomain = hostname.includes(`.${baseDomain}`) && username !== 'www'

  if (isSubdomain && username) {
    return NextResponse.rewrite(
      new URL(`/p/${username}${request.nextUrl.pathname}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
