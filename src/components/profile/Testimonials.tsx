'use client'
import { Star } from 'lucide-react'
import AnimatedSection from '@/components/AnimatedSection'

interface Testimonial {
  text: string
  author: string
  rating?: number
  isReal?: boolean
}

interface TestimonialsProps {
  data: Testimonial[]
  colors: {
    primary: string
    accent: string
  }
}

export default function Testimonials({ data, colors }: TestimonialsProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const avatarColors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
  ]

  return (
    <section id="testimonios" className="py-16 px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <div className="w-20 h-1.5 mx-auto rounded-full" style={{ background: colors.accent }} />
        </div>

        <AnimatedSection delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((testimonial, i) => {
            const rating = testimonial.rating || 5
            return (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${avatarColors[i % avatarColors.length]}`}
                  >
                    {getInitials(testimonial.author)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          size={14}
                          className={j < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
              </div>
            )
          })}
        </div>
        </AnimatedSection>
        {!data.every((t) => t.isReal === true) && (
          <p className="text-center text-xs text-gray-400 mt-6 italic">
            * Testimonios ilustrativos. El titular de esta web puede actualizarlos con reseñas reales enviando un mensaje por WhatsApp.
          </p>
        )}
      </div>
    </section>
  )
}
