interface Service {
  title: string
  description: string
}

interface ProfileContent {
  hero?: { image?: { url?: string }; subtitle?: string; city?: string }
  about?: { story?: string }
  contact?: { hours?: string }
  services?: Service[]
}

interface StructuredDataProps {
  business: {
    name: string
    username: string
    businessType: string
  }
  profile: {
    city: string
    phone: string
    address?: string
    content: ProfileContent
  }
}

export default function StructuredData({ business, profile }: StructuredDataProps) {
  const content: ProfileContent = profile.content

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    image: content.hero?.image?.url || `https://mivia.es/api/favicon/${business.username}`,
    '@id': `https://${business.username}.mivia.es`,
    url: `https://${business.username}.mivia.es`,
    telephone: profile.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.city,
      addressCountry: 'ES'
    },
    description: content.hero?.subtitle || content.about?.story?.substring(0, 200),
    priceRange: '€€',
    openingHoursSpecification: content.contact?.hours ? {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00'
    } : undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios',
      itemListElement: content.services?.map((service: Service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.title,
          description: service.description
        }
      })) || []
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
