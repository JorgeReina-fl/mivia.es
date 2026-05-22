'use client'

import { Phone, MessageCircle, Menu, X } from 'lucide-react'
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

interface TemplatImpactoProps {
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
      className={`transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE: Header negro
   Fondo negro, logo caps blanco, hamburguesa, CTA cuadrado primary
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
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-black border-b-2 border-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo caps blanco */}
          <a
            href="#inicio"
            className="text-base md:text-lg font-black uppercase tracking-tight text-white hover:opacity-70 transition-opacity"
          >
            {businessName}
          </a>

          {/* Hamburguesa + CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-white hover:opacity-70 transition-opacity"
              aria-label="Menu"
            >
              {menuOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
            </button>

            {/* CTA cuadrado primary */}
            <a
              href={`tel:${phone}`}
              className="px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-black uppercase tracking-tight text-black transition-all hover:opacity-90"
              style={{ background: colors.primary }}
            >
              LLAMAR
            </a>
          </div>
        </div>
      </header>

      {/* Menu mobile fullscreen */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-8 p-6">
          <a
            href="#servicios"
            onClick={() => setMenuOpen(false)}
            className="text-3xl font-black uppercase text-white hover:opacity-70"
          >
            SERVICIOS
          </a>
          <a
            href="#testimonios"
            onClick={() => setMenuOpen(false)}
            className="text-3xl font-black uppercase text-white hover:opacity-70"
          >
            CLIENTES
          </a>
          <a
            href="#contacto"
            onClick={() => setMenuOpen(false)}
            className="text-3xl font-black uppercase text-white hover:opacity-70"
          >
            CONTACTO
          </a>
        </div>
      )}
    </>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Hero
   Fondo negro, headline ENORME caps, primera palabra primary,
   teléfono como elemento tipográfico, foto full bleed con overlay 70%
   ════════════════════════════════════════════════════════════════════════════ */

function HeroSection({
  titleMain,
  titleCity,
  phone,
  colors,
  backgroundPhoto,
  whatsappHref,
}: {
  titleMain: string
  titleCity: string
  phone: string
  colors: HeroColors
  backgroundPhoto?: string
  whatsappHref: string
}) {
  // Primera palabra del título en color primary
  const words = titleMain.split(' ')
  const firstWord = words[0]
  const restWords = words.slice(1).join(' ')

  return (
    <section
      id="inicio"
      className="relative min-h-screen w-full bg-black flex items-center overflow-hidden"
    >
      {/* Foto full bleed con overlay 70% */}
      {backgroundPhoto && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundPhoto})` }}
          />
          <div className="absolute inset-0 bg-black/70" />
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <AnimatedOnScroll delay={0}>
          {/* Headline ENORME en caps */}
          <h1 className="font-black uppercase leading-[0.9] tracking-tighter mb-8" style={{ fontSize: 'clamp(48px, 10vw, 120px)' }}>
            <span style={{ color: colors.primary }}>{firstWord}</span>{' '}
            <span className="text-white">{restWords}</span>
          </h1>

          {/* Ciudad */}
          <p className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white/70 mb-12">
            {titleCity}
          </p>

          {/* Teléfono como elemento tipográfico (no botón) */}
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-wide text-white/50 mb-2">
              TELÉFONO
            </p>
            <a
              href={`tel:${phone}`}
              className="text-3xl md:text-5xl font-black tracking-tight text-white hover:opacity-70 transition-opacity"
            >
              {phone}
            </a>
          </div>

          {/* CTAs cuadrados */}
          <div className="flex flex-wrap gap-4">
            <a
              href={`tel:${phone}`}
              className="px-8 py-4 bg-white text-black text-sm font-black uppercase tracking-tight transition-all hover:opacity-90"
            >
              LLAMAR AHORA
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-black text-sm font-black uppercase tracking-tight transition-all hover:opacity-90"
              style={{ background: colors.primary }}
            >
              WHATSAPP
            </a>
          </div>
        </AnimatedOnScroll>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Services
   Lista con →, sin imágenes, líneas 2px negras entre items,
   número pequeño en primary
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
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-black mb-16">
            SERVICIOS
          </h2>
        </AnimatedOnScroll>

        <div className="space-y-0">
          {data.slice(0, 6).map((service, i) => (
            <AnimatedOnScroll key={i} delay={i * 0.08}>
              <article className="border-t-2 border-black py-8 group hover:bg-black hover:text-white transition-colors">
                <div className="flex items-start gap-6">
                  {/* → símbolo */}
                  <div className="flex-shrink-0 text-3xl md:text-4xl font-black pt-1">
                    →
                  </div>

                  <div className="flex-1">
                    {/* Número pequeño primary */}
                    <div
                      className="text-xs font-black uppercase tracking-wide mb-2"
                      style={{ color: colors.primary }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>

                    {/* Título caps bold */}
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3">
                      {service.title}
                    </h3>

                    {/* Descripción */}
                    <p className="text-base md:text-lg leading-relaxed opacity-70">
                      {service.description}
                    </p>
                  </div>
                </div>
              </article>
            </AnimatedOnScroll>
          ))}

          {/* Última línea */}
          <div className="border-t-2 border-black" />
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   SECCIÓN: Trust
   Fondo primary, 4 números ENORMES text-8xl en 2 columnas, texto blanco
   ════════════════════════════════════════════════════════════════════════════ */

function TrustSection({
  data,
  colors,
}: {
  data: TrustData
  colors: HeroColors
}) {
  return (
    <section className="py-24 px-6" style={{ background: colors.primary }}>
      <div className="max-w-6xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {data.badges.slice(0, 4).map((badge, i) => (
              <div key={i} className="text-center md:text-left">
                {/* Número ENORME */}
                <div className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-4 text-black">
                  {badge.number}
                </div>
                {/* Label caps pequeño */}
                <div className="text-xs md:text-sm font-black uppercase tracking-wide text-black/70">
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
   Fondo negro, citas en caps, comillas enormes primary, nombre con —
   ════════════════════════════════════════════════════════════════════════════ */

function TestimonialsSection({
  data,
  colors,
}: {
  data: Testimonial[]
  colors: HeroColors
}) {
  return (
    <section id="testimonios" className="py-24 px-6 bg-black">
      <div className="max-w-5xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-16">
            CLIENTES
          </h2>
        </AnimatedOnScroll>

        <div className="space-y-16">
          {data.slice(0, 3).map((testimonial, i) => (
            <AnimatedOnScroll key={i} delay={i * 0.1}>
              <blockquote>
                {/* Comillas enormes primary */}
                <div
                  className="text-6xl md:text-8xl font-black leading-none mb-6"
                  style={{ color: colors.primary }}
                >
                  &quot;
                </div>

                {/* Cita en caps */}
                <p className="text-xl md:text-3xl font-black uppercase tracking-tight leading-tight text-white mb-8">
                  {testimonial.text}
                </p>

                {/* Nombre con — delante */}
                <cite className="not-italic text-sm md:text-base font-black uppercase tracking-wide text-white/50">
                  — {testimonial.author}
                </cite>
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
   Fondo blanco, heading caps enorme, story en columnas, values lista →
   ════════════════════════════════════════════════════════════════════════════ */

function AboutSection({
  data,
}: {
  data: AboutData
}) {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <AnimatedOnScroll delay={0}>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-black mb-16">
            {data.heading}
          </h2>
        </AnimatedOnScroll>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Story */}
          <AnimatedOnScroll delay={0.1}>
            <p className="text-base md:text-lg leading-relaxed text-black/70 whitespace-pre-line">
              {data.story}
            </p>
          </AnimatedOnScroll>

          {/* Values lista → */}
          <AnimatedOnScroll delay={0.15}>
            <div className="space-y-4">
              {data.values.map((value, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-2xl font-black pt-1">→</div>
                  <p className="text-base md:text-lg font-bold uppercase tracking-tight text-black pt-1">
                    {value}
                  </p>
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
   "LLÁMANOS." tipografía masiva, número como headline,
   botones cuadrados negro + primary
   ════════════════════════════════════════════════════════════════════════════ */

function ContactSection({
  phone,
  whatsapp,
  colors,
}: {
  phone: string
  whatsapp: string
  colors: HeroColors
}) {
  return (
    <section id="contacto" className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <AnimatedOnScroll delay={0}>
          {/* LLÁMANOS. */}
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none text-black mb-8">
            LLÁMANOS.
          </h2>

          {/* Número como headline */}
          <a
            href={`tel:${phone}`}
            className="inline-block text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-black mb-12 hover:opacity-70 transition-opacity"
          >
            {phone}
          </a>

          {/* Botones cuadrados */}
          <div className="flex flex-wrap gap-4">
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-3 px-10 py-5 bg-black text-white text-sm font-black uppercase tracking-tight transition-all hover:opacity-90"
            >
              <Phone size={20} strokeWidth={3} />
              LLAMAR
            </a>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 text-black text-sm font-black uppercase tracking-tight transition-all hover:opacity-90"
              style={{ background: colors.primary }}
            >
              <MessageCircle size={20} strokeWidth={3} />
              WHATSAPP
            </a>
          </div>
        </AnimatedOnScroll>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   FOOTER
   Borde superior 4px primary, fondo negro, todo caps, una línea
   ════════════════════════════════════════════════════════════════════════════ */

function Footer({
  businessName,
  city,
  colors,
}: {
  businessName: string
  city: string
  colors: HeroColors
}) {
  return (
    <footer
      className="bg-black py-8"
      style={{ borderTop: `4px solid ${colors.primary}` }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-black uppercase tracking-wide text-white/50">
          <div>© {new Date().getFullYear()} {businessName} · {city}</div>
          <div>
            POWERED BY{' '}
            <a
              href="https://mivia.es"
              className="text-white/70 hover:text-white transition-colors"
            >
              MIVIA.ES
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL: TemplatImpacto
   ════════════════════════════════════════════════════════════════════════════ */

export default function TemplatImpacto({
  businessName,
  city,
  phone,
  whatsapp,
  services,
  trust,
  testimonials,
  about,
  colors,
  backgroundPhoto,
}: TemplatImpactoProps) {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ boxShadow: 'none' }}>
      {/* Header negro */}
      <Header businessName={businessName} phone={phone} colors={colors} />

      {/* Hero */}
      <HeroSection
        titleMain={businessName}
        titleCity={`${city}.`}
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
      {testimonials.length > 0 && (
        <TestimonialsSection data={testimonials} colors={colors} />
      )}

      {/* About */}
      <AboutSection data={about} />

      {/* Contact */}
      <ContactSection phone={phone} whatsapp={whatsapp} colors={colors} />

      {/* Footer */}
      <Footer businessName={businessName} city={city} colors={colors} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   EJEMPLO DE USO
   ════════════════════════════════════════════════════════════════════════════

// Inter ya está cargada en el proyecto — no requiere configuración adicional

// Uso:
import TemplatImpacto from '@/templates/TemplatImpacto'

export default function ImpactoPage() {
  return (
    <TemplatImpacto
      businessName="GIMNASIO BRUTAL"
      city="BARCELONA"
      subtitle="ENTRENA SIN EXCUSAS"
      phone="933 456 789"
      whatsapp="https://wa.me/34933456789"
      services={[
        {
          title: "ENTRENAMIENTO FUNCIONAL",
          description: "Rutinas de alta intensidad diseñadas para resultados rápidos. Sin máquinas, solo fuerza y técnica.",
          icon: "dumbbell",
          image: null,
        },
        // ... más servicios
      ]}
      trust={{
        badges: [
          { number: "2K+", label: "MIEMBROS ACTIVOS" },
          { number: "95%", label: "RETENCIÓN" },
          { number: "24/7", label: "ACCESO" },
          { number: "10", label: "AÑOS" },
        ],
        reasons: [], // No se muestran en Impacto
      }}
      testimonials={[
        {
          text: "LOS MEJORES ENTRENADORES DE LA CIUDAD. RESULTADOS REALES EN TIEMPO RÉCORD.",
          author: "MARC SÁNCHEZ",
        },
        // ...
      ]}
      about={{
        heading: "NUESTRA FILOSOFÍA",
        story: "En Gimnasio Brutal no hay excusas. Solo trabajo duro, disciplina y resultados.\n\nDesde 2014 ayudamos a personas normales a conseguir objetivos extraordinarios. Sin trucos, sin atajos. Solo compromiso.",
        values: [
          "ENTRENAMIENTO DE ALTA INTENSIDAD",
          "COMUNIDAD COMPROMETIDA",
          "INSTALACIONES PREMIUM",
          "SIN CONTRATOS DE PERMANENCIA",
        ],
      }}
      contact={{
        phone: "933 456 789",
        hours: "24/7 ABIERTO",
        ctaHeading: "LLÁMANOS.",
      }}
      colors={{
        primary: "#FFFF00",  // Amarillo neón (por defecto)
        accent: "#FFFF00",
      }}
      backgroundPhoto="https://images.unsplash.com/..."
    />
  )
}

 */
