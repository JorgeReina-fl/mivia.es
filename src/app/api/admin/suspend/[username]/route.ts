import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    await prisma.business.update({
      where: { username },
      data: { status: 'suspended' }
    })
    console.log(`[ADMIN] Web suspendida: ${username}`)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error al suspender' }, { status: 500 })
  }
}
