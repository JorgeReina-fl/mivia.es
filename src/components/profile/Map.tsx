'use client'

interface MapProps {
  businessName: string
  city: string
  address?: string
}

export default function Map({ businessName, city, address }: MapProps) {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(businessName + ' ' + city)}`

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Dónde encontrarnos</h2>
        {address && <p className="text-center text-gray-600 mb-8">{address}</p>}

        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <div className="text-center p-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-600 font-medium">{businessName}</p>
              <p className="text-gray-500 text-sm">{city}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName + ' ' + city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-blue-700 hover:underline font-medium"
              >
                Ver en Google Maps →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
