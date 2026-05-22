'use client'
import * as Icons from 'lucide-react'
import { DesignPreset } from '@/lib/design-presets'
import AnimatedSection from '@/components/AnimatedSection'

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

interface ServicesProps {
  data: Service[]
  colors: { primary: string; accent: string }
  designPreset: DesignPreset
}

export default function Services({ data, colors, designPreset }: ServicesProps) {
  const getIcon = (name: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const iconMap: Record<string, any> = {
      wrench: Icons.Wrench, droplet: Icons.Droplet, pipe: Icons.Circle,
      zap: Icons.Zap, lightbulb: Icons.Lightbulb, plug: Icons.Plug,
      scissors: Icons.Scissors, sparkles: Icons.Sparkles, star: Icons.Star,
      hammer: Icons.Hammer, ruler: Icons.Ruler, saw: Icons.CircleDot,
      paintbrush: Icons.Paintbrush, palette: Icons.Palette, 'spray-can': Icons.SprayCan,
      car: Icons.Car, settings: Icons.Settings,
      leaf: Icons.Leaf, flower: Icons.Flower2, tree: Icons.Trees,
      'hard-hat': Icons.HardHat, building: Icons.Building, truck: Icons.Truck
    }
    return iconMap[name] || Icons.Circle
  }

  return (
    <section id="servicios" className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3 text-gray-900">Nuestros Servicios</h2>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ background: colors.accent }} />
        </div>

        <AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.map((service, i) => {
            const Icon = getIcon(service.icon)
            return (
              <article
                key={i}
                className={`bg-white border border-gray-200 overflow-hidden transition-all hover:-translate-y-2 hover:shadow-xl ${designPreset.corners === 'rounded-full' ? 'rounded-2xl' : designPreset.corners} ${designPreset.depth === 'flat' ? 'shadow-none' : designPreset.depth === 'brutal' ? 'border-2 border-gray-900 shadow-none' : 'shadow-sm'}`}
              >
                {/* Imagen o icono */}
                {service.image?.url ? (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                    <img
                      src={service.image.url}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Atribución de Unsplash */}
                    <div className="absolute bottom-1 right-1 text-[10px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                      <a
                        href={`${service.image.photographerUrl}?utm_source=mivia&utm_medium=referral`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        {service.image.photographer}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg flex items-center justify-center m-6 mb-4" style={{ background: colors.primary + '15' }}>
                    <Icon size={28} style={{ color: colors.primary }} />
                  </div>
                )}

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              </article>
            )
          })}
        </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
