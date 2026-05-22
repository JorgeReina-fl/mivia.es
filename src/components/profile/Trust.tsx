'use client'
import AnimatedSection from '@/components/AnimatedSection'

interface TrustProps {
  data: {
    badges: Array<{
      number: string
      label: string
    }>
    reasons: string[]
  }
  colors: {
    primary: string
    accent: string
  }
}

export default function Trust({ data, colors }: TrustProps) {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            ¿Por qué elegirnos?
          </h2>
          <div className="w-20 h-1.5 mx-auto rounded-full" style={{ background: colors.accent }} />
        </div>

        <AnimatedSection delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
          {data.badges.map((badge, i) => (
            <div key={i} className="text-center">
              <div
                className="text-5xl md:text-6xl font-black tracking-tighter mb-2"
                style={{ color: colors.primary }}
              >
                {badge.number}
              </div>
              <div className="text-sm md:text-base text-slate-600 font-medium">
                {badge.label}
              </div>
            </div>
          ))}
        </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {data.reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                style={{ background: colors.primary + '20' }}
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: colors.primary }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-700 leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
