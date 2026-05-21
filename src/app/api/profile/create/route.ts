import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchUnsplashPhoto } from '@/lib/unsplash'
import { checkRateLimit, getClientIp, rateLimitHeaders, initCleanup } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function generateActivationCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
}

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    theme: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['plumber', 'electrician', 'barber', 'carpenter', 'painter', 'mechanic', 'gardener', 'builder', 'default']
    },
    businessType: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['local', 'mobile_service', 'portfolio', 'digital'],
    },
    colors: {
      type: SchemaType.OBJECT,
      properties: {
        primary: { type: SchemaType.STRING },
        accent: { type: SchemaType.STRING },
        surface: { type: SchemaType.STRING }
      },
      required: ['primary', 'accent', 'surface']
    },
    hero: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        city: { type: SchemaType.STRING },
        subtitle: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        badges: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        imageKeyword: {
          type: SchemaType.STRING,
          description: "English search term for Unsplash API. Short and specific. Examples: 'plumber fixing pipes', 'hairdresser cutting hair', 'lawyer office professional'. 2-4 words max.",
          nullable: false
        },
        image: {
          type: SchemaType.OBJECT,
          description: "Unsplash photo metadata (populated by backend)",
          nullable: true,
          properties: {
            url: { type: SchemaType.STRING },
            photographer: { type: SchemaType.STRING },
            photographerUrl: { type: SchemaType.STRING },
            photoId: { type: SchemaType.STRING }
          }
        }
      },
      required: ['title', 'city', 'subtitle', 'phone', 'badges', 'imageKeyword']
    },
    services: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          icon: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          imageKeyword: {
            type: SchemaType.STRING,
            description: "English search term for this specific service photo. Examples: 'electrical wiring installation', 'bathroom renovation', 'corporate headshots'. 2-4 words max.",
            nullable: false
          },
          image: {
            type: SchemaType.OBJECT,
            description: "Unsplash photo metadata (populated by backend)",
            nullable: true,
            properties: {
              url: { type: SchemaType.STRING },
              photographer: { type: SchemaType.STRING },
              photographerUrl: { type: SchemaType.STRING },
              photoId: { type: SchemaType.STRING }
            }
          }
        },
        required: ['icon', 'title', 'description', 'imageKeyword']
      }
    },
    trust: {
      type: SchemaType.OBJECT,
      properties: {
        badges: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              number: { type: SchemaType.STRING },
              label: { type: SchemaType.STRING }
            },
            required: ['number', 'label']
          }
        },
        reasons: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      },
      required: ['badges', 'reasons']
    },
    about: {
      type: SchemaType.OBJECT,
      description: "About us section to humanize the business",
      nullable: false,
      properties: {
        heading: {
          type: SchemaType.STRING,
          description: "Section title, e.g., 'Sobre nosotros', 'Quiénes somos', 'Nuestra historia'",
          nullable: false
        },
        story: {
          type: SchemaType.STRING,
          description: "2-3 paragraph story about the business: years of experience, values, what makes them different. 150-250 words. Warm and professional tone.",
          nullable: false
        },
        values: {
          type: SchemaType.ARRAY,
          description: "3-4 core values or principles, e.g., 'Calidad garantizada', 'Atención personalizada'",
          nullable: false,
          items: {
            type: SchemaType.STRING
          }
        }
      }
    },
    testimonials: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING },
          author: { type: SchemaType.STRING },
          rating: {
            type: SchemaType.NUMBER,
            description: "Rating from 4 to 5 stars. Vary between 4 and 5 to look authentic.",
            nullable: true
          },
          note: {
            type: SchemaType.STRING,
            description: "Illustrative disclaimer. Always set to: 'Ejemplo ilustrativo — el cliente debe sustituirlo por reseñas reales de sus clientes'",
            nullable: true
          }
        },
        required: ['text', 'author']
      }
    },
    contact: {
      type: SchemaType.OBJECT,
      properties: {
        phone: { type: SchemaType.STRING },
        whatsapp: { type: SchemaType.STRING },
        hours: { type: SchemaType.STRING },
        ctaHeading: {
          type: SchemaType.STRING,
          description: "CRÍTICO: Pregunta persuasiva usando el OFICIO genérico, NUNCA el nombre del negocio. Ejemplos: '¿Necesitas un fontanero?', '¿Buscas una peluquería?', '¿Quieres un cambio de look?'. PROHIBIDO: '¿Necesitas un Peluquería María?' o '¿Necesitas un fontanería lópez?'"
        }
      },
      required: ['phone', 'whatsapp', 'hours', 'ctaHeading']
    },
    seo: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING }
      },
      required: ['title', 'description']
    }
  },
  required: ['businessType', 'theme', 'colors', 'hero', 'services', 'trust', 'about', 'testimonials', 'contact', 'seo']
}

