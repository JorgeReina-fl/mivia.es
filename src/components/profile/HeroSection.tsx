/**
 * HeroSection.tsx — Mivia
 * ─────────────────────────────────────────────────────────────────────────────
 * Hero section para perfiles de negocios locales españoles.
 * Funciona con foto de fondo (overlay oscuro) o sin foto (gradiente + glow).
 *
 * Stack: Next.js 15 · React 19 · Tailwind CSS · lucide-react
 *
 * Decisiones de diseño:
 *  • Alineación izquierda — más editorial, más confianza, menos "Wix 2015"
 *  • H1 en 2 líneas: nombre del negocio (blanco) + ciudad (acento)
 *    El punto final da peso tipográfico de cierre
 *  • Badges SOBRE el H1: el usuario lee credibilidad antes del nombre,
 *    lo que "carga" el titular con más autoridad
 *  • CTA primario = blanco sólido (más impacto sobre oscuro que color)
 *  • Solo 2 elementos decorativos: línea de borde + glow radial/rejilla
 *  • El espacio negativo derecho es intencional (ver: Linear, Vercel)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Phone, MessageCircle } from 'lucide-react';

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface HeroColors {
  /** Color primario del perfil (hex, hsl o cualquier valor CSS válido) */
  primary: string;
  /** Color de acento — versión más clara del primario, para ciudad y detalles */
  accent: string;
}

export interface HeroSectionProps {
  /* Contenido */
  titleMain: string;          // "Fontanería Express"
  titleCity: string;          // "Valencia."  — se muestra en color acento
  subtitle: string;           // Descripción breve, 1–2 líneas
  phone: string;              // "633 380 269"
  badges?: string[];          // Máx. 3 recomendado: ["Presupuesto sin compromiso", ...]

  /* Colores del perfil */
  colors: HeroColors;

  /* Foto de fondo (opcional) */
  backgroundPhoto?: string;          // URL de Unsplash: ?w=1600&q=80&auto=format&fit=crop
  photoAttribution?: string;         // "Foto vía Unsplash"

