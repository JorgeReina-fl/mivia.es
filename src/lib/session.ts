import type { SessionOptions } from 'iron-session'

export interface SessionData {
  admin: boolean
  createdAt: number
}

const _rawSessionSecret = process.env.SESSION_SECRET
if (!_rawSessionSecret) {
  throw new Error('SESSION_SECRET env var is required — refusing to boot without it')
}
export const SESSION_SECRET: string = _rawSessionSecret

export const sessionOptions: SessionOptions = {
  password: SESSION_SECRET,
  cookieName: 'admin_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60,
  },
}
