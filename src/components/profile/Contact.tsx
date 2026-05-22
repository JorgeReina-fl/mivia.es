'use client'
import { Phone, MessageCircle, Clock } from 'lucide-react'
import AnimatedSection from '@/components/AnimatedSection'
import { formatPhoneNumber } from '@/lib/format'

interface ContactProps {
  data: {
    phone: string
    hours: string
    ctaHeading: string
  }
  colors: {
    primary: string
    accent: string
  }
  whatsapp: string
  businessName: string
  city: string
}

export default function Contact({ data, colors, whatsapp, businessName, city }: ContactProps) {
  return (
    <section id="contacto" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection delay={0.1}>
        <div
          className="rounded-[2rem] px-8 md:px-16 py-16 text-center text-white shadow-2xl"
          style={{ background: colors.primary }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {data.ctaHeading || `¿Buscas una ${businessName.toLowerCase()}?`}
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Llámanos o escríbenos por WhatsApp para pedir tu cita
          </p>

          <a
            href={`tel:${data.phone}`}
            className="inline-block text-5xl md:text-7xl font-black tracking-tighter mb-10 hover:scale-105 transition-transform"
          >
            {formatPhoneNumber(data.phone)}
          </a>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              href={`tel:${data.phone}`}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-xl"
              style={{ color: colors.primary }}
            >
              <Phone size={20} />
              Llamar ahora
            </a>
            <a
              href={whatsapp}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg text-white transition-all hover:scale-105 hover:shadow-xl"
              style={{ background: colors.accent }}
            >
              <MessageCircle size={20} />
              Contactar por WhatsApp
            </a>
          </div>

          {data.hours && (
            <div className="inline-flex items-center gap-2 text-sm text-white/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Clock size={16} />
              Horario de atención: {data.hours}
            </div>
          )}
        </div>
        </AnimatedSection>
      </div>

      <div className="text-center mt-8 text-sm text-slate-500">
        {businessName} - {city}
      </div>
    </section>
  )
}
