import { prisma } from './prisma'

export async function getWeeklyVisits(businessId: string) {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const visits = await prisma.pageView.count({
    where: {
      businessId,
      createdAt: { gte: oneWeekAgo }
    }
  })

  return visits
}
