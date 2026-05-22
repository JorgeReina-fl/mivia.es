'use client'
import AnimatedSection from '@/components/AnimatedSection'

interface AboutProps {
  data: {
    heading: string
    story: string
    values: string[]
  }
  colors: {
    primary: string
    accent: string
  }
}

export default function About({ data, colors }: AboutProps) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {data.heading}
          </h2>
          <div className="w-20 h-1.5 mx-auto rounded-full" style={{ background: colors.accent }} />
        </div>

        <AnimatedSection>
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {data.story}
          </p>
        </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
        <div className="grid md:grid-cols-2 gap-4">
          {data.values.map((value, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: colors.primary + '20' }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: colors.primary }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium text-slate-900">{value}</span>
            </div>
          ))}
        </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
