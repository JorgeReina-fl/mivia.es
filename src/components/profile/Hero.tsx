import { HeroSection } from '@/components/profile/HeroSection'
import { formatPhoneNumber } from '@/lib/format'
import { DesignPreset } from '@/lib/design-presets'

interface HeroProps {
  data: {
    title: string
    city: string
    subtitle: string
    phone: string
    badges: string[]
    image?: {
      url: string
      photographer: string
      photographerUrl: string
      photoId: string
    } | null
  }
  colors: {
    primary: string
    accent: string
    surface: string
  }
  whatsapp: string
  designPreset: DesignPreset
}

export default function Hero({ data, colors, whatsapp }: HeroProps) {
  const cityAlreadyInTitle = data.title
    .toLowerCase()
    .includes(data.city.toLowerCase())

  const titleCity = cityAlreadyInTitle
    ? data.title.split(' ').slice(-1)[0] + '.'
    : `${data.city}.`

  return (
    <HeroSection
      titleMain={data.title}
      titleCity={titleCity}
      subtitle={data.subtitle}
      phone={formatPhoneNumber(data.phone)}
      badges={data.badges}
      colors={{ primary: colors.primary, accent: colors.accent }}
      backgroundPhoto={data.image?.url}
      photoAttribution={
        data.image
          ? `Photo by ${data.image.photographer} on Unsplash`
          : undefined
      }
      whatsappHref={whatsapp}
    />
  )
}
