import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { sendWhatsAppMessage, sendWhatsAppButtons } from '@/lib/whatsapp'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const ALLOWED_UPDATE_FIELDS = [
  'hero.subtitle',
  'hero.phone',
  'hero.badges',
  'services',
  'contact.phone',
  'contact.hours',
  'contact.ctaHeading',
  'testimonials'
]

// Reutilizamos el esquema estricto
const profileSchema = {
  type: SchemaType.OBJECT,
  properties: {
    businessType: { type: SchemaType.STRING },
    theme: { type: SchemaType.STRING },
    colors: {
      type: SchemaType.OBJECT,
      properties: {
        primary: { type: SchemaType.STRING },
        accent: { type: SchemaType.STRING },
        surface: { type: SchemaType.STRING }
      }
    },
    hero: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        city: { type: SchemaType.STRING },
        subtitle: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        badges: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      }
    },
    services: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          icon: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING }
        }
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
            }
          }
        },
        reasons: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      }
    },
    testimonials: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING },
          author: { type: SchemaType.STRING },
          role: { type: SchemaType.STRING }
        }
      }
    },
    contact: {
      type: SchemaType.OBJECT,
      properties: {
        phone: { type: SchemaType.STRING },
        whatsapp: { type: SchemaType.STRING },
        hours: { type: SchemaType.STRING },
        ctaHeading: { type: SchemaType.STRING }
      }
    },
    seo: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING }
      }
    }
  },
  required: ['businessType', 'theme', 'colors', 'hero', 'services', 'trust', 'testimonials', 'contact', 'seo']
}

// Verificación del webhook de Meta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'mivia_webhook_2026'

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Recepción de mensajes de WhatsApp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages?.[0]

    if (!messages) return NextResponse.json({ status: 'no message' })

    const from = messages.from
    const messageText = messages.text?.body

    if (!messageText) return NextResponse.json({ status: 'no text' })

    console.log(`WhatsApp from ${from}: ${messageText}`)

    // Check if it's an activation code
    if (messageText.toUpperCase().startsWith('ACTIVA ')) {
      const code = messageText.replace(/^ACTIVA\s+/i, '').trim()

      console.log(`Activation attempt with code: ${code}`)

      const businessToActivate = await prisma.business.findFirst({
        where: {
          activationCode: code,
          status: 'pending'
        }
      })

      if (!businessToActivate) {
        console.log('Invalid activation code:', code)
        return NextResponse.json({ status: 'invalid_code' })
      }

      await prisma.business.update({
        where: { id: businessToActivate.id },
        data: {
          status: 'trial',
          activationCode: null
        }
      })

      console.log(`Business ${businessToActivate.username} activated successfully`)

      // TODO: Send confirmation message back to user via WhatsApp API

      return NextResponse.json({
        status: 'activated',
        username: businessToActivate.username,
        webUrl: `https://${businessToActivate.username}.mivia.es`
      })
    }

    // Handle menu commands
    const lowerMessage = messageText.toLowerCase().trim()

    if (lowerMessage === 'hola' || lowerMessage === 'menu' || lowerMessage === 'ayuda') {
      await sendWhatsAppButtons({
        to: from,
        text: '¡Hola! 👋 Soy el asistente de tu web en mivia.es. ¿Qué quieres actualizar?',
        buttons: [
          { id: 'edit_info', title: '📝 Editar información' },
          { id: 'add_service', title: '➕ Añadir servicio' },
          { id: 'undo', title: '⏪ Deshacer cambio' }
        ]
      })

      return NextResponse.json({ status: 'menu_sent' })
    }

    // Handle button responses
    if (messageText === 'edit_info' || messageText === 'add_service' || messageText === 'undo') {
      if (messageText === 'undo') {
        const businessUndo = await prisma.business.findFirst({
          where: { phone: { endsWith: from.slice(-9) } },
          include: { profile: true }
        })

        if (!businessUndo || !businessUndo.profile) {
          await sendWhatsAppMessage({
            to: from,
            text: '❌ No encontré tu perfil. Escribe "menu" para opciones.'
          })
          return NextResponse.json({ status: 'business_not_found' })
        }

        if (!businessUndo.profile.backupContent) {
          await sendWhatsAppMessage({
            to: from,
            text: '⚠️ No hay cambios previos para deshacer.'
          })
          return NextResponse.json({ status: 'no_backup' })
        }

        await prisma.$executeRaw`UPDATE "Profile" SET content = "backupContent", "backupContent" = NULL WHERE id = ${businessUndo.profile.id}`

        const webUrl = `https://${businessUndo.username}.mivia.es`
        await sendWhatsAppMessage({
          to: from,
          text: `✅ Cambio deshecho correctamente.\n\nVer tu web: ${webUrl}\n\nEscribe "menu" para más opciones.`
        })

        return NextResponse.json({ status: 'undo_success' })
      }

      if (messageText === 'edit_info') {
        await sendWhatsAppMessage({
          to: from,
          text: 'Perfecto 👍 Dime qué quieres cambiar con tus propias palabras.\n\nEjemplos:\n• "Mi nuevo horario es L-V 9-20h"\n• "Cambia el teléfono al 600123456"\n• "Añade servicio: Reparación urgente 24h"'
        })
        return NextResponse.json({ status: 'awaiting_input' })
      }

      if (messageText === 'add_service') {
        await sendWhatsAppMessage({
          to: from,
          text: 'Dime el servicio que quieres añadir.\n\nEjemplo: "Instalación de aire acondicionado"'
        })
        return NextResponse.json({ status: 'awaiting_service' })
      }
    }

    // Handle regular update messages (not activation codes)
    // Buscar negocio por últimos 9 dígitos del teléfono
    const business = await prisma.business.findFirst({
      where: { phone: { contains: from.slice(-9) } },
      include: { profile: true }
    })

    if (!business?.profile?.content) {
      console.log('Business not found for phone:', from)
      return NextResponse.json({ status: 'business not found' })
    }

    // Backup current content before updating
    await prisma.profile.update({
      where: { id: business.profile.id },
      data: { backupContent: business.profile.content }
    })

    console.log('[Backup] Content backed up before update')

    // Actualizar con Gemini
    const updatedContent = await updateContentWithGemini(business.profile.content, messageText)

    // Validate that only allowed fields were modified
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function validateChanges(original: any, updated: any): boolean {
      const criticalFields = ['businessType', 'theme', 'colors']
      for (const field of criticalFields) {
        if (JSON.stringify(original[field]) !== JSON.stringify(updated[field])) {
          console.log(`[Validation] Critical field ${field} was modified, rejecting`)
          return false
        }
      }
      return true
    }

    const isValid = validateChanges(business.profile.content, updatedContent)
    if (!isValid) {
      console.log('[Validation] Update rejected - critical fields modified')
      await sendWhatsAppMessage({
        to: from,
        text: '❌ No puedo modificar ese campo. Solo puedo actualizar: horarios, teléfono, servicios y textos descriptivos.\n\nEscribe "menu" para ver opciones.'
      })
      return NextResponse.json({ status: 'rejected', reason: 'critical_field_modified' })
    }

    // Guardar transaccionalmente
    await prisma.$transaction([
      prisma.profile.update({
        where: { id: business.profile.id },
        data: { content: updatedContent }
      }),
      prisma.profileUpdate.create({
        data: {
          businessId: business.id,
          rawMessage: messageText,
          type: 'text',
          processed: true
        }
      })
    ])

    console.log(`Profile updated for ${business.username}`)

    // Send confirmation message
    const webUrl = `https://${business.username}.mivia.es`
    await sendWhatsAppMessage({
      to: from,
      text: `✅ Tu web se ha actualizado correctamente.\n\nVer cambios: ${webUrl}\n\nEscribe "menu" para más opciones.`
    })

    return NextResponse.json({ status: 'updated', username: business.username })

  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Schema reducido solo para el patch
