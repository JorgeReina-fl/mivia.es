import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    
    // Buscar el business
    const business = await prisma.business.findUnique({
      where: { username },
      include: {
        portfolio: true
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business no encontrado' }, { status: 404 })
    }

    // Ejecutar transacción para Hard Delete
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar analíticas y actualizaciones
      await tx.pageView.deleteMany({ where: { businessId: business.id } })
      await tx.profileUpdate.deleteMany({ where: { businessId: business.id } })
      
      // 2. Eliminar uploads del portfolio si existe
      if (business.portfolio) {
        await tx.upload.deleteMany({ where: { portfolioId: business.portfolio.id } })
      }
      
      // 3. Eliminar perfiles
      await tx.profile.deleteMany({ where: { businessId: business.id } })
      await tx.portfolio.deleteMany({ where: { businessId: business.id } })
      
      // 4. Eliminar suscripciones
      await tx.subscription.deleteMany({ where: { businessId: business.id } })
      
      // 5. Eliminar sesiones de onboarding asociadas al número
      if (business.phone) {
        await tx.onboardingSession.deleteMany({ where: { phone: business.phone } })
      }
      
      // 6. Eliminar el registro padre
      await tx.business.delete({ where: { id: business.id } })
    })

    console.log(`[ADMIN] Web y recursos eliminados (Hard Delete): ${username}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[ADMIN] Error en Hard Delete:`, error)
    return NextResponse.json({ error: 'Error al eliminar definitivamente' }, { status: 500 })
  }
}
