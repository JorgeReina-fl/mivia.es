'use client'
import { Phone, MessageCircle } from 'lucide-react'
import { DesignPreset } from '@/lib/design-presets'

interface HeroProps {
  data: {
    title: string
    city: string
    subtitle: string
    phone: string
    badges: string[]
  }
  colors: {
    primary: string
    accent: string
    surface: string
  }
  whatsapp: string
  designPreset: DesignPreset
}

export default function Hero({ data, colors, whatsapp, designPreset }: HeroProps) {
  return (
    <section
      id="inicio"
      className="relative py-20 px-6 overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${colors.surface} 0%, #ffffff 100%)` }}
    >
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.primary} 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4" style={{ color: colors.primary, letterSpacing: '-0.03em' }}>
          {data.title} en {data.city}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{data.subtitle}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <a
            href={`tel:${data.phone}`}
            className={`flex items-center gap-2 px-8 py-4 font-semibold text-lg border-2 transition-all hover:-translate-y-1 hover:shadow-lg ${designPreset.corners}`}
            style={{ borderColor: colors.primary, color: colors.primary }}
          >
            <Phone size={20} />
            Llamar: {data.phone}
          </a>
          <a
            href={whatsapp}
            className={`flex items-center gap-2 px-8 py-4 font-semibold text-lg text-white transition-all hover:-translate-y-1 hover:shadow-lg ${designPreset.corners}`}
            style={{ background: colors.accent }}
          >
            <MessageCircle size={20} />
            WhatsApp gratis
          </a>
        </div>

        <div className="inline-flex items-center gap-4 bg-green-50 px-6 py-3 rounded-full text-sm text-green-800 border border-green-200">
          {data.badges.map((badge, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="text-green-600">✓</span> {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