const patchSchema = {
  type: SchemaType.OBJECT,
  properties: {
    field: { type: SchemaType.STRING, description: 'Campo a actualizar: contact.hours, contact.phone, hero.phone, hero.subtitle, services' },
    contact_hours: { type: SchemaType.STRING },
    contact_phone: { type: SchemaType.STRING },
    hero_phone: { type: SchemaType.STRING },
    hero_subtitle: { type: SchemaType.STRING },
    add_service: {
      type: SchemaType.OBJECT,
      properties: {
        icon: { type: SchemaType.STRING },
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING }
      }
    }
  },
  required: ['field']
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateContentWithGemini(currentContent: any, userMessage: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseSchema: patchSchema as any,
      temperature: 0.1,
      maxOutputTokens: 1024
    }
  })

  const context = {
    contact_hours: currentContent.contact?.hours,
    contact_phone: currentContent.contact?.phone,
    hero_phone: currentContent.hero?.phone,
    hero_subtitle: currentContent.hero?.subtitle,
    services_count: currentContent.services?.length
  }

  const prompt = `Eres el CMS de mivia.es. Analiza el mensaje y devuelve qué campo cambiar.

ESTADO ACTUAL: ${JSON.stringify(context)}

MENSAJE: "${userMessage}"

CAMPOS PERMITIDOS PARA MODIFICAR:
Solo puedes modificar estos campos del JSON:
- hero.subtitle (descripción principal)
- hero.phone (teléfono en el hero)
- hero.badges (badges de confianza)
- services (lista completa de servicios)
- contact.phone (teléfono de contacto)
- contact.hours (horario de atención)
- contact.ctaHeading (pregunta del CTA)
- testimonials (testimonios de clientes)

CAMPOS PROHIBIDOS (NO TOCAR):
- businessType (tipo de negocio)
- theme (tema visual)
- colors (paleta de colores)
- trust.badges (estadísticas numéricas)
- trust.reasons (razones para elegir)
- seo.title y seo.description

Si el usuario pide modificar un campo prohibido, NO hagas ningún cambio y devuelve el JSON exactamente igual.

EJEMPLOS:
- "horario L-V 9-21h" → field:"contact.hours", contact_hours:"Lunes a Viernes de 9:00 a 21:00"
- "nuevo teléfono 600999888" → field:"contact.phone", contact_phone:"600999888", hero_phone:"600999888"
- "añade servicio peeling 45€" → field:"services", add_service:{icon:"sparkles",title:"Peeling facial",description:"..."}
- "cerrado agosto" → field:"hero.subtitle", hero_subtitle:"...texto con aviso de vacaciones..."`

  const result = await model.generateContent(prompt)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch = JSON.parse(result.response.text()) as Record<string, any>

  // Aplicar patch sobre el contenido actual
  const updated = { ...currentContent }

  if (patch.contact_hours) updated.contact = { ...updated.contact, hours: patch.contact_hours }
  if (patch.contact_phone) updated.contact = { ...updated.contact, phone: patch.contact_phone }
  if (patch.hero_phone) updated.hero = { ...updated.hero, phone: patch.hero_phone }
  if (patch.hero_subtitle) updated.hero = { ...updated.hero, subtitle: patch.hero_subtitle }
  if (patch.add_service && updated.services) updated.services = [...updated.services, patch.add_service]

  console.log(`Patch applied: field=${patch.field}`)
  return updated
}
