'use client'
import { MessageCircle, Clock } from 'lucide-react'
import { DesignPreset } from '@/lib/design-presets'

interface ContactProps {
  data: {
    ctaHeading?: string
    phone: string
    whatsapp: string
    hours: string
  }
  businessName: string
  colors: { primary: string }
  designPreset: DesignPreset
}

export default function Contact({ data, businessName, colors, designPreset }: ContactProps) {
  return (
    <section
      id="contacto"
      className="py-16 px-6 text-white"
      style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)` }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">{data.ctaHeading || `¿Necesitas un ${businessName.toLowerCase()}?`}</h2>
        <p className="text-xl mb-8 opacity-90">Llámanos o escríbenos por WhatsApp para pedir tu cita</p>

        <a href={`tel:${data.phone}`} className="text-4xl font-bold block mb-6 hover:opacity-80 transition">
          {data.phone}
        </a>

        <a
          href={data.whatsapp}
          className={`inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 px-10 py-5 font-bold text-lg transition mb-8 ${designPreset.corners}`}
        >
          <MessageCircle size={24} />
          Contactar por WhatsApp
        </a>

        <div className="flex items-center justify-center gap-2 text-sm opacity-75">
          <Clock size={16} />
          <span>Horario de atención: {data.hours}</span>
        </div>
      </div>
    </section>
  )
}
