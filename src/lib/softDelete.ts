import { prisma } from '@/lib/prisma'

/**
 * Borrado lógico de un negocio (RGPD compliant)
 * No borra datos reales — los bloquea durante 5 años
 * según Art. 17 RGPD + normativa mercantil española
 */
export async function softDeleteBusiness(businessId: string) {
  await prisma.business.update({
    where: { id: businessId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      status: 'cancelled',
    }
  })

  // Seudonimizar datos personales en el perfil
  await prisma.profile.updateMany({
    where: { businessId },
    data: {
      contactPhone: 'DELETED',
      // Mantener content para obligaciones fiscales
    }
  })

  console.log(`[SoftDelete] Business ${businessId} marked as deleted`)
}

/**
 * Filtro para excluir negocios borrados en queries normales
 * Usar en todas las queries: where: { ...notDeleted }
 */
export const notDeleted = { isDeleted: false }
