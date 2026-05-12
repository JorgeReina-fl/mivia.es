import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProfileLayout from '@/components/profile/ProfileLayout'
import { getDesignPreset } from '@/lib/design-presets'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const business = await prisma.business.findUnique({
    where: { username },
    include: { profile: true }
  })
  if (!business?.profile) return {}
  return {
    title: business.profile.seoTitle || business.profile.name,
    description: business.profile.seoDesc || '',
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const business = await prisma.business.findUnique({
    where: { username },
    include: { profile: true }
  })

  if (!business || !business.profile) return notFound()

  if (business.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Perfil no disponible</h1>
          <p className="text-gray-500">Este perfil ha sido suspendido.</p>
        </div>
      </div>
    )
  }

  const { profile } = business
  const designPreset = getDesignPreset(profile.vibe)

  const reportButton = (
    <div style={{ position: 'fixed', bottom: '80px', left: '16px', zIndex: 9999 }}>
      <a
        href={`mailto:abuse@mivia.es?subject=Reporte perfil ${username}`}
        style={{
          background: '#f3f4f6',
          color: '#6b7280',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          textDecoration: 'none',
          border: '1px solid #e5e7eb'
        }}
      >
        ⚑ Reportar
      </a>
    </div>
  )

  if (profile.content) {
    const phoneClean = profile.contactPhone.replace(/\D/g, '').replace(/^0034/, '').replace(/^34/, '')
    const whatsappLink = `https://wa.me/34${phoneClean}?text=Hola%2C%20me%20gustar%C3%ADa%20pedir%20presupuesto`

    return (
      <>
        <ProfileLayout
          content={profile.content}
          businessName={profile.name}
          whatsappLink={whatsappLink}
          designPreset={designPreset}
          businessType={(profile.content as Record<string, string>).businessType || 'local'}
        />
        {reportButton}
      </>
    )
  }

  if (profile.generatedHtml) {
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: profile.generatedHtml }} />
        {reportButton}
      </>
    )
  }

  return notFound()
}