  /* WhatsApp */
  whatsappHref?: string;             // "https://wa.me/34633380269"
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function HeroSection({
  titleMain,
  titleCity,
  subtitle,
  phone,
  badges = [],
  colors,
  backgroundPhoto,
  photoAttribution,
  whatsappHref = '#',
}: HeroSectionProps) {
  const hasPhoto = !!backgroundPhoto;

  /* ── Estilos dinámicos que Tailwind no puede generar en runtime ────────
     Usamos CSS custom properties en el contenedor raíz para que los hijos
     puedan referenciarlas con bg-[var(--hero-accent)] etc. si hace falta. */
  const rootVars = {
    '--hero-primary': colors.primary,
    '--hero-accent':  colors.accent,
  } as React.CSSProperties;

  /* ── Fondo del hero ────────────────────────────────────────────────────
     Con foto: degradado direccional 108° (92% opaco izq → 16% opaco der)
     encima de la imagen. La foto "asoma" por la derecha sin competir con el texto.

     Sin foto: base oscura + glow radial en esquina inferior-izquierda
     con el color primario del perfil como fuente de luz indirecta. */
  const heroBg: React.CSSProperties = hasPhoto
    ? {
        backgroundImage: [
          'linear-gradient(108deg, rgba(9,9,14,0.92) 0%, rgba(9,9,14,0.62) 48%, rgba(9,9,14,0.16) 100%)',
          `url(${backgroundPhoto})`,
        ].join(', '),
        backgroundSize: '100% 100%, cover',
        backgroundPosition: '0 0, center',
        backgroundRepeat: 'no-repeat',
      }
    : {
        /* El order importa: el glow va ENCIMA del gradiente base */
        background: [
          `radial-gradient(ellipse 58% 58% at 10% 76%, ${colors.primary}38 0%, transparent 65%)`,
          'linear-gradient(158deg, #09090E 0%, #0B0B14 100%)',
        ].join(', '),
      };

  /* ── Top-edge accent line ──────────────────────────────────────────────
     Línea de 1px con el color primario del perfil que actúa como "firma"
     de marca. El degradado horizontal la hace sutil, no gritona. */
  const topLineStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, transparent 0%, ${colors.primary}BB 22%, ${colors.primary}BB 78%, transparent 100%)`,
  };

  return (
    <section
      style={{ ...heroBg, ...rootVars }}
      className="relative min-h-screen w-full overflow-hidden flex items-center"
    >
      {/* ── Decorativo 1: línea de borde superior ──────────────────────── */}
      <div
        aria-hidden="true"
        style={topLineStyle}
        className="absolute top-0 left-0 right-0 h-px z-10"
      />

      {/* ── Decorativo 2: rejilla de puntos (solo variante sin foto) ───────
          Añade textura y profundidad sin ruido. Inspirado en el tratamiento
          de fondo de Linear.app.
          Tailwind no tiene una utilidad para dot-grid, necesita style prop. */}
      {!hasPhoto && (
        <div
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.030) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          className="absolute inset-0 z-0"
        />
      )}

      {/* ── Contenido ──────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full px-7 md:px-20">
        <div className="max-w-[576px]">

          {/* Badges de confianza
              Posición estratégica: encima del titular.
              El usuario procesa credibilidad ANTES de leer el nombre,
              lo que amplifica el impacto del H1. */}
          {badges.length > 0 && (
            <ul
              aria-label="Sellos de confianza"
              className="flex flex-wrap gap-2 mb-7 list-none p-0"
            >
              {badges.map((badge) => (
                <li
                  key={badge}
                  style={{ borderColor: 'rgba(255,255,255,0.11)' }}
                  className="
                    inline-flex items-center gap-1.5
                    bg-white/[0.07] border rounded-[4px]
                    px-3 py-[5px]
                    text-[11.5px] font-medium tracking-[0.025em] leading-none
                    text-white/70
                    font-sans
                  "
                >
                  {/* Diamante en color acento — micro-detalle que ancla la paleta */}
                  <span
                    aria-hidden="true"
                    style={{ color: colors.accent, fontSize: 7 }}
                  >
                    ✦
                  </span>
                  {badge}
                </li>
              ))}
            </ul>
          )}

          {/* H1
              Tipografía: Bricolage Grotesque 800, tracking muy ajustado (-0.03em).
              2 líneas: nombre del negocio en blanco + ciudad en acento.
              El punto al final de la ciudad actúa como "cierre" visual. */}
          <h1
            className="
              font-display font-extrabold leading-none tracking-[-0.03em]
              text-[38px] md:text-[66px]
              mb-5
            "
          >
            <span className="block text-white">{titleMain}</span>
            <span className="block" style={{ color: colors.accent }}>
              {titleCity}
            </span>
          </h1>

          {/* Subtítulo
              Peso 300 + opacidad 56% para subordinarse al H1.
              max-w-[418px] evita líneas demasiado largas en desktop. */}
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

          {/* CTAs
              Primario: blanco sólido, texto oscuro.
              Por qué blanco y no el color primario: sobre un fondo oscuro,
              el blanco tiene mayor contraste y "peso" visual. El color primario
              queda reservado para los detalles de acento (badges, ciudad).

              Secundario: ghost (fondo transparente + borde semitransparente).
              Está presente pero no compite. */}
          <div className="flex flex-wrap gap-2.5 items-center">

            {/* Primario — Llamar */}
            <a
              href={`tel:+34${phone.replace(/\s/g, '')}`}
              className="
                inline-flex items-center gap-2
                bg-white hover:bg-white/90
                text-[#09090E]
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

      {/* Atribución Unsplash (WCAG: texto suficientemente pequeño para no distraer) */}
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
  );
}

/* ── Usage example ──────────────────────────────────────────────────────── */
/*

// tailwind.config.ts — registra las fuentes
theme: {
  extend: {
    fontFamily: {
      display: ['Bricolage Grotesque', 'sans-serif'],
      sans:    ['DM Sans', 'sans-serif'],
    },
  },
},

// app/layout.tsx — carga Google Fonts
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
});
const body = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
});

// Fontanero con foto:
<HeroSection
  titleMain="Fontanería Express"
  titleCity="Valencia."
  subtitle="Tu fontanero de confianza en el barrio, con presupuesto claro y rápido."
  phone="633 380 269"
  badges={["Presupuesto sin compromiso", "3 años en el barrio"]}
  colors={{ primary: '#2563EB', accent: '#93C5FD' }}
  backgroundPhoto="https://images.unsplash.com/.../photo-1621905251189?w=1600&q=80&auto=format&fit=crop"
  photoAttribution="Foto vía Unsplash"
  whatsappHref="https://wa.me/34633380269"
/>

// Peluquería sin foto (gradiente automático):
<HeroSection
  titleMain="Cortes & Estilo"
  titleCity="Madrid."
  subtitle="Tu peluquería de barrio. Colores premium sin amoníaco y sin cita previa."
  phone="611 234 567"
  badges={["Colores sin amoníaco", "Sin cita previa"]}
  colors={{ primary: '#DB2777', accent: '#F9A8D4' }}
  whatsappHref="https://wa.me/34611234567"
/>

*/
