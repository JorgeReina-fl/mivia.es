import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import PortfolioModern, { PortfolioContent, SocialLinks, PortfolioUpload } from '@/templates/PortfolioModern'
import PortfolioMinimal from '@/templates/PortfolioMinimal'
import PortfolioCreative from '@/templates/PortfolioCreative'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params

  const business = await prisma.business.findUnique({
    where: { username, isDeleted: false },
    include: { portfolio: true },
  })

  if (!business?.portfolio) {
    return { title: 'Portfolio no encontrado - mivia.es' }
  }

  const { portfolio } = business
  const title = portfolio.seoTitle || `${portfolio.name} — ${portfolio.profession} | mivia.es`
  const description = portfolio.seoDesc || `Portfolio de ${portfolio.name}, ${portfolio.profession}. ${portfolio.bio.slice(0, 120)}…`
  const image = portfolio.avatarUrl || `https://mivia.es/api/favicon/${username}`

  return {
    title,
    description,
    authors: [{ name: portfolio.name }],
    openGraph: {
      type: 'profile',
      locale: 'es_ES',
      url: `https://${username}.mivia.es/p/${username}`,
      title,
      description,
      siteName: 'mivia.es',
      images: [{ url: image, width: 400, height: 400, alt: portfolio.name }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: `https://${username}.mivia.es/p/${username}`,
    },
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PortfolioPage(
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const business = await prisma.business.findUnique({
    where: { username, isDeleted: false },
    include: {
      portfolio: { include: { uploads: true } },
    },
  })

  if (!business) return notFound()

  // LOCAL_BUSINESS accounts → redirect to their canonical subdomain URL
  if (business.type === 'LOCAL_BUSINESS' || !business.portfolio) {
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'mivia.es'
    redirect(`https://${username}.${baseDomain}`)
  }

  if (business.status === 'suspended' || business.status === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Portfolio no disponible</h1>
          <p className="text-gray-500">Este portfolio ha sido suspendido temporalmente.</p>
        </div>
      </div>
    )
  }

  const { portfolio } = business

  // Coerce Prisma Json → our typed interfaces
  const rawContent = portfolio.content as Record<string, unknown> | null
  const content: PortfolioContent = {
    headline: (rawContent?.headline as string) ?? undefined,
    summary: (rawContent?.summary as string) ?? undefined,
    projects: (rawContent?.projects as PortfolioContent['projects']) ?? [],
    experience: (rawContent?.experience as PortfolioContent['experience']) ?? [],
    education: (rawContent?.education as PortfolioContent['education']) ?? [],
    testimonials: (rawContent?.testimonials as PortfolioContent['testimonials']) ?? [],
    ctaText: (rawContent?.ctaText as string) ?? undefined,
    accentColor: (rawContent?.accentColor as string) ?? undefined,
  }

  const socialLinks: SocialLinks = (portfolio.socialLinks as SocialLinks) ?? {}

  const portfolioData = {
    id: portfolio.id,
    businessId: portfolio.businessId,
    name: portfolio.name,
    profession: portfolio.profession,
    bio: portfolio.bio,
    location: portfolio.location,
    email: portfolio.email,
    website: portfolio.website,
    avatarUrl: portfolio.avatarUrl,
    skills: portfolio.skills,
    generatedHtml: portfolio.generatedHtml,
    seoTitle: portfolio.seoTitle,
    seoDesc: portfolio.seoDesc,
    template: portfolio.template,
    createdAt: portfolio.createdAt,
    updatedAt: portfolio.updatedAt,
    uploads: portfolio.uploads as PortfolioUpload[],
    socialLinks,
    content,
  }

  switch (portfolio.template) {
    case 'minimal':
      return <PortfolioMinimal portfolio={portfolioData} />
    case 'creative':
      return <PortfolioCreative portfolio={portfolioData} />
    default:
      return <PortfolioModern portfolio={portfolioData} />
  }
}
