import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const business = await prisma.business.findUnique({
      where: { username, isDeleted: false },
      include: {
        portfolio: {
          include: { uploads: true },
        },
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (!business.portfolio) {
      return NextResponse.json(
        { error: 'Este usuario no tiene portfolio' },
        { status: 404 }
      )
    }

    if (business.status === 'suspended' || business.status === 'cancelled') {
      return NextResponse.json({ error: 'Portfolio no disponible' }, { status: 403 })
    }

    const { portfolio } = business

    return NextResponse.json({
      username: business.username,
      status: business.status,
      portfolio: {
        id: portfolio.id,
        name: portfolio.name,
        profession: portfolio.profession,
        bio: portfolio.bio,
        location: portfolio.location,
        email: portfolio.email,
        website: portfolio.website,
        socialLinks: portfolio.socialLinks,
        skills: portfolio.skills,
        avatarUrl: portfolio.avatarUrl,
        content: portfolio.content,
        generatedHtml: portfolio.generatedHtml,
        seoTitle: portfolio.seoTitle,
        seoDesc: portfolio.seoDesc,
        template: portfolio.template,
        uploads: portfolio.uploads.map((u) => ({
          id: u.id,
          filename: u.filename,
          url: u.url,
          mimeType: u.mimeType,
          category: u.category,
          createdAt: u.createdAt,
        })),
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
      },
    })
  } catch (error) {
    console.error('[portfolio/[username]]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
