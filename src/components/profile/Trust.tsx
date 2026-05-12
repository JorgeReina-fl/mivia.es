'use client'
import { Check } from 'lucide-react'
import { DesignPreset } from '@/lib/design-presets'

interface TrustProps {
  data: {
    badges: Array<{ number: string; label: string }>
    reasons: string[]
  }
  colors: { primary: string; surface: string }
  designPreset: DesignPreset
}

export default function Trust({ data, colors, designPreset }: TrustProps) {
  return (
    <section id="nosotros" className="py-16 px-6" style={{ background: colors.surface }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">¿Por qué elegirnos?</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {data.badges.map((badge, i) => (
            <div key={i} className={`bg-white p-6 text-center shadow-sm ${designPreset.corners}`}>
              <div className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>{badge.number}</div>
              <div className="text-sm text-gray-600">{badge.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {data.reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={16} className="text-green-600" />
              </div>
              <span className="text-gray-700">{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
