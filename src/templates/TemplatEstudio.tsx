'use client'

import { Phone, MessageCircle, Clock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/* ════════════════════════════════════════════════════════════════════════════
   TIPOS — Interfaces idénticas a TemplatHogar
   ════════════════════════════════════════════════════════════════════════════ */

interface HeroColors {
  primary: string
  accent: string
}

interface Service {
  icon: string
  title: string
  description: string
  image?: {
    url: string
    photographer: string
    photographerUrl: string
    photoId: string
  } | null
}

interface Testimonial {
  text: string
  author: string
  rating?: number
}

interface TrustData {
  badges: Array<{
    number: string
    label: string
  }>
  reasons: string[]
}

interface AboutData {
  heading: string
  story: string
  values: string[]
}

interface ContactData {
  phone: string
  hours: string
  ctaHeading: string
}

interface TemplatEstudioProps {
  businessName: string
  city: string
  subtitle: string
  phone: string
  whatsapp: string

  services: Service[]
  trust: TrustData
  testimonials: Testimonial[]
  about: AboutData
  contact: ContactData

  colors: HeroColors
  backgroundPhoto?: string
  photoAttribution?: string
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE: AnimatedOnScroll
   Fade-in sutil cuando entra en viewport (sin librerías externas)
   ════════════════════════════════════════════════════════════════════════════ */

function AnimatedOnScroll({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 100)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE: Header oscuro sticky
   Fondo #0F172A, logo blanco izquierda, nav centro, CTA primary
   ════════════════════════════════════════════════════════════════════════════ */

function Header({
  businessName,
  phone,
  colors,
}: {
  businessName: string
  phone: string
  colors: HeroColors
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-[#0F172A] ${
        scrolled ? 'border-b border-white/10' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo blanco izquierda */}
        <a
          href="#inicio"
          className="text-lg md:text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity"
        >
          {businessName}
        </a>

        {/* Nav centro — desktop only */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#servicios"
            className="text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Servicios
          </a>
          <a
            href="#testimonios"
            className="text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Clientes
          </a>
          <a
            href="#contacto"
            className="text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Contacto
          </a>
        </nav>

        {/* CTA primary */}
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: colors.primary }}
        >
          <Phone size={14} strokeWidth={2} />
          <span className="hidden sm:inline">Llamar</span>
        </a>
      </div>
    </header>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Hero
   Fondo oscuro #0F172A, headline Inter Black, línea 2px accent,
   métricas clave, foto con clip-path diagonal
   ════════════════════════════════════════════════════════════════════════════ */

function HeroSection({
  titleMain,
  titleCity,
  subtitle,
  phone,
  colors,
  backgroundPhoto,
  whatsappHref,
  trust,
}: {
  titleMain: string
  titleCity: string
  subtitle: string
  phone: string
  colors: HeroColors
  backgroundPhoto?: string
  whatsappHref: string
  trust: TrustData
}) {
  return (
    <section
      id="inicio"
      className="relative min-h-screen w-full bg-[#0F172A] flex items-center overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Texto izquierda */}
          <div>
            <AnimatedOnScroll delay={0}>
              {/* Subtítulo */}
              <p className="text-sm font-medium tracking-wide uppercase text-white/50 mb-4">
                {subtitle}
              </p>

              {/* Headline Inter Black enorme */}
              <h1 className="text-[42px] md:text-[64px] lg:text-[72px] font-black leading-[1.05] tracking-tight text-white mb-4">
                {titleMain}
              </h1>

              {/* Línea de acento 2px */}
              <div
                className="w-24 h-[2px] mb-6"
                style={{ background: colors.accent }}
              />

              {/* Ciudad */}
              <p className="text-2xl md:text-3xl font-bold text-white/70 mb-12">
                {titleCity}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 items-center mb-16">
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: colors.primary }}
                >
                  <Phone size={16} strokeWidth={2} />
                  Llamar ahora
                </a>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 text-white text-sm font-semibold border border-white/20 transition-all hover:bg-white/15"
                >
                  <MessageCircle size={16} strokeWidth={2} />
                  WhatsApp
                </a>
              </div>

              {/* Métricas clave — fila de 3 */}
              <div className="grid grid-cols-3 gap-6">
                {trust.badges.slice(0, 3).map((badge, i) => (
                  <div key={i}>
                    <div
                      className="text-3xl md:text-4xl font-black tracking-tight mb-1"
                      style={{ color: colors.accent }}
                    >
                      {badge.number}
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wide text-white/50">
                      {badge.label}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedOnScroll>
          </div>

          {/* Imagen derecha con clip-path diagonal */}
          {backgroundPhoto && (
            <div className="hidden md:block">
              <AnimatedOnScroll delay={0.15}>
                <div
                  className="relative w-full h-[500px] bg-white/5"
                  style={{ clipPath: 'polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
                >
                  <img
                    src={backgroundPhoto}
                    alt={titleMain}
                    className="w-full h-full object-cover"
                  />
                </div>
              </AnimatedOnScroll>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Services
   Lista numerada (01, 02, 03), número grande gris/20 de fondo,
   thumbnail 80x80 a la derecha si hay imagen
   ════════════════════════════════════════════════════════════════════════════ */

function ServicesSection({
  data,
  colors,
}: {
  data: Service[]
  colors: HeroColors
}) {
  return (
    <section id="servicios" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#1E293B] mb-4">
              Servicios
            </h2>
            <div
              className="w-16 h-[2px]"
              style={{ background: colors.accent }}
            />
          </div>
        </AnimatedOnScroll>

        <div className="space-y-0">
          {data.slice(0, 6).map((service, i) => (
            <AnimatedOnScroll key={i} delay={i * 0.08}>
              <article className="relative border-b border-gray-200 py-8 group hover:bg-gray-50/50 transition-colors">
                {/* Número grande gris/20 de fondo */}
                <div
                  className="absolute top-4 left-0 text-[120px] font-black leading-none text-gray-900/5 select-none"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className="relative flex items-start justify-between gap-6">
                  <div className="flex-1">
                    {/* Número pequeño */}
                    <div
                      className="text-sm font-bold mb-3"
                      style={{ color: colors.primary }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>

                    {/* Título bold */}
                    <h3 className="text-2xl font-bold tracking-tight text-[#1E293B] mb-3">
                      {service.title}
                    </h3>

                    {/* Descripción */}
                    <p className="text-base leading-relaxed text-gray-600 max-w-2xl">
                      {service.description}
                    </p>
                  </div>

                  {/* Thumbnail 80x80 si hay imagen */}
                  {service.image?.url && (
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 overflow-hidden">
                      <img
                        src={service.image.url}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  )}
                </div>
              </article>
            </AnimatedOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Trust
   Grid 2x2, bordes 1px entre celdas, número enorme primary + label Inter 500
   ════════════════════════════════════════════════════════════════════════════ */

function TrustSection({
  data,
  colors,
}: {
  data: TrustData
  colors: HeroColors
}) {
  return (
    <section className="py-24 px-6 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <div className="grid grid-cols-2 border border-gray-200">
            {data.badges.slice(0, 4).map((badge, i) => (
              <div
                key={i}
                className={`p-8 md:p-12 text-center ${
                  i === 0 || i === 2 ? 'border-r border-gray-200' : ''
                } ${i === 0 || i === 1 ? 'border-b border-gray-200' : ''}`}
              >
                {/* Número enorme */}
                <div
                  className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-3"
                  style={{ color: colors.primary }}
                >
                  {badge.number}
                </div>
                {/* Label Inter 500 */}
                <div className="text-xs md:text-sm font-medium uppercase tracking-wide text-gray-500">
                  {badge.label}
                </div>
              </div>
            ))}
          </div>
        </AnimatedOnScroll>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Testimonials
   Cards limpias fondo gris/5, sin comillas decorativas,
   texto + nombre caps + empresa/sector
   ════════════════════════════════════════════════════════════════════════════ */

function TestimonialsSection({
  data,
}: {
  data: Testimonial[]
}) {
  return (
    <section id="testimonios" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#1E293B] mb-2">
              Lo que dicen nuestros clientes
            </h2>
          </div>
        </AnimatedOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.slice(0, 6).map((testimonial, i) => (
            <AnimatedOnScroll key={i} delay={i * 0.1}>
              <article className="bg-gray-50 p-8 border border-gray-100 hover:border-gray-200 transition-colors">
                {/* Texto */}
                <p className="text-base leading-relaxed text-gray-700 mb-6">
                  {testimonial.text}
                </p>

                {/* Separador */}
                <div className="w-8 h-px bg-gray-300 mb-4" />

                {/* Nombre en caps */}
                <div className="text-xs font-bold uppercase tracking-wide text-[#1E293B]">
                  {testimonial.author}
                </div>
              </article>
            </AnimatedOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: About
   Timeline visual, story columna izquierda, values como pasos numerados derecha
   ════════════════════════════════════════════════════════════════════════════ */

function AboutSection({
  data,
  colors,
}: {
  data: AboutData
  colors: HeroColors
}) {
  return (
    <section className="py-24 px-6 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Columna izquierda: Heading + Story */}
          <AnimatedOnScroll delay={0}>
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#1E293B] mb-4">
                {data.heading}
              </h2>
              <div
                className="w-16 h-[2px] mb-8"
                style={{ background: colors.accent }}
              />
              <p className="text-base md:text-lg leading-relaxed text-gray-600 whitespace-pre-line">
                {data.story}
              </p>
            </div>
          </AnimatedOnScroll>

          {/* Columna derecha: Values como pasos numerados */}
          <AnimatedOnScroll delay={0.15}>
            <div className="space-y-6">
              {data.values.map((value, i) => (
                <div key={i} className="flex items-start gap-4">
                  {/* Número */}
                  <div
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center font-bold text-sm text-white"
                    style={{ background: colors.primary }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {/* Texto */}
                  <div className="flex-1 pt-2">
                    <p className="text-base font-medium text-[#1E293B]">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedOnScroll>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Contact
   Fondo colors.primary, teléfono blanco gigante,
   botones: blanco sólido + transparente blanco/20
   ════════════════════════════════════════════════════════════════════════════ */

function ContactSection({
  data,
  colors,
  phone,
  whatsapp,
}: {
  data: ContactData
  colors: HeroColors
  phone: string
  whatsapp: string
}) {
  return (
    <section
      id="contacto"
      className="py-24 px-6"
      style={{ background: colors.primary }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <AnimatedOnScroll delay={0}>
          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6">
            {data.ctaHeading}
          </h2>

          {/* Teléfono blanco gigante */}
          <a
            href={`tel:${phone}`}
            className="inline-block text-5xl md:text-7xl font-black tracking-tight text-white mb-12 hover:opacity-80 transition-opacity"
          >
            {phone}
          </a>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 bg-white text-[#1E293B] font-semibold text-sm px-10 py-3 transition-all hover:bg-white/90"
            >
              <Phone size={16} strokeWidth={2} />
              Llamar ahora
            </a>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold text-sm px-10 py-3 border border-white/30 transition-all hover:bg-white/30"
            >
              <MessageCircle size={16} strokeWidth={2} />
              WhatsApp
            </a>
          </div>

          {/* Horario */}
          {data.hours && (
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/70">
              <Clock size={14} strokeWidth={2} />
              {data.hours}
            </div>
          )}
        </AnimatedOnScroll>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   FOOTER
   Oscuro #0F172A, 3 columnas, links de navegación, copyright + Powered by mivia
   ════════════════════════════════════════════════════════════════════════════ */

function Footer({
  businessName,
  city,
  phone,
  whatsapp,
}: {
  businessName: string
  city: string
  phone: string
  whatsapp?: string
}) {
  return (
    <footer className="bg-[#0F172A] text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Columna 1: Contacto */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide mb-4 text-white/90">
              Contacto
            </h3>
            <div className="space-y-2 text-sm text-white/60">
              <p className="font-semibold text-white/90">{businessName}</p>
              <p>{city}</p>
              <a
                href={`tel:${phone}`}
                className="block hover:text-white transition-colors"
              >
                Tel: {phone}
              </a>
              {whatsapp && (
                <a
                  href={whatsapp}
                  className="block hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide mb-4 text-white/90">
              Navegación
            </h3>
            <div className="space-y-2 text-sm text-white/60">
              <a
                href="#inicio"
                className="block hover:text-white transition-colors"
              >
                Inicio
              </a>
              <a
                href="#servicios"
                className="block hover:text-white transition-colors"
              >
                Servicios
              </a>
              <a
                href="#testimonios"
                className="block hover:text-white transition-colors"
              >
                Clientes
              </a>
              <a
                href="#contacto"
                className="block hover:text-white transition-colors"
              >
                Contacto
              </a>
            </div>
          </div>

          {/* Columna 3: Web profesional */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide mb-4 text-white/90">
              Web profesional
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Creada con tecnología de última generación para garantizar
              velocidad, seguridad y presencia online profesional.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div>
            © {new Date().getFullYear()} {businessName}. Todos los derechos
            reservados.
          </div>
          <div>
            Powered by{' '}
            <a
              href="https://mivia.es"
              className="text-white/60 hover:text-white transition-colors"
            >
              mivia.es
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL: TemplatEstudio
   ════════════════════════════════════════════════════════════════════════════ */

export default function TemplatEstudio({
  businessName,
  city,
  subtitle,
  phone,
  whatsapp,
  services,
  trust,
  testimonials,
  about,
  contact,
  colors,
  backgroundPhoto,
}: TemplatEstudioProps) {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header oscuro sticky */}
      <Header businessName={businessName} phone={phone} colors={colors} />

      {/* Hero */}
      <HeroSection
        titleMain={businessName}
        titleCity={`${city}.`}
        subtitle={subtitle}
        phone={phone}
        colors={colors}
        backgroundPhoto={backgroundPhoto}
        whatsappHref={whatsapp}
        trust={trust}
      />

      {/* Services */}
      <ServicesSection data={services} colors={colors} />

      {/* Trust */}
      <TrustSection data={trust} colors={colors} />

      {/* Testimonials */}
      {testimonials.length > 0 && <TestimonialsSection data={testimonials} />}

      {/* About */}
      <AboutSection data={about} colors={colors} />

      {/* Contact */}
      <ContactSection
        data={contact}
        colors={colors}
        phone={phone}
        whatsapp={whatsapp}
      />

      {/* Footer */}
      <Footer
        businessName={businessName}
        city={city}
        phone={phone}
        whatsapp={whatsapp}
      />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   EJEMPLO DE USO
   ════════════════════════════════════════════════════════════════════════════

// Inter ya está cargada en el proyecto — no requiere configuración adicional

// Uso:
import TemplatEstudio from '@/templates/TemplatEstudio'

export default function EstudioPage() {
  return (
    <TemplatEstudio
      businessName="Estudio Legal García"
      city="Madrid"
      subtitle="Asesoría jurídica integral"
      phone="911 234 567"
      whatsapp="https://wa.me/34911234567"
      services={[
        {
          title: "Derecho mercantil",
          description: "Asesoramiento completo para empresas y autónomos...",
          icon: "briefcase",
          image: null,
        },
        // ... más servicios
      ]}
      trust={{
        badges: [
          { number: "500+", label: "casos resueltos" },
          { number: "98%", label: "casos ganados" },
          { number: "15+", label: "años experiencia" },
          { number: "24h", label: "respuesta" },
        ],
        reasons: [], // No se muestran en Estudio
      }}
      testimonials={[...]}
      about={{
        heading: "Nuestra experiencia",
        story: "Con más de 15 años en el sector...",
        values: [
          "Experiencia en derecho mercantil",
          "Atención personalizada",
          "Respuesta en menos de 24h",
          "Honorarios transparentes",
        ],
      }}
      contact={{
        phone: "911 234 567",
        hours: "Lun-Vie 9am-7pm",
        ctaHeading: "¿Necesitas asesoramiento legal?",
      }}
      colors={{
        primary: "#2563EB",
        accent: "#3B82F6",
      }}
      backgroundPhoto="https://images.unsplash.com/..."
    />
  )
}

 */
