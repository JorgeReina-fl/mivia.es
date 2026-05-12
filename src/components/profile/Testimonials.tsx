'use client'
import { Star } from 'lucide-react'

interface Testimonial {
  text: string
  author: string
  role: string
}

interface TestimonialsProps {
  data: Testimonial[]
}

export default function Testimonials({ data }: TestimonialsProps) {
  return (
    <section id="testimonios" className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Lo que dicen nuestros clientes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((testimonial, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-6 relative">
              <div className="text-6xl text-gray-200 absolute top-4 left-4 font-serif">&ldquo;</div>
              <div className="flex gap-1 mb-3 relative z-10">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 relative z-10 italic">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="relative z-10">
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
