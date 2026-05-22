'use client'

import { Phone, MessageCircle, Clock, CheckCircle2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/* ════════════════════════════════════════════════════════════════════════════
   TIPOS — Interfaces idénticas a los componentes adjuntos
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
  isReal?: boolean
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

interface TemplatHogarProps {
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
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE: Header sticky siempre visible
   Fondo crema permanente, CTAs accesibles desde el inicio
   ════════════════════════════════════════════════════════════════════════════ */

function StickyHeader({
  businessName,
  phone,
  whatsapp,
}: {
  businessName: string
  phone: string
  whatsapp: string
}) {
  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-sm shadow-sm border-b border-[#1B140E]/8">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="font-sans font-semibold text-[#1B140E]">
          {businessName}
        </span>

        <div className="flex items-center gap-3">
          <a
            href={`tel:+34${phone.replace(/\s/g, '')}`}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3D2817] text-white text-sm font-medium hover:bg-[#5C4A3F] transition-colors"
          >
            <Phone size={14} strokeWidth={2} />
            Llamar
          </a>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <MessageCircle size={14} strokeWidth={2} />
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Hero
   Full-bleed foto con overlay cálido, texto izquierda, CTA terracota
   ════════════════════════════════════════════════════════════════════════════ */

function HeroSection({
  titleMain,
  titleCity,
  subtitle,
  phone,
  colors,
  backgroundPhoto,
  photoAttribution,
  whatsappHref,
}: {
  titleMain: string
  titleCity: string
  subtitle: string
  phone: string
  colors: HeroColors
  backgroundPhoto?: string
  photoAttribution?: string
  whatsappHref: string
}) {
  const hasPhoto = !!backgroundPhoto

  const rootVars = {
    '--hero-primary': colors.primary,
    '--hero-accent': colors.accent,
  } as React.CSSProperties

  // Overlay cálido: degradado 108° con opacidad variable
  const heroBg: React.CSSProperties = hasPhoto
    ? {
        backgroundImage: [
          'linear-gradient(108deg, rgba(27, 20, 14, 0.88) 0%, rgba(27, 20, 14, 0.68) 48%, rgba(27, 20, 14, 0.32) 100%)',
          `url(${backgroundPhoto})`,
        ].join(', '),
        backgroundSize: '100% 100%, cover',
        backgroundPosition: '0 0, center',
        backgroundRepeat: 'no-repeat',
      }
    : {
        background: [
          `radial-gradient(ellipse 58% 58% at 10% 76%, ${colors.primary}28 0%, transparent 65%)`,
          'linear-gradient(158deg, #1B140E 0%, #0F0B08 100%)',
        ].join(', '),
      }

  const topLineStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, transparent 0%, ${colors.primary}99 22%, ${colors.primary}99 78%, transparent 100%)`,
  }

  return (
    <section
      id="inicio"
      style={{ ...heroBg, ...rootVars }}
      className="relative min-h-screen w-full overflow-hidden flex items-center"
    >
      {/* Línea decorativa superior */}
      <div
        aria-hidden="true"
        style={topLineStyle}
        className="absolute top-0 left-0 right-0 h-px z-10"
      />

      {/* Rejilla de puntos (sin foto) */}
      {!hasPhoto && (
        <div
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          className="absolute inset-0 z-0"
        />
      )}

      {/* Contenido */}
      <div className="relative z-20 w-full px-7 md:px-20 py-20">
        <div className="max-w-[576px]">
          {/* H1: 2 líneas, nombre + ciudad en colores */}
          <h1
            className="
              font-sans font-extrabold leading-none tracking-[-0.03em]
              text-[38px] md:text-[66px]
              mb-5
            "
          >
            <span className="block text-white">{titleMain}</span>
            <span className="block" style={{ color: colors.accent }}>
              {titleCity}
            </span>
          </h1>

          {/* Subtítulo */}
          <p
            className="
              font-sans font-light leading-[1.72]
              text-[15px] md:text-[17px]
              text-white/56
              mb-9
              max-w-full md:max-w-[418px]
            "
          >
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Primario — Llamar */}
            <a
              href={`tel:+34${phone.replace(/\s/g, '')}`}
              className="
                inline-flex items-center gap-2
                bg-white hover:bg-white/90
                text-[#0F0B08]
                font-sans font-semibold text-[13.5px] tracking-[-0.01em] leading-none
                px-[22px] py-[13px] rounded-lg
                transition-all duration-150
                hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(255,255,255,0.10)]
                whitespace-nowrap
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-white
              "
            >
              <Phone size={14} strokeWidth={2} />
              Llamar: {phone}
            </a>

            {/* Secundario — WhatsApp */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2
                bg-transparent hover:bg-white/[0.07]
                text-white/82
                font-sans font-medium text-[13.5px] tracking-[-0.01em] leading-none
                px-[22px] py-[13px] rounded-lg
                border border-white/[0.18] hover:border-white/30
                transition-all duration-150
                whitespace-nowrap
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50
              "
            >
              <MessageCircle size={14} strokeWidth={2} />
              WhatsApp gratis
            </a>
          </div>
        </div>
      </div>

      {/* Atribución Unsplash */}
      {hasPhoto && photoAttribution && (
        <p
          className="
            absolute bottom-3 right-4 z-20
            text-[10px] tracking-[0.02em]
            text-white/25
            font-sans
          "
        >
          {photoAttribution}
        </p>
      )}
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Services
   Tarjetas redondeadas con foto/icono, grid 3 col desktop, 1 col móvil
   ════════════════════════════════════════════════════════════════════════════ */

function ServicesSection({
  data,
  colors,
}: {
  data: Service[]
  colors: HeroColors
}) {
  // Mapeo simple de iconos (requiere lucide-react)
  const iconMap: Record<string, React.ReactNode> = {
    wrench: '🔧',
    droplet: '💧',
    zap: '⚡',
    lightbulb: '💡',
    scissors: '✂️',
    sparkles: '✨',
    star: '⭐',
    hammer: '🔨',
    paintbrush: '🎨',
    car: '🚗',
    leaf: '🍃',
    building: '🏢',
  }

  return (
    <section id="servicios" className="py-20 px-6 bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1B140E] mb-4">
              Nuestros Servicios
            </h2>
            <div
              className="w-24 h-1.5 mx-auto rounded-full"
              style={{ background: colors.accent }}
            />
          </div>
        </AnimatedOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.map((service, i) => (
            <AnimatedOnScroll key={i} delay={i * 0.08} className="h-full">
              <article
                className="
                  bg-white rounded-2xl overflow-hidden
                  border border-[#E8E3DC]
                  transition-all duration-300
                  hover:-translate-y-2 hover:shadow-lg
                  flex flex-col h-full
                "
              >
                {/* Foto o icono */}
                {service.image?.url ? (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gray-200">
                    <img
                      src={service.image.url}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Atribución */}
                    <div className="absolute bottom-1 right-1 text-[10px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                      <a
                        href={`${service.image.photographerUrl}?utm_source=mivia&utm_medium=referral`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        {service.image.photographer}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-32 flex items-center justify-center text-4xl"
                    style={{ background: colors.primary + '12' }}
                  >
                    {iconMap[service.icon] || '•'}
                  </div>
                )}

                {/* Contenido */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-[#1B140E] mb-2">
                    {service.title}
                  </h3>
                  <p className="text-[#5C4A3F] leading-relaxed flex-1">
                    {service.description}
                  </p>
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
   Estadísticas (número grande + label) + checkmarks con razones
   ════════════════════════════════════════════════════════════════════════════ */

function TrustSection({
  data,
  colors,
}: {
  data: TrustData
  colors: HeroColors
}) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1B140E] mb-4">
              ¿Por qué elegirnos?
            </h2>
            <div
              className="w-24 h-1.5 mx-auto rounded-full"
              style={{ background: colors.accent }}
            />
          </div>
        </AnimatedOnScroll>

        {/* Estadísticas: fila de 4, sin contenedores */}
        <AnimatedOnScroll delay={0.1} className="mb-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {data.badges.map((badge, i) => (
              <div key={i}>
                <div
                  className="text-5xl md:text-6xl font-black tracking-tighter mb-2"
                  style={{ color: colors.primary }}
                >
                  {badge.number}
                </div>
                <div className="text-sm md:text-base text-[#5C4A3F] font-medium">
                  {badge.label}
                </div>
              </div>
            ))}
          </div>
        </AnimatedOnScroll>

        {/* Checkmarks: grid 2 col */}
        <AnimatedOnScroll delay={0.2} className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {data.reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-none"
                style={{ background: colors.primary + '15' }}
              >
                <CheckCircle2 size={16} style={{ color: colors.primary }} />
              </div>
              <span className="text-[#3D2817] leading-relaxed">{reason}</span>
            </div>
          ))}
        </AnimatedOnScroll>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Testimonials
   Burbujas estilo WhatsApp (#075E54), máx 3, alternando izq/der
   ════════════════════════════════════════════════════════════════════════════ */

function TestimonialsSection({
  data,
  colors,
}: {
  data: Testimonial[]
  colors: HeroColors
}) {
  const whatsappGreen = '#075E54'

  return (
    <section id="testimonios" className="py-20 px-6 bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1B140E] mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <div
              className="w-24 h-1.5 mx-auto rounded-full"
              style={{ background: colors.accent }}
            />
          </div>
        </AnimatedOnScroll>

        <div className="space-y-6 max-w-2xl mx-auto">
          {data.slice(0, 3).map((testimonial, i) => (
            <AnimatedOnScroll
              key={i}
              delay={i * 0.1}
              className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className="max-w-xs md:max-w-sm rounded-2xl px-4 py-3 text-white shadow-md"
                style={{ background: whatsappGreen }}
              >
                <p className="text-[15px] leading-[1.4]">{testimonial.text}</p>
                <div className="mt-2 flex items-center justify-between text-[12px] text-white/80">
                  <span className="font-semibold">{testimonial.author}</span>
                  {testimonial.rating && (
                    <span>{'★'.repeat(testimonial.rating)}</span>
                  )}
                </div>
              </div>
            </AnimatedOnScroll>
          ))}
        </div>
        {!data.every((t) => t.isReal === true) && (
          <p className="text-center text-xs text-gray-400 mt-8 italic">
            * Testimonios ilustrativos. El titular de esta web puede actualizarlos con reseñas reales enviando un mensaje por WhatsApp.
          </p>
        )}
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: About
   2 columnas: texto (heading + story) + pills (valores)
   ════════════════════════════════════════════════════════════════════════════ */

function AboutSection({
  data,
  colors,
}: {
  data: AboutData
  colors: HeroColors
}) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1B140E] mb-4 text-center">
            {data.heading}
          </h2>
          <div
            className="w-24 h-1.5 mx-auto rounded-full mb-12"
            style={{ background: colors.accent }}
          />
        </AnimatedOnScroll>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Columna izquierda: Story */}
          <AnimatedOnScroll delay={0.1}>
            <div className="prose prose-lg max-w-none">
              <p className="text-[#3D2817] leading-[1.8] whitespace-pre-line text-base md:text-lg">
                {data.story}
              </p>
            </div>
          </AnimatedOnScroll>

          {/* Columna derecha: Values como pills */}
          <AnimatedOnScroll delay={0.15}>
            <div className="flex flex-col gap-3">
              {data.values.map((value, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-full border-2"
                  style={{
                    borderColor: colors.primary + '30',
                    background: colors.primary + '08',
                  }}
                >
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: colors.primary }}
                  >
                    ✓
                  </div>
                  <span className="text-[#3D2817] font-medium text-sm md:text-base">
                    {value}
                  </span>
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
   Card prominente con teléfono grande, CTA, horario
   ════════════════════════════════════════════════════════════════════════════ */

function ContactSection({
  data,
  colors,
  businessName,
  city,
  phone,
  whatsapp,
}: {
  data: ContactData
  colors: HeroColors
  businessName: string
  city: string
  phone: string
  whatsapp: string
}) {
  return (
    <section id="contacto" className="py-20 px-6 bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <div
            className="rounded-3xl px-8 md:px-16 py-16 text-center text-white shadow-xl"
            style={{ background: colors.primary }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {data.ctaHeading || `¿Buscas una ${businessName.toLowerCase()}?`}
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Llámanos o escríbenos por WhatsApp. Respuesta rápida.
            </p>

            {/* Número de teléfono grande */}
            <a
              href={`tel:${phone}`}
              className="inline-block text-5xl md:text-7xl font-black tracking-tighter mb-10 hover:scale-105 transition-transform"
            >
              {phone}
            </a>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-xl"
                style={{ color: colors.primary }}
              >
                <Phone size={20} />
                Llamar ahora
              </a>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg text-white transition-all hover:scale-105 hover:shadow-xl"
                style={{ background: colors.accent }}
              >
                <MessageCircle size={20} />
                WhatsApp gratis
              </a>
            </div>

            {/* Horario */}
            {data.hours && (
              <div className="inline-flex items-center gap-2 text-sm text-white/85 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Clock size={16} />
                {data.hours}
              </div>
            )}
          </div>
        </AnimatedOnScroll>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   FOOTER
   Cálido oscuro (#1C1008), 3 columnas: contacto + navegación + hecho con ❤️
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
    <footer className="bg-[#1C1008] text-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Columna 1: Contacto */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F5E6D3]">Contacto</h3>
            <div className="space-y-2 text-[#C9B5A0] text-sm">
              <p className="font-medium">{businessName}</p>
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
            <h3 className="font-bold text-lg mb-4 text-[#F5E6D3]">Navegación</h3>
            <div className="space-y-2 text-[#C9B5A0] text-sm">
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
                Testimonios
              </a>
              <a
                href="#contacto"
                className="block hover:text-white transition-colors"
              >
                Contacto
              </a>
            </div>
          </div>

          {/* Columna 3: Hecho con ❤️ */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#F5E6D3]">
              Hecho con ❤️
            </h3>
            <p className="text-[#C9B5A0] text-sm leading-relaxed">
              Web profesional y moderna para {businessName} en {city}. Creada con
              las mejores tecnologías para garantizar velocidad, seguridad y
              presencia online.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#3D2817] pt-8 text-center text-sm text-[#8B7355]">
          © {new Date().getFullYear()} {businessName}. Todos los derechos
          reservados. | Powered by{' '}
          <a
            href="https://mivia.es"
            className="text-[#C9B5A0] hover:text-white transition-colors"
          >
            mivia.es
          </a>
        </div>
      </div>
    </footer>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL: TemplatHogar
   ════════════════════════════════════════════════════════════════════════════ */

export default function TemplatHogar({
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
  photoAttribution,
}: TemplatHogarProps) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] overflow-x-hidden">
      {/* Sticky header */}
      <StickyHeader
        businessName={businessName}
        phone={phone}
        whatsapp={whatsapp}
      />

      {/* Hero */}
      <HeroSection
        titleMain={businessName}
        titleCity={`${city}.`}
        subtitle={subtitle}
        phone={phone}
        colors={colors}
        backgroundPhoto={backgroundPhoto}
        photoAttribution={photoAttribution}
        whatsappHref={whatsapp}
      />

      {/* Services */}
      <ServicesSection data={services} colors={colors} />

      {/* Trust */}
      <TrustSection data={trust} colors={colors} />

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <TestimonialsSection data={testimonials} colors={colors} />
      )}

      {/* About */}
      <AboutSection data={about} colors={colors} />

      {/* Contact */}
      <ContactSection
        data={contact}
        colors={colors}
        businessName={businessName}
        city={city}
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

import TemplatHogar from '@/templates/TemplatHogar'

export default function TestPage() {
  return (
    <TemplatHogar
      businessName="Panadería García"
      city="Barcelona"
      subtitle="Pan artesanal de cada día. Receta de barrio desde 1987."
      phone="934 234 567"
      whatsapp="https://wa.me/34934234567"
      services={[
        {
          title: "Pan artesanal",
          description: "Hecho cada mañana con harinas de calidad",
          icon: "leaf",
          image: {
            url: "https://images.unsplash.com/...",
            photographer: "Juan Pérez",
            photographerUrl: "https://unsplash.com/@...",
            photoId: "...",
          },
        },
        // ... más servicios
      ]}
      trust={{
        badges: [
          { number: "40+", label: "años de historia" },
          { number: "5K+", label: "clientes" },
          { number: "100%", label: "recetas caseras" },
          { number: "365", label: "días abiertos" },
        ],
        reasons: [
          "Ingredientes 100% naturales",
          "Sin aditivos ni conservantes",
          "Horneado diario a las 6am",
          "Presupuesto flexible",
        ],
      }}
      testimonials={[
        {
          text: "El mejor pan del barrio, sin dudarlo.",
          author: "María López",
          rating: 5,
        },
        // ...
      ]}
      about={{
        heading: "Nuestra historia",
        story: "Desde 1987 García es sinónimo de buen pan en el barrio...",
        values: [
          "Calidad artesanal",
          "Ingredientes naturales",
          "Atención personalizada",
          "Tradición familiar",
        ],
      }}
      contact={{
        phone: "934 234 567",
        hours: "Lun-Sáb 6am-9pm · Dom 8am-2pm",
        ctaHeading: "¿Buscas pan de calidad?",
      }}
      colors={{
        primary: "#C27855",
        accent: "#D9A876",
      }}
      backgroundPhoto="https://images.unsplash.com/..."
      photoAttribution="Foto vía Unsplash"
    />
  )
}

 */
