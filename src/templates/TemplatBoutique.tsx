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

interface TemplatBoutiqueProps {
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
   COMPONENTE: Header sticky
   Fondo blanco/80 blur, logo serif izquierda, nav centro, CTA derecha
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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md bg-white/80 border-b border-black/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo izquierda — serif */}
        <a
          href="#inicio"
          className="font-serif text-xl md:text-2xl font-normal tracking-tight text-[#0A0A0A] hover:opacity-70 transition-opacity"
        >
          {businessName}
        </a>

        {/* Nav centro — desktop only */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#servicios"
            className="text-sm font-light text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors tracking-wide"
          >
            Servicios
          </a>
          <a
            href="#testimonios"
            className="text-sm font-light text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors tracking-wide"
          >
            Testimonios
          </a>
          <a
            href="#contacto"
            className="text-sm font-light text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors tracking-wide"
          >
            Contacto
          </a>
        </nav>

        {/* CTA derecha */}
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-2 px-5 py-2 bg-[#0A0A0A] text-white text-sm font-light tracking-wide transition-all hover:bg-[#0A0A0A]/90"
        >
          <Phone size={14} strokeWidth={1.5} />
          <span className="hidden sm:inline">Llamar</span>
        </a>
      </div>
    </header>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Hero
   Texto izquierda (60%) + imagen derecha (40%) en aspect 3:4
   H1 Playfair Display grande, subtítulo caps con tracking
   ════════════════════════════════════════════════════════════════════════════ */

function HeroSection({
  titleMain,
  titleCity,
  subtitle,
  phone,
  colors,
  backgroundPhoto,
  whatsappHref,
}: {
  titleMain: string
  titleCity: string
  subtitle: string
  phone: string
  colors: HeroColors
  backgroundPhoto?: string
  whatsappHref: string
}) {
  return (
    <section
      id="inicio"
      className="relative min-h-screen w-full bg-[#F9F8F6] flex items-center"
    >
      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid md:grid-cols-5 gap-12 items-center">
          {/* Texto izquierda — 60% */}
          <div className="md:col-span-3">
            <AnimatedOnScroll delay={0}>
              {/* Subtítulo en caps pequeño */}
              <p className="text-[10px] md:text-[11px] font-light tracking-[0.2em] uppercase text-[#0A0A0A]/50 mb-6">
                {subtitle}
              </p>

              {/* H1 Playfair Display grande */}
              <h1 className="font-serif font-normal leading-[1.1] tracking-tight text-[42px] md:text-[72px] lg:text-[84px] text-[#0A0A0A] mb-6">
                {titleMain}
              </h1>

              {/* Ciudad en dorado */}
              <p
                className="font-serif italic text-[28px] md:text-[38px] mb-12"
                style={{ color: colors.accent || '#C9A96E' }}
              >
                {titleCity}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Primario — negro sólido */}
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 bg-[#0A0A0A] text-white font-light text-sm tracking-wide px-8 py-3 transition-all hover:bg-[#0A0A0A]/90"
                >
                  <Phone size={16} strokeWidth={1.5} />
                  Llamar ahora
                </a>

                {/* Secundario — fantasma */}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-transparent text-[#0A0A0A] font-light text-sm tracking-wide px-8 py-3 border border-[#0A0A0A]/20 transition-all hover:border-[#0A0A0A]/40"
                >
                  <MessageCircle size={16} strokeWidth={1.5} />
                  WhatsApp
                </a>
              </div>
            </AnimatedOnScroll>
          </div>

          {/* Imagen derecha — 40%, aspect 3:4 */}
          {backgroundPhoto && (
            <div className="md:col-span-2">
              <AnimatedOnScroll delay={0.15}>
                <div className="relative w-full aspect-[3/4] bg-[#F2F0EC] overflow-hidden">
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
   Grid 3 columnas, imagen 3:4 arriba, número romano dorado, título serif
   ════════════════════════════════════════════════════════════════════════════ */

function ServicesSection({
  data,
  colors,
}: {
  data: Service[]
  colors: HeroColors
}) {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI']

  return (
    <section id="servicios" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <div className="text-center mb-20">
            <h2 className="font-serif text-[38px] md:text-[52px] font-normal tracking-tight text-[#0A0A0A] mb-3">
              Nuestros servicios
            </h2>
            <div
              className="w-16 h-px mx-auto"
              style={{ background: colors.accent || '#C9A96E' }}
            />
          </div>
        </AnimatedOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {data.slice(0, 6).map((service, i) => (
            <AnimatedOnScroll key={i} delay={i * 0.1}>
              <article className="group">
                {/* Imagen 3:4 */}
                {service.image?.url ? (
                  <div className="relative w-full aspect-[3/4] bg-[#F2F0EC] overflow-hidden mb-6">
                    <img
                      src={service.image.url}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Atribución */}
                    <div className="absolute bottom-2 right-2 text-[9px] text-white/60 bg-black/30 px-2 py-1 backdrop-blur-sm">
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
                  <div className="w-full aspect-[3/4] bg-[#F2F0EC] mb-6" />
                )}

                {/* Número romano dorado */}
                <p
                  className="text-xs font-light tracking-[0.3em] mb-3"
                  style={{ color: colors.accent || '#C9A96E' }}
                >
                  {romanNumerals[i]}
                </p>

                {/* Título serif */}
                <h3 className="font-serif text-2xl font-normal tracking-tight text-[#0A0A0A] mb-3">
                  {service.title}
                </h3>

                {/* Descripción Inter 300 */}
                <p className="font-light text-[15px] leading-relaxed text-[#0A0A0A]/60">
                  {service.description}
                </p>
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
   Solo estadísticas: número enorme + label fino debajo
   Grid 4 columnas, sin contenedores, SIN checkmarks/reasons
   ════════════════════════════════════════════════════════════════════════════ */

function TrustSection({
  data,
  colors,
}: {
  data: TrustData
  colors: HeroColors
}) {
  return (
    <section className="py-24 px-6 bg-[#F2F0EC]">
      <div className="max-w-6xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {data.badges.map((badge, i) => (
              <div key={i}>
                {/* Número enorme */}
                <div
                  className="font-serif text-[56px] md:text-[72px] font-normal tracking-tight leading-none mb-3"
                  style={{ color: colors.primary }}
                >
                  {badge.number}
                </div>
                {/* Label fino */}
                <div className="text-[11px] md:text-[12px] font-light tracking-[0.15em] uppercase text-[#0A0A0A]/50">
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
   Fondo oscuro #0A0A0A, cita Playfair italic grande, nombre caps con línea
   ════════════════════════════════════════════════════════════════════════════ */

function TestimonialsSection({
  data,
}: {
  data: Testimonial[]
}) {
  return (
    <section id="testimonios" className="py-24 px-6 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-16">
          {data.slice(0, 3).map((testimonial, i) => (
            <AnimatedOnScroll key={i} delay={i * 0.1}>
              <blockquote className="text-center">
                {/* Cita Playfair italic grande */}
                <p className="font-serif italic text-[24px] md:text-[32px] leading-[1.5] text-white/90 mb-8">
                  &quot;{testimonial.text}&quot;
                </p>

                {/* Nombre en caps pequeño con línea decorativa */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-8 h-px bg-white/20" />
                  <cite className="not-italic text-[10px] md:text-[11px] font-light tracking-[0.2em] uppercase text-white/50">
                    {testimonial.author}
                  </cite>
                  <div className="w-8 h-px bg-white/20" />
                </div>
              </blockquote>
            </AnimatedOnScroll>
          ))}
        </div>
        {!data.every((t) => t.isReal === true) && (
          <p className="text-center text-xs text-white/30 mt-8 italic">
            * Testimonios ilustrativos. El titular de esta web puede actualizarlos con reseñas reales enviando un mensaje por WhatsApp.
          </p>
        )}
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: About
   2 columnas: texto izquierda (heading serif + story)
   Values como lista simple con guión — NO pills
   ════════════════════════════════════════════════════════════════════════════ */

function AboutSection({
  data,
  colors,
}: {
  data: AboutData
  colors: HeroColors
}) {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Columna izquierda: Heading + Story */}
          <AnimatedOnScroll delay={0}>
            <div>
              <h2 className="font-serif text-[38px] md:text-[48px] font-normal tracking-tight text-[#0A0A0A] mb-6">
                {data.heading}
              </h2>
              <div
                className="w-12 h-px mb-8"
                style={{ background: colors.accent || '#C9A96E' }}
              />
              <p className="font-light text-[15px] md:text-[16px] leading-[1.8] text-[#0A0A0A]/70 whitespace-pre-line">
                {data.story}
              </p>
            </div>
          </AnimatedOnScroll>

          {/* Columna derecha: Values como lista con guión */}
          <AnimatedOnScroll delay={0.15}>
            <div className="flex flex-col gap-4 md:pt-16">
              {data.values.map((value, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 font-light text-[15px] text-[#0A0A0A]/70"
                >
                  <span className="text-[#0A0A0A]/30 mt-1">—</span>
                  <span>{value}</span>
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
   Minimalista: teléfono serif enorme, botones negro + fantasma, sin card
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
    <section id="contacto" className="py-24 px-6 bg-[#F2F0EC]">
      <div className="max-w-4xl mx-auto text-center">
        <AnimatedOnScroll delay={0}>
          {/* Heading serif */}
          <h2 className="font-serif text-[32px] md:text-[48px] font-normal tracking-tight text-[#0A0A0A] mb-4">
            {data.ctaHeading}
          </h2>

          {/* Teléfono enorme serif */}
          <a
            href={`tel:${phone}`}
            className="inline-block font-serif text-[48px] md:text-[72px] font-normal tracking-tight text-[#0A0A0A] mb-12 hover:opacity-70 transition-opacity"
          >
            {phone}
          </a>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 bg-[#0A0A0A] text-white font-light text-sm tracking-wide px-10 py-3 transition-all hover:bg-[#0A0A0A]/90"
            >
              <Phone size={16} strokeWidth={1.5} />
              Llamar ahora
            </a>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-transparent text-[#0A0A0A] font-light text-sm tracking-wide px-10 py-3 border border-[#0A0A0A]/20 transition-all hover:border-[#0A0A0A]/40"
            >
              <MessageCircle size={16} strokeWidth={1.5} />
              WhatsApp
            </a>
          </div>

          {/* Horario */}
          {data.hours && (
            <div className="inline-flex items-center gap-2 text-[11px] font-light tracking-[0.15em] uppercase text-[#0A0A0A]/50">
              <Clock size={14} strokeWidth={1.5} />
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
   1 línea: "EST. {año}" izquierda + nombre centro + "Powered by mivia" derecha
   Borde superior 1px
   ════════════════════════════════════════════════════════════════════════════ */

function Footer({
  businessName,
}: {
  businessName: string
}) {
  const currentYear = new Date().getFullYear()
  const estYear = currentYear - Math.floor(Math.random() * 30) // Placeholder

  return (
    <footer className="bg-white border-t border-[#0A0A0A]/10 py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-light tracking-[0.1em] uppercase text-[#0A0A0A]/40">
          {/* Izquierda: EST. */}
          <div>Est. {estYear}</div>

          {/* Centro: Nombre */}
          <div className="font-serif text-sm normal-case tracking-tight text-[#0A0A0A]">
            {businessName}
          </div>

          {/* Derecha: Powered by mivia */}
          <div>
            Powered by{' '}
            <a
              href="https://mivia.es"
              className="text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors"
            >
              mivia
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL: TemplatBoutique
   ════════════════════════════════════════════════════════════════════════════ */

export default function TemplatBoutique({
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
}: TemplatBoutiqueProps) {
  return (
    <div className="min-h-screen bg-[#F9F8F6] overflow-x-hidden">
      {/* Header sticky */}
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
      <ContactSection data={contact} colors={colors} phone={phone} whatsapp={whatsapp} />

      {/* Footer */}
      <Footer businessName={businessName} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   EJEMPLO DE USO
   ════════════════════════════════════════════════════════════════════════════

// app/layout.tsx — Cargar Google Fonts
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}

// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      serif: ['var(--font-serif)', 'Playfair Display', 'serif'],
      sans: ['var(--font-sans)', 'Inter', 'system-ui'],
    },
  },
}

// Uso:
import TemplatBoutique from '@/templates/TemplatBoutique'

export default function BoutiquePage() {
  return (
    <TemplatBoutique
      businessName="Atelier Belleza"
      city="Madrid"
      subtitle="Salón de belleza exclusivo"
      phone="911 234 567"
      whatsapp="https://wa.me/34911234567"
      services={[...]}
      trust={{
        badges: [
          { number: "15+", label: "años" },
          { number: "2K+", label: "clientas" },
          { number: "98%", label: "satisfacción" },
          { number: "5★", label: "rating" },
        ],
        reasons: [], // No se usan en Boutique
      }}
      testimonials={[...]}
      about={{...}}
      contact={{...}}
      colors={{
        primary: "#0A0A0A",
        accent: "#C9A96E",
      }}
      backgroundPhoto="https://images.unsplash.com/..."
    />
  )
}

 */
