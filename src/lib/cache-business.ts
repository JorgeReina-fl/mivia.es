import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'

export const getBusinessByUsername = unstable_cache(
  async (username: string) => {
    return prisma.business.findUnique({
      where: { username, isDeleted: false },
      include: {
        profile: true,
        portfolio: {
          include: {
            uploads: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })
  },
  ['business-by-username'],
  {
    revalidate: 3600,
    tags: ['business']
  }
)

export async function invalidateBusinessCache() {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('business')
}
