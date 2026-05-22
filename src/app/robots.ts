import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/onboarding/success/'],
      },
    ],
    sitemap: 'https://mivia.es/sitemap.xml',
  }
}