async function generateWebContent(data: {
  businessName: string
  city: string
  services: string
  trustReason: string
  contactPhone: string
  vibe: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.2,
      maxOutputTokens: 8192
    }
  })

  const phoneClean = data.contactPhone.replace(/\D/g, '').replace(/^0034/, '').replace(/^34/, '')
  const waLink = `https://wa.me/34${phoneClean}?text=Hola%2C%20me%20gustar%C3%ADa%20pedir%20presupuesto`

  const prompt = `Actúa como Senior Frontend Developer y UX Designer experto en conversiones para negocios locales españoles.

MISIÓN: Genera un objeto JSON estructurado con todo el contenido para la web de este negocio:
- Nombre: ${data.businessName}
- Ciudad: ${data.city}
- Servicios: ${data.services}
- Propuesta de valor: ${data.trustReason}
- Teléfono: ${data.contactPhone}
- WhatsApp: ${waLink}

═══════════════════════════════
DETECCIÓN DE ESTILO Y PALETA:
═══════════════════════════════
El usuario ha elegido el estilo: "${data.vibe}"

Asigna theme y colors basándote PRIMERO en el vibe, LUEGO ajusta según el oficio:

**Si vibe es "classic":**
- theme: basado en el oficio detectado
- colors: Tonos sobrios y oscuros
  * Fontanero/Electricista → primary: "#1e3a8a", accent: "#3b82f6", surface: "#f8fafc"
  * Peluquería/Spa → primary: "#6b21a8", accent: "#a855f7", surface: "#faf5ff"
  * Carpintero/Construcción → primary: "#713f12", accent: "#92400e", surface: "#fefce8"
  * Default → primary: "#1e40af", accent: "#3b82f6", surface: "#eff6ff"

**Si vibe es "modern":**
- theme: basado en el oficio detectado
- colors: Tonos vibrantes y saturados (los actuales están bien para modern)
  * Fontanero → primary: "#0369a1", accent: "#0ea5e9", surface: "#f0f9ff"
  * Electricista → primary: "#1e3a8a", accent: "#f59e0b", surface: "#f8fafc"
  * Peluquería → primary: "#7c3aed", accent: "#ec4899", surface: "#fdf4ff"
  * Carpintero → primary: "#92400e", accent: "#d97706", surface: "#fffbeb"
  * Pintor → primary: "#065f46", accent: "#10b981", surface: "#ecfdf5"
  * Mecánico → primary: "#1f2937", accent: "#ef4444", surface: "#f9fafb"
  * Jardinero → primary: "#14532d", accent: "#22c55e", surface: "#f0fdf4"
  * Albañil → primary: "#78350f", accent: "#f97316", surface: "#fff7ed"
  * Default → primary: "#1e40af", accent: "#3b82f6", surface: "#eff6ff"

**Si vibe es "warm":**
- theme: basado en el oficio detectado
- colors: Tonos pastel suaves y cálidos
  * Fontanero/Técnico → primary: "#0891b2", accent: "#06b6d4", surface: "#ecfeff"
  * Peluquería/Belleza → primary: "#db2777", accent: "#f472b6", surface: "#fdf2f8"
  * Servicios generales → primary: "#7c3aed", accent: "#a78bfa", surface: "#f5f3ff"
  * Default → primary: "#8b5cf6", accent: "#c4b5fd", surface: "#faf5ff"

**Si vibe es "artisan":**
- theme: basado en el oficio detectado
- colors: OBLIGATORIO usar tonos tierra, marrones, terracotas
  * Carpintero/Artesano → primary: "#78350f", accent: "#92400e", surface: "#fffbeb"
  * Fontanero/Construcción → primary: "#6b7280", accent: "#854d0e", surface: "#fef3c7"
  * Jardinero/Paisajista → primary: "#365314", accent: "#4d7c0f", surface: "#f7fee7"
  * Default → primary: "#92400e", accent: "#b45309", surface: "#fffbeb"

**CRÍTICO para el tono del copy según vibe:**
- classic: Formal, profesional, corporativo. Sin emojis.
- modern: Directo, eficiente, frases cortas. Lenguaje tech.
- warm: Cercano, acogedor, usa "tú". Lenguaje cálido.
- artisan: Auténtico, con historia, habla de tradición y calidad.

═══════════════════════════════
DETECCIÓN AUTOMÁTICA DE TIPO DE NEGOCIO:
═══════════════════════════════
Analiza los servicios ("${data.services}") y la propuesta de valor ("${data.trustReason}") para clasificar el negocio en UNO de estos tipos:

**local:** Negocio con ubicación física fija
- Indicadores: "tienda", "local", "taller", "clínica", "peluquería", "restaurante", "gimnasio"
- Ejemplo: "Peluquería en el centro de Elche" → local

**mobile_service:** Servicios que se desplazan al cliente
- Indicadores: "a domicilio", "urgencias 24h", "nos desplazamos", "fontanero", "electricista", "reparaciones"
- Ejemplo: "Fontanería urgente en toda Alicante" → mobile_service

**portfolio:** Profesional que busca proyectos/empleo
- Indicadores: "diseñador", "fotógrafo", "consultor", "freelance", "desarrollador", "arquitecto", "portfolio"
- Ejemplo: "Diseñador gráfico freelance con 5 años de experiencia" → portfolio

**digital:** Servicios/productos online sin presencia física
- Indicadores: "cursos online", "software", "tienda online", "ecommerce", "marketing digital", "SaaS"
- Ejemplo: "Vendo cursos de fotografía online" → digital

Devuelve el tipo más apropiado en el campo businessType.

═══════════════════════════════
INSTRUCCIONES DE CONTENIDO:
═══════════════════════════════

**hero:**
- title: nombre del negocio EXACTAMENTE como lo dio el usuario ("${data.businessName}")
- city: ciudad EXACTAMENTE como la dio el usuario ("${data.city}")
- subtitle: una frase persuasiva de 10-15 palabras sobre su propuesta de valor
- phone: SOLO los dígitos del teléfono sin espacios ni texto adicional. Extráelo de "${data.contactPhone}" y limpia todo lo que no sean números. Ejemplo: si el usuario escribió "600 123 456, mejor por WhatsApp" → devuelves "600123456"
- badges: array con 2 mensajes de confianza (ej: ["Presupuesto sin compromiso", "Respuesta en menos de 1h"])

**services:**
- Array de 3 objetos (uno por cada servicio que dio el usuario)
- icon: nombre del icono de lucide-react que mejor represente el servicio. Opciones válidas:
  * Fontanería: "wrench", "droplet", "pipe"
  * Electricidad: "zap", "lightbulb", "plug"
  * Peluquería: "scissors", "sparkles", "star"
  * Carpintería: "hammer", "ruler", "saw"
  * Pintura: "paintbrush", "palette", "spray-can"
  * Mecánica: "car", "settings", "wrench"
  * Jardinería: "leaf", "flower", "tree"
  * Construcción: "hard-hat", "building", "truck"
- title: nombre del servicio (máximo 5 palabras)
- description: descripción persuasiva del servicio (2-3 líneas, 20-30 palabras)

**trust.badges:**
- Array de 4 objetos con estadísticas impresionantes pero creíbles
- Ejemplos: { "number": "15+", "label": "Años de Experiencia" }, { "number": "500+", "label": "Clientes Satisfechos" }, { "number": "24/7", "label": "Disponibilidad Urgente" }, { "number": "100%", "label": "Presupuesto Cerrado" }

**trust.reasons:**
- Array de 4-5 razones cortas por las que elegir este negocio
- Extraer de "${data.trustReason}" y complementar con razones típicas del oficio

**about:**
- heading: Section title that fits the business tone
- story: Brief narrative (2-3 paragraphs) about experience, philosophy, what makes them unique. Be specific to the sector.
- values: 3-4 core principles (e.g., "Trabajo limpio", "Precios sin sorpresas", "Disponibilidad 24/7")

**testimonials:**
- Array de 3 reviews de clientes ficticios pero creíbles
- Use realistic Spanish names that vary (not all generic like "García" or "López")
- Make text SPECIFIC to the service sector: mention actual services, times, or problems solved
- Vary ratings: 2 with rating 5, 1 with rating 4
- Keep text conversational and natural (60-100 words each)
- Examples:
  * Plumber: "Vino en menos de una hora cuando se reventó la tubería. Trabajo limpio y precio justo."
  * Hair salon: "Llevo años viniendo. Siempre salen con el color perfecto y me aconsejan súper bien."

IMPORTANT - Testimonials disclaimer:
- These testimonials are ILLUSTRATIVE EXAMPLES only
- Add a note field to each testimonial: note: "Ejemplo ilustrativo — el cliente debe sustituirlo por reseñas reales de sus clientes"
- Never present them as real verified reviews

**contact:**
- phone: SOLO los dígitos del teléfono sin espacios ni texto. Mismo número que en hero.phone
- whatsapp: "${waLink}"
- hours: horario creíble para el oficio (ej: "Lunes a Viernes de 8:00 a 20:00" o "24h para urgencias")
CRÍTICO para contact.ctaHeading:
- Deduce el oficio del usuario a partir de los servicios
- Escribe una pregunta natural usando el oficio genérico
- Fontanero/Fontanería → "¿Necesitas un fontanero?" o "¿Buscas un experto en fontanería?"
- Peluquería/Barbería → "¿Buscas una peluquería?" o "¿Quieres un cambio de look?"
- Electricista → "¿Necesitas un electricista?" o "¿Tienes una avería eléctrica?"
- Carpintero → "¿Necesitas un carpintero?" o "¿Buscas muebles a medida?"
- Portfolio/Freelance → "¿Buscas un profesional cualificado?" o "¿Necesitas un diseñador?"
- NUNCA uses el nombre del negocio en esta pregunta
- Debe sonar como una pregunta que haría un amigo, no como un error gramatical
CRÍTICO: contact.phone debe ser SOLO números, sin espacios, sin texto adicional como "mejor por WhatsApp". Si el usuario escribió "600 123 456, mejor por WhatsApp", extrae solo "600123456".

**seo:**
- title: formato "NombreNegocio en Ciudad | ServicioPrincipal | Presupuesto gratis" (máximo 60 caracteres)
- description: descripción persuasiva con oficio + ciudad + diferencial (máximo 155 caracteres)

═══════════════════════════════
REGLAS ESTRICTAS:
═══════════════════════════════
- Usa EXACTAMENTE los nombres de iconos de lucide-react listados arriba
- NO inventes iconos que no existan
- El title del hero es SOLO el nombre del negocio, sin la ciudad
- La city del hero es SOLO la ciudad, sin el nombre
- Los números en badges deben incluir el símbolo (ej: "15+", "24/7", "100%")
- Los testimonios deben sonar naturales y específicos al oficio

IMPORTANT - Image Keywords:
- For hero.imageKeyword: describe the professional at work in their industry (e.g., "plumber working on pipes", "hairdresser styling hair")
- For services[].imageKeyword: describe the specific service being performed (e.g., "bathroom tile installation", "balayage hair coloring")
- ALWAYS in English, 2-4 words, professional photography style
- Avoid generic terms like "business" or "professional" alone
- Be specific to the actual work being done

OUTPUT: Responde únicamente con el JSON estructurado. No añadas texto adicional.`

  const result = await model.generateContent(prompt)
  const content = JSON.parse(result.response.text())
  return content
}

