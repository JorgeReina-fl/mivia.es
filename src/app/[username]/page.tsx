import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getBusinessByUsername } from '@/lib/cache-business'

// Lazy-load templates for LOCAL_BUSINESS
const TemplatImpacto = dynamic(() => import('@/templates/TemplatImpacto'))
const TemplatHogar = dynamic(() => import('@/templates/TemplatHogar'))
const TemplatBoutique = dynamic(() => import('@/templates/TemplatBoutique'))
const TemplatEstudio = dynamic(() => import('@/templates/TemplatEstudio'))

// Lazy-load Portfolio templates
const PortfolioModern = dynamic(() => import('@/templates/PortfolioModern'))
const PortfolioMinimal = dynamic(() => import('@/templates/PortfolioMinimal'))
const PortfolioCreative = dynamic(() => import('@/templates/PortfolioCreative'))

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params

  const business = await getBusinessByUsername(username)

  if (!business) return { title: 'Página no encontrada - mivia.es' }

  if (business.type === 'PORTFOLIO' && business.portfolio) {
    const { portfolio } = business
    const title = portfolio.seoTitle || `${portfolio.name} — ${portfolio.profession} | mivia.es`
    const description = portfolio.seoDesc || `Portfolio de ${portfolio.name}, ${portfolio.profession}.`
    return { title, description }
  }

  // LOCAL_BUSINESS
  if (business.profile) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = business.profile.content as Record<string, any>
    const seo = content?.seo || {}
    return {
      title: seo.title || `${business.username} | mivia.es`,
      description: seo.description || '',
      openGraph: {
        type: 'website',
        locale: 'es_ES',
        url: `https://${username}.mivia.es`,
        title: seo.title,
        description: seo.description,
        siteName: 'mivia.es',
      },
      alternates: { canonical: `https://${username}.mivia.es` },
    }
  }

  return { title: `${username} | mivia.es` }
}

// ---------------------------------------------------------------------------
// Page — Universal router for both business types
// ---------------------------------------------------------------------------

export default async function BusinessPage(
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const business = await getBusinessByUsername(username)

  if (!business) return notFound()

  if (business.status === 'suspended' || business.status === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm p-8">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Página no disponible</h1>
          <p className="text-gray-500">Esta página ha sido suspendida temporalmente.</p>
        </div>
      </div>
    )
  }

  // ── PORTFOLIO ─────────────────────────────────────────────────────────────
  if (business.type === 'PORTFOLIO') {
    if (!business.portfolio) return notFound()

    const { portfolio } = business
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawContent = portfolio.content as Record<string, any> | null

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      uploads: portfolio.uploads as any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socialLinks: (portfolio.socialLinks as Record<string, any>) ?? {},
      content: {
        headline: rawContent?.headline,
        summary: rawContent?.summary,
        projects: rawContent?.projects ?? [],
        experience: rawContent?.experience ?? [],
        education: rawContent?.education ?? [],
        testimonials: rawContent?.testimonials ?? [],
        ctaText: rawContent?.ctaText,
        accentColor: rawContent?.accentColor,
      },
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

  // ── LOCAL_BUSINESS ────────────────────────────────────────────────────────
  if (!business.profile) return notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = business.profile.content as Record<string, any>
  if (!c) return notFound()

  const templateName = (business.profile.template || 'impacto').toLowerCase()
  const colors = c.colors || { primary: '#1a1a1a', accent: '#f59e0b', surface: '#ffffff' }
  const hero = c.hero || {}
  const backgroundPhoto = hero.image || null

  const commonProps = {
    businessName: hero.title || business.username,
    city: hero.city || '',
    subtitle: hero.subtitle || '',
    phone: hero.phone || '',
    whatsapp: c.contact?.whatsapp || `https://wa.me/${hero.phone}`,
    services: c.services || [],
    trust: c.trust || { badges: [], reasons: [] },
    testimonials: c.testimonials || [],
    about: c.about || { story: '', values: [], heading: '' },
    contact: c.contact || {},
    colors,
    backgroundPhoto: backgroundPhoto?.url || null,
    photoAttribution: backgroundPhoto
      ? `${backgroundPhoto.photographer} / Unsplash`
      : null,
  }

  // Template selection based on profile.template
  switch (templateName) {
    case 'hogar':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <TemplatHogar {...commonProps as any} />
    case 'boutique':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <TemplatBoutique {...commonProps as any} />
    case 'estudio':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <TemplatEstudio {...commonProps as any} />
    case 'impacto':
    case 'default':
    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <TemplatImpacto {...commonProps as any} />
  }
}
