export type DesignPreset = {
  id: string
  label: string
  description: string
  fontFamily: 'font-sans' | 'font-serif' | 'font-mono'
  corners: 'rounded-none' | 'rounded-xl' | 'rounded-full'
  depth: 'flat' | 'soft' | 'brutal'
  spacing: 'compact' | 'normal' | 'spacious'
}

export const STYLE_PRESETS: Record<string, DesignPreset> = {
  classic: {
    id: 'classic',
    label: 'Clásico y Profesional',
    description: 'Tipografía serif, bordes rectos, sombras suaves. Ideal para negocios establecidos y servicios profesionales.',
    fontFamily: 'font-serif',
    corners: 'rounded-none',
    depth: 'soft',
    spacing: 'normal'
  },
  modern: {
    id: 'modern',
    label: 'Moderno y Minimalista',
    description: 'Tipografía sans limpia, bordes redondeados, diseño plano. Perfecto para startups y negocios tech.',
    fontFamily: 'font-sans',
    corners: 'rounded-xl',
    depth: 'flat',
    spacing: 'spacious'
  },
  warm: {
    id: 'warm',
    label: 'Cálido y Cercano',
    description: 'Colores pastel, botones suaves, mucho espacio. Ideal para peluquerías, spas y negocios locales.',
    fontFamily: 'font-sans',
    corners: 'rounded-full',
    depth: 'soft',
    spacing: 'normal'
  },
  artisan: {
    id: 'artisan',
    label: 'Artesanal y Único',
    description: 'Tipografía serif, colores tierra, bordes definidos. Para carpinteros, artesanos y negocios con historia.',
    fontFamily: 'font-serif',
    corners: 'rounded-xl',
    depth: 'brutal',
    spacing: 'compact'
  }
}

export const DEFAULT_VIBE = 'modern'

// Helper para obtener preset con fallback seguro
export function getDesignPreset(vibe?: string | null): DesignPreset {
  return STYLE_PRESETS[vibe || DEFAULT_VIBE] || STYLE_PRESETS[DEFAULT_VIBE]
}
