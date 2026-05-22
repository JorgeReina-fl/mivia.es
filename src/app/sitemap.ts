import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mivia.es'

  // Obtener todos los negocios activos (trial o active)
  const businesses = await prisma.business.findMany({
    where: {
      status: { in: ['trial', 'active'] },
      isDeleted: false,
    },
    select: {
      username: true,
      createdAt: true
    }
  })

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/onboarding`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }
  ]

  // Páginas dinámicas de perfiles
  const profilePages: MetadataRoute.Sitemap = businesses.map((business) => ({
    url: `https://${business.username}.mivia.es`,
    lastModified: business.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...profilePages]
}
