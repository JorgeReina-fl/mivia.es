import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const business = await prisma.business.findUnique({
      where: { username },
      include: { profile: true }
    })

    if (!business?.profile) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const { profile } = business
    const initial = profile.name.charAt(0).toUpperCase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const colors = (profile.content as any)?.colors
    const primaryColor = colors?.primary || '#6366f1'

    const svg = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="${primaryColor}" rx="12"/>
  <text
    x="50%"
    y="50%"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="system-ui, sans-serif"
    font-size="32"
    font-weight="bold"
    fill="white"
  >${initial}</text>
</svg>`

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('[Favicon] Error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
