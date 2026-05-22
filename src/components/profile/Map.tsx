'use client'
import { MapPin, ExternalLink } from 'lucide-react'

interface MapProps {
  businessName: string
  city: string
  address?: string
  colors: {
    primary: string
    accent: string
  }
}

export default function Map({ businessName, city, address, colors }: MapProps) {
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName + ', ' + city)}`

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Dónde encontrarnos
          </h2>
          <div className="w-20 h-1.5 mx-auto rounded-full" style={{ background: colors.accent }} />
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-12 text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: colors.primary + '15' }}
            >
              <MapPin size={40} style={{ color: colors.primary }} />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {businessName}
            </h3>

            {address ? (
              <p className="text-lg text-slate-600 mb-1">{address}</p>
            ) : (
              <p className="text-lg text-slate-600 mb-1">{city}</p>
            )}

            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: colors.primary }}
            >
              <MapPin size={20} />
              Ver en Google Maps
              <ExternalLink size={16} />
            </a>

            <p className="text-sm text-slate-500 mt-4">
              Click para ver ubicación exacta y cómo llegar
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
