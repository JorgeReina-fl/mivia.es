'use client'
import { MapPin } from 'lucide-react'

interface ServiceAreaProps {
  city: string
  coverage?: string
}

export default function ServiceArea({ city, coverage }: ServiceAreaProps) {
  return (
    <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
          <MapPin size={40} className="text-blue-700" />
        </div>

        <h2 className="text-4xl font-bold mb-4 text-gray-900">Zona de servicio</h2>
        <p className="text-xl text-gray-600 mb-8">
          {coverage || `Trabajamos en ${city} y alrededores`}
        </p>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <p className="text-gray-700 mb-4">Nos desplazamos a tu domicilio para mayor comodidad</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium">{city}</span>
            <span className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full">Provincia completa</span>
            <span className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full">Servicio urgente</span>
          </div>
        </div>
      </div>
    </section>
  )
}