export async function POST(req: NextRequest) {
  // Rate limiting: 5 requests/hora por IP
  initCleanup()
  const ip = getClientIp(req)
  const rl = checkRateLimit(ip, 5, 60 * 60 * 1000)

  if (!rl.allowed) {
    console.warn(`[Rate Limit] IP ${ip} excedió límite en /api/profile/create`)
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  try {
    const body = await req.json()
    const { businessName, city, services, trustReason, contactPhone, username: requestedUsername, vibe = 'modern' } = body

    if (!businessName || !city || !services || !trustReason || !contactPhone) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Generar username único
    const baseUsername = (requestedUsername && requestedUsername.trim()) ? slugify(requestedUsername) : slugify(businessName)
    let username = baseUsername
    let suffix = 1
    while (await prisma.business.findUnique({ where: { username } })) {
      username = `${baseUsername}-${suffix++}`
    }

    // Generar contenido con Gemini
    const content = await generateWebContent({
      businessName, city, services, trustReason, contactPhone, vibe
    })

    // Fetch Unsplash images
    console.log('[Unsplash] Fetching hero image for:', content.hero.imageKeyword)
    const heroPhoto = await fetchUnsplashPhoto(content.hero.imageKeyword)
    if (heroPhoto) {
      content.hero.image = heroPhoto
      console.log('[Unsplash] Hero image fetched from', heroPhoto.photographer)
    } else {
      content.hero.image = null
      console.log('[Unsplash] Hero image fallback to solid color')
    }

    console.log(`[Unsplash] Fetching ${content.services.length} service images`)
    for (let i = 0; i < content.services.length; i++) {
      const service = content.services[i]
      const photo = await fetchUnsplashPhoto(service.imageKeyword)
      if (photo) {
        service.image = photo
      } else {
        service.image = null
      }
    }

    // Crear trial de 30 días
    const activationCode = generateActivationCode()
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 30)

    // Guardar en BD
    const business = await prisma.business.create({
      data: {
        username,
        phone: contactPhone,
        status: 'pending',
        activationCode,
        trialEndsAt,
        legalAcceptedAt: body.legalAcceptedAt ? new Date(body.legalAcceptedAt) : new Date(),
        profile: {
          create: {
            name: businessName,
            city,
            services: services.split(',').map((s: string) => s.trim()),
            trustReason,
            contactPhone,
            images: [],
            content,
            seoTitle: content.seo.title,
            seoDesc: content.seo.description,
            template: 'trades',
            vibe,
          }
        }
      },
      include: { profile: true }
    })

    return NextResponse.json({ success: true, username: business.username, activationCode, url: `${username}.mivia.es` })

  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
