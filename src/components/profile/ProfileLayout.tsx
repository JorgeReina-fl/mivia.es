'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, Menu, X } from 'lucide-react'
import { formatPhoneNumber } from '@/lib/format'

interface ProfileLayoutProps {
  children: React.ReactNode
  businessName: string
  phone: string
  city: string
  whatsapp?: string
  colors: {
    primary: string
    accent: string
  }
}

export default function ProfileLayout({ children, businessName, phone, city, whatsapp, colors }: ProfileLayoutProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'backdrop-blur-md bg-white/80 shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="#inicio"
            className="text-xl font-bold tracking-tight text-slate-900 hover:opacity-80 transition-opacity"
          >
            {businessName}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#inicio"
              className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="#servicios"
              className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors"
            >
              Servicios
            </Link>
            <Link
              href="#contacto"
              className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: colors.primary }}
          >
            <Phone size={16} />
            <span className="hidden sm:inline">Llamar ahora</span>
          </a>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20">
          <nav className="flex flex-col p-6 space-y-4">
            <Link
              href="#inicio"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-900 hover:text-slate-600 py-3 border-b border-slate-200"
            >
              Inicio
            </Link>
            <Link
              href="#servicios"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-900 hover:text-slate-600 py-3 border-b border-slate-200"
            >
              Servicios
            </Link>
            <Link
              href="#contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-900 hover:text-slate-600 py-3 border-b border-slate-200"
            >
              Contacto
            </Link>
            <a
              href={`tel:${phone}`}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white"
              style={{ background: colors.primary }}
            >
              <Phone size={20} />
              Llamar ahora
            </a>
          </nav>
        </div>
      )}

      <main>{children}</main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{businessName}</h3>
              <div className="space-y-2 text-slate-400 text-sm">
                <p>{city}</p>
                <a href={`tel:${phone}`} className="block hover:text-white transition-colors">
                  Tel: {formatPhoneNumber(phone)}
                </a>
                {whatsapp && (
                  <a href={whatsapp} className="block hover:text-white transition-colors">
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Navegación</h3>
              <div className="space-y-2 text-slate-400 text-sm">
                <a href="#inicio" className="block hover:text-white transition-colors">Inicio</a>
                <a href="#servicios" className="block hover:text-white transition-colors">Servicios</a>
                <a href="#contacto" className="block hover:text-white transition-colors">Contacto</a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Web profesional</h3>
              <p className="text-slate-400 text-sm">
                Creada con tecnología de última generación para garantizar velocidad, seguridad y presencia online profesional.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div>
              © {new Date().getFullYear()} {businessName}. Todos los derechos reservados. | Powered by{' '}
              <a href="https://mivia.es" className="text-slate-400 hover:text-white transition-colors">
                mivia.es
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
              <a href="https://mivia.es/aviso-legal" className="hover:text-white transition-colors">Aviso Legal</a>
              <a href="https://mivia.es/terminos-y-condiciones" className="hover:text-white transition-colors">Términos y Condiciones</a>
              <a href="https://mivia.es/politica-de-privacidad" className="hover:text-white transition-colors">Política de Privacidad</a>
              <a href="mailto:privacidad@mivia.es" className="hover:text-white transition-colors">privacidad@mivia.es</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
