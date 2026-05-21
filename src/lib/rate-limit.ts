import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

function cleanup() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key)
  }
}

let cleanupInterval: NodeJS.Timeout | null = null

export function initCleanup() {
  if (!cleanupInterval && typeof setInterval !== 'undefined') {
    cleanupInterval = setInterval(cleanup, 5 * 60 * 1000)
  }
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number // Unix timestamp en segundos
}

export function checkRateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60 * 60 * 1000 // 1 hora
): RateLimitResult {
  console.log(`[RATE-LIMIT-DEBUG] checkRateLimit called for IP: ${ip}, limit: ${limit}`)
  const now = Date.now()
  const entry = store.get(ip)
  console.log(`[RATE-LIMIT-DEBUG] Entry for ${ip}:`, entry ? `count=${entry.count}, resetAt=${new Date(entry.resetAt).toISOString()}` : 'NOT FOUND')

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs
    store.set(ip, { count: 1, resetAt })
    return { allowed: true, limit, remaining: limit - 1, resetAt: Math.floor(resetAt / 1000) }
  }

  entry.count += 1
  const remaining = Math.max(0, limit - entry.count)
  const allowed = entry.count <= limit

  return { allowed, limit, remaining, resetAt: Math.floor(entry.resetAt / 1000) }
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt),
  }
}
