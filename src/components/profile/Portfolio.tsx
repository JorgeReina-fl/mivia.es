'use client'
import { Briefcase, Award, Users } from 'lucide-react'
import { DesignPreset } from '@/lib/design-presets'

interface PortfolioProps {
  businessName: string
  colors: { primary: string; accent: string; surface: string }
  designPreset: DesignPreset
  about?: string
  experience?: string
  skills?: string[]
}

export default function Portfolio({
  businessName,
  colors,
  designPreset,
  about,
  experience,
  skills = []
}: PortfolioProps) {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Hero section "Sobre mí" */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Sobre mí</h2>
          {about && (
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              {about}
            </p>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div
            className={`text-center p-8 bg-white border-2 transition-all hover:shadow-lg ${designPreset.corners}`}
            style={{ borderColor: colors.primary }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: colors.primary + '15' }}
            >
              <Briefcase size={28} style={{ color: colors.primary }} />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Experiencia</h3>
            <p className="text-gray-600">{experience || 'Años en el sector'}</p>
          </div>

          <div
            className={`text-center p-8 bg-white border-2 transition-all hover:shadow-lg ${designPreset.corners}`}
            style={{ borderColor: colors.accent }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: colors.accent + '15' }}
            >
              <Award size={28} style={{ color: colors.accent }} />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Calidad</h3>
            <p className="text-gray-600">Trabajo profesional</p>
          </div>

          <div
            className={`text-center p-8 bg-white border-2 transition-all hover:shadow-lg ${designPreset.corners}`}
            style={{ borderColor: colors.primary }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: colors.primary + '15' }}
            >
              <Users size={28} style={{ color: colors.primary }} />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Proyectos</h3>
            <p className="text-gray-600">Clientes satisfechos</p>
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div
            className={`p-8 mb-12 ${designPreset.corners}`}
            style={{ background: colors.surface }}
          >
            <h3 className="font-semibold text-2xl mb-6 text-gray-900">Habilidades</h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className={`px-4 py-2 bg-white border-2 font-medium ${designPreset.corners}`}
                  style={{ borderColor: colors.primary, color: colors.primary }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder para galería futura */}
        <div
          className={`p-12 border-2 border-dashed text-center ${designPreset.corners}`}
          style={{ borderColor: colors.primary + '40' }}
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: colors.surface }}
          >
            <svg className="w-8 h-8" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-gray-700">Portfolio de trabajos</h3>
          <p className="text-gray-500 text-sm">Próximamente: galería de proyectos y trabajos realizados</p>
        </div>
      </div>
    </section>
  )
}
