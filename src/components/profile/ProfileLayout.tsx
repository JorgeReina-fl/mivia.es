'use client'
import { useState } from 'react'
import { MessageCircle, Menu, X } from 'lucide-react'
import { DesignPreset } from '@/lib/design-presets'
import Hero from './Hero'
import Services from './Services'
import Trust from './Trust'
import Testimonials from './Testimonials'
import Contact from './Contact'
import Map from './Map'
import ServiceArea from './ServiceArea'
import Portfolio from './Portfolio'

interface ProfileLayoutProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
  businessName: string
  whatsappLink: string
  designPreset: DesignPreset
  businessType: string
}

export default function ProfileLayout({ content, businessName, whatsappLink, designPreset, businessType }: ProfileLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded">
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#inicio" className="font-bold text-xl" style={{ color: content.colors.primary }}>
            {businessName}
          </a>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`${menuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative top-full left-0 right-0 md:top-auto bg-white md:bg-transparent flex-col md:flex-row gap-6 p-6 md:p-0 border-b md:border-0`} aria-label="Navegación principal">
            <a href="#inicio" className="hover:opacity-70 transition">Inicio</a>
            <a href="#servicios" className="hover:opacity-70 transition">Servicios</a>
            <a href="#nosotros" className="hover:opacity-70 transition">Nosotros</a>
            <a href="#contacto" className="hover:opacity-70 transition">Contacto</a>
            <a
              href={`tel:${content.contact.phone}`}
              className="px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
              style={{ background: content.colors.primary }}
            >
              Llamar ahora
            </a>
          </nav>
        </div>
      </header>

      <main id="main" role="main" className={`${designPreset.fontFamily}`}>
        <Hero data={content.hero} colors={content.colors} whatsapp={whatsappLink} designPreset={designPreset} />
        <Services data={content.services} colors={content.colors} designPreset={designPreset} />
        <Trust data={content.trust} colors={content.colors} designPreset={designPreset} />
        <Testimonials data={content.testimonials} />

        {businessType === 'local' && (
          <Map businessName={businessName} city={content.hero.city} />
        )}

        {businessType === 'mobile_service' && (
          <ServiceArea city={content.hero.city} />
        )}

        {businessType === 'portfolio' && (
          <Portfolio
            businessName={businessName}
            colors={content.colors}
            designPreset={designPreset}
          />
        )}

        <Contact data={content.contact} businessName={businessName} colors={content.colors} designPreset={designPreset} />
      </main>

      <footer className="bg-gray-900 text-gray-300 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="font-semibold text-white mb-1">{businessName} - {content.hero.city}</div>
          <div className="text-sm mb-1">Teléfono: {content.contact.phone}</div>
          <div className="text-xs text-gray-500 mt-4">© {new Date().getFullYear()} {businessName}. Todos los derechos reservados. | Powered by mivia.es</div>
        </div>
      </footer>

      <a
        href={whatsappLink}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50 animate-pulse"
        style={{ background: '#25D366' }}
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    </>
  )
}
