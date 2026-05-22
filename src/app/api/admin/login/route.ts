import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { timingSafeEqual } from 'crypto'
import { getIronSession } from 'iron-session'
import { type SessionData, sessionOptions } from '@/lib/session'

const _rawAdminPw = process.env.ADMIN_PASSWORD
if (!_rawAdminPw) {
  throw new Error('ADMIN_PASSWORD env var is required — refusing to boot without it')
}
const ADMIN_PASSWORD: string = _rawAdminPw

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (safeCompare(password, ADMIN_PASSWORD)) {
      const cookieStore = await cookies()
      const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
      session.admin = true
      session.createdAt = Date.now()
      await session.save()

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
