import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mivia.es'),
  title: {
    default: 'mivia — Tu web profesional en 2 minutos. Por WhatsApp.',
    template: '%s | mivia.es'
  },
  description: 'Crea una web profesional para tu negocio en 2 minutos. Sin código, sin agencias, sin complicaciones. Actualizable por WhatsApp. Solo €9/mes.',
  keywords: [
    'web para negocio local',
    'crear web barata',
    'página web autónomo',
    'web para peluquería',
    'web para fontanero',
    'presencia online negocio',
    'web profesional sin código',
    'web actualizable whatsapp'
  ],
  authors: [{ name: 'mivia.es', url: 'https://mivia.es' }],
  creator: 'mivia.es',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://mivia.es',
    siteName: 'mivia.es',
    title: 'mivia — Tu web profesional en 2 minutos. Por WhatsApp.',
    description: 'Crea una web profesional para tu negocio en 2 minutos. Sin código, sin agencias. Actualizable por WhatsApp. Solo €9/mes.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'mivia.es — Web profesional para negocios locales'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mivia — Tu web profesional en 2 minutos',
    description: 'Sin código, sin agencias. Actualizable por WhatsApp. Solo €9/mes.',
    images: ['/og-image.png'],
    creator: '@miviaes'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  alternates: {
    canonical: 'https://mivia.es'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
