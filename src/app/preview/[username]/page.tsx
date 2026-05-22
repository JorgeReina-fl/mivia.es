import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import dynamic from 'next/dynamic'

// Lazy-load templates for LOCAL_BUSINESS
const TemplatImpacto = dynamic(() => import('@/templates/TemplatImpacto'))
const TemplatHogar = dynamic(() => import('@/templates/TemplatHogar'))
const TemplatBoutique = dynamic(() => import('@/templates/TemplatBoutique'))
const TemplatEstudio = dynamic(() => import('@/templates/TemplatEstudio'))

// Lazy-load Portfolio templates
const PortfolioModern = dynamic(() => import('@/templates/PortfolioModern'))
const PortfolioMinimal = dynamic(() => import('@/templates/PortfolioMinimal'))
const PortfolioCreative = dynamic(() => import('@/templates/PortfolioCreative'))

export default async function PreviewPage(
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const business = await prisma.business.findUnique({
    where: { username, isDeleted: false },
    include: { geminiDraft: true }
  })

  if (!business) return notFound()

  if (!business.geminiDraft || business.geminiDraft.status !== 'PENDING') {
    redirect('/' + username)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = business.geminiDraft.payload as any

  let contentComponent = null

  if (payload.type === 'PORTFOLIO') {
    const input = payload.originalInput
    const c = payload.geminiOutput || {}

    const portfolioData = {
      id: 'draft',
      businessId: business.id,
      name: input.fullName,
      profession: input.profession,
      bio: input.bio,
      location: input.location,
      email: null,
      website: null,
      avatarUrl: null,
      skills: [],
      generatedHtml: null,
      seoTitle: null,
      seoDesc: null,
      template: input.template || 'modern',
      createdAt: new Date(),
      updatedAt: new Date(),
      uploads: [],
      socialLinks: {},
      content: {
        headline: c.headline,
        summary: c.summary,
        projects: c.projects ?? [],
        experience: c.experience ?? [],
        education: c.education ?? [],
        testimonials: c.testimonials ?? [],
        ctaText: c.ctaText,
        accentColor: c.accentColor,
      },
    }

    switch (portfolioData.template) {
      case 'minimal':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contentComponent = <PortfolioMinimal portfolio={portfolioData as any} />
        break
      case 'creative':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contentComponent = <PortfolioCreative portfolio={portfolioData as any} />
        break
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contentComponent = <PortfolioModern portfolio={portfolioData as any} />
        break
    }
  } else if (payload.type === 'PROFILE') {
    const c = payload.geminiOutput || {}
    const templateName = (c.template || 'impacto').toLowerCase()
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

    switch (templateName) {
      case 'hogar':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contentComponent = <TemplatHogar {...commonProps as any} />
        break
      case 'boutique':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contentComponent = <TemplatBoutique {...commonProps as any} />
        break
      case 'estudio':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contentComponent = <TemplatEstudio {...commonProps as any} />
        break
      case 'impacto':
      case 'default':
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contentComponent = <TemplatImpacto {...commonProps as any} />
        break
    }
  } else {
    return notFound()
  }

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-amber-400 text-slate-900 px-4 py-3 text-center font-bold shadow-lg text-sm sm:text-base border-b border-amber-500 flex items-center justify-center gap-2">
        <span>🚧</span>
        <span>VISTA PRIVADA - Tu web está lista. Revisa tu WhatsApp para aprobarla o editarla.</span>
      </div>
      {contentComponent}
    </>
  )
}
