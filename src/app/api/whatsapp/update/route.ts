import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { fetchUnsplashPhoto } from '@/lib/unsplash'
import { extractCVWithGemini } from '@/lib/gemini-cv-extractor'
import { downloadWhatsAppMedia } from '@/lib/whatsapp'
import { extractTextFromPDF } from '@/lib/pdf-parser'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { normalizeE164 } from '@/lib/phone'

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
          author: { type: SchemaType.STRING }
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

/**
 * Valida la firma HMAC-SHA256 que Meta incluye en cada webhook.
 * Documentación: https://developers.facebook.com/docs/messenger-platform/webhooks#validate-payloads
 */
function validateWhatsAppSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET
  if (!secret) {
    console.error('[WhatsApp] WHATSAPP_APP_SECRET no configurado — rechazando webhook')
    return false
  }
  if (!signature) return false

  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  } catch {
    return false
  }
}

// Recepción de mensajes de WhatsApp
export async function POST(req: NextRequest) {
  // Validación de firma HMAC ANTES del try principal
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256')

  if (!validateWhatsAppSignature(rawBody, signature)) {
    console.error('[WhatsApp] Firma inválida — request rechazado')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = JSON.parse(rawBody)

    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages?.[0]

    if (!messages) return NextResponse.json({ status: 'no message' })

    const from = messages.from
    // Normalizar teléfono entrante a E.164 para búsquedas exactas
    const normalizedFrom = normalizeE164(from) || from

    // Extract message or button reply
    let messageText = ''
    const message = entry.changes?.[0]?.value?.messages?.[0]

    if (message?.type === 'text') {
      messageText = message.text?.body || ''
    } else if (message?.type === 'interactive') {
      // Button click
      messageText = message.interactive?.button_reply?.id || ''
    } else if (message?.type === 'button') {
      // Legacy button format
      messageText = message.button?.payload || ''
    }

    console.log('[WhatsApp] Message type:', message?.type, 'Content:', messageText)

    if (message?.type === 'document') {
      console.log(`WhatsApp from ${from}: Document received (mime: ${message.document?.mime_type})`)
    } else if (!messageText) {
      return NextResponse.json({ status: 'no text' })
    }

    if (messageText) {
      console.log(`WhatsApp from ${from}: ${messageText}`)
      console.log('[DEBUG] Mensaje recibido:', messageText)
      console.log('[DEBUG] Mensaje lowercase:', messageText.toLowerCase())
      console.log('[DEBUG] Es menu?', messageText.toLowerCase() === 'menu')
      console.log('[DEBUG] Es hola?', messageText.toLowerCase() === 'hola')
    }

    // Check if it's an activation code
    if (messageText && messageText.toUpperCase().startsWith('ACTIVA ')) {
      const code = messageText.replace(/^ACTIVA\s+/i, '').trim()

      console.log(`Activation attempt with code: ${code}`)

      const businessToActivate = await prisma.business.findFirst({
        where: {
          activationCode: code,
          status: 'pending',
          isDeleted: false
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

      await sendWhatsAppMessage({
        to: from,
        text: `✅ ¡Perfecto! Tu web ya está activada.\n\n🌐 Accede aquí: https://${businessToActivate.username}.mivia.es\n\nPara actualizar cualquier dato de tu web, simplemente escríbeme. Por ejemplo:\n\n• "Cambia el teléfono a 622 111 222"\n• "Añade un servicio: Reparación de calderas"\n• "Actualiza la descripción: Fontanero profesional con 20 años de experiencia"\n\n¿Necesitas ayuda? Envía "ayuda" en cualquier momento.`
      })

      return NextResponse.json({
        status: 'activated',
        username: businessToActivate.username,
        webUrl: `https://${businessToActivate.username}.mivia.es`
      })
    }

    // Handle menu commands
    const lowerMessage = messageText ? messageText.toLowerCase().trim() : ''

    // Buscar negocio por teléfono normalizado E.164 (búsqueda exacta)
    const business = await prisma.business.findFirst({
      where: { phone: normalizedFrom, isDeleted: false },
      include: { profile: true, portfolio: true }
    })

    // ── GESTIÓN DE CUENTAS PENDIENTES (WEB) ───────────────────────────────────
    if (business && business.status === 'pending') {
      const msg = messageText ? messageText.trim().toUpperCase() : ''
      
      if (msg === 'CANCELAR REGISTRO') {
        await prisma.business.update({
          where: { id: business.id },
          data: {
            isDeleted: true,
            phone: `${business.phone}-deleted-${Date.now()}`,
            status: 'cancelled'
          }
        })
        await prisma.onboardingSession.deleteMany({ where: { phone: from } })
        
        await sendWhatsAppMessage({
          to: from,
          text: '✅ Registro web cancelado.\n\nEscribe "hola" si quieres iniciar el proceso de creación por WhatsApp.'
        })
        return NextResponse.json({ success: true })
      }

      const session = await prisma.onboardingSession.findUnique({ where: { phone: from } })
      let text = '⚠️ Tienes una página web pendiente de activación.\n\nPara activarla, envía el comando *ACTIVA* seguido de tu código de 4 dígitos (ej: ACTIVA 1234).'
      
      if (session) {
        text += '\n\nSi prefieres ignorar la web que creaste y continuar tu registro directamente por WhatsApp, escribe *CANCELAR REGISTRO*.'
      } else {
        text += '\n\nSi no fuiste tú quien creó esta web o quieres empezar de nuevo, escribe *CANCELAR REGISTRO*.'
      }

      await sendWhatsAppMessage({ to: from, text })
      return NextResponse.json({ success: true })
    }

    // ── USUARIO NUEVO ──────────────────────────────────────────────────────────
    if (!business) {
      const session = await prisma.onboardingSession.findUnique({ where: { phone: from } })
      const msg = messageText.trim()

      // Primer contacto — crear sesión y preguntar tipo
      if (!session) {
        await prisma.onboardingSession.create({ data: { phone: from, step: 'type', data: {} } })
        await sendWhatsAppMessage({
          to: from,
          text: '¡Hola! 👋 Bienvenido a *mivia*.\n\n¿Qué quieres crear?\n\n1️⃣ *Página para mi negocio*\n(restaurantes, fontaneros, peluquerías...)\n\n2️⃣ *Portfolio profesional*\n(diseñadores, devs, fotógrafos...)'
        })
        return NextResponse.json({ status: 'onboarding_start' })
      }

      // STEP: type
      if (session.step === 'type') {
        if (msg === '1' || lowerMessage.includes('negocio') || lowerMessage.includes('local')) {
          await prisma.onboardingSession.update({
            where: { phone: from },
            data: { step: 'loc:name', data: { type: 'LOCAL_BUSINESS' } }
          })
          await sendWhatsAppMessage({ to: from, text: '¡Perfecto! 🏪\n\n¿Cómo se llama tu negocio?' })
        } else if (msg === '2' || lowerMessage.includes('portfolio') || lowerMessage.includes('portafolio')) {
          await prisma.onboardingSession.update({
            where: { phone: from },
            data: { step: 'port:name', data: { type: 'PORTFOLIO' } }
          })
          await sendWhatsAppMessage({ to: from, text: '¡Perfecto! ✨\n\n¿Cuál es tu nombre completo?' })
        } else {
          await sendWhatsAppMessage({ to: from, text: 'Responde *1* para negocio o *2* para portfolio 😊' })
        }
        return NextResponse.json({ status: 'onboarding_type' })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (session.data ?? {}) as Record<string, string>

      // ── RAMA NEGOCIO LOCAL ──────────────────────────────────────────────────
      if (session.step === 'loc:name') {
        await prisma.onboardingSession.update({
          where: { phone: from },
          data: { step: 'loc:city', data: { ...data, name: msg } }
        })
        await sendWhatsAppMessage({ to: from, text: `¡Genial, *${msg}*! 📍\n\n¿En qué ciudad estás?` })
        return NextResponse.json({ status: 'onboarding_loc_name' })
      }

      if (session.step === 'loc:city') {
        const businessName = data.name
        const city = msg
        const username = `negocio-${Date.now().toString().slice(-6)}`

        await prisma.business.create({
          data: {
            username,
            phone: normalizedFrom,
            type: 'LOCAL_BUSINESS',
            status: 'trial',
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            profile: {
              create: {
                name: businessName,
                city,
                services: [],
                trustReason: 'Garantía y calidad',
                contactPhone: normalizedFrom,
                content: {
                  businessType: 'local business',
                  theme: 'trades',
                  colors: { primary: '#000000', accent: '#cccccc', surface: '#ffffff' },
                  hero: { title: businessName, city, subtitle: `Tu negocio en ${city}`, phone: normalizedFrom, badges: [] },
                  services: [],
                  trust: { badges: [], reasons: [] },
                  testimonials: [],
                  contact: { phone: normalizedFrom, whatsapp: normalizedFrom, hours: 'L-V 9:00 - 18:00', ctaHeading: '¿Hablamos?' },
                  seo: { title: businessName, description: '' }
                }
              }
            }
          }
        })
        await prisma.onboardingSession.delete({ where: { phone: from } })
        await sendWhatsAppMessage({
          to: from,
          text: `✅ ¡Tu página está lista!\n\n🌐 *${username}.mivia.es*\n\nPuedes personalizarla diciéndome:\n- "añade servicio: Reparación de tuberías"\n- "mi horario es lunes a viernes 9-18h"\n- "cambia el nombre a ${businessName}"`
        })
        return NextResponse.json({ status: 'onboarding_complete_local' })
      }

      // ── RAMA PORTFOLIO ──────────────────────────────────────────────────────
      if (session.step === 'port:name') {
        await prisma.onboardingSession.update({
          where: { phone: from },
          data: { step: 'port:profession', data: { ...data, name: msg } }
        })
        await sendWhatsAppMessage({
          to: from,
          text: `¡Encantado, *${msg}*! 💼\n\n¿A qué te dedicas?\n(ej: Diseñador UX, Desarrollador Full Stack, Fotógrafa)`
        })
        return NextResponse.json({ status: 'onboarding_port_name' })
      }

      if (session.step === 'port:profession') {
        await prisma.onboardingSession.update({
          where: { phone: from },
          data: { step: 'port:template', data: { ...data, profession: msg } }
        })
        await sendWhatsAppMessage({
          to: from,
          text: '¿Qué estilo prefieres para tu portfolio?\n\n1️⃣ *Minimal* — Tipografía elegante, fondo blanco\n2️⃣ *Creative* — Bold, impacto visual, fondo oscuro\n3️⃣ *Modern* — Limpio y profesional'
        })
        return NextResponse.json({ status: 'onboarding_port_profession' })
      }

      if (session.step === 'port:template') {
        let template = 'modern'
        if (msg === '1' || lowerMessage.includes('minimal')) template = 'minimal'
        else if (msg === '2' || lowerMessage.includes('creative') || lowerMessage.includes('creativ')) template = 'creative'

        const fullName = data.name
        const profession = data.profession
        const username =
          fullName
            .toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '') +
          '-' + Date.now().toString().slice(-4)

        await prisma.business.create({
          data: {
            username,
            phone: normalizedFrom,
            type: 'PORTFOLIO',
            status: 'trial',
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            portfolio: {
              create: {
                name: fullName,
                profession,
                bio: '',
                skills: [],
                template,
                content: {
                  headline: `${profession} · ${fullName}`,
                  summary: '',
                  projects: [],
                  experience: [],
                  education: [],
                }
              }
            }
          }
        })
        await prisma.onboardingSession.delete({ where: { phone: from } })

        const templateNames: Record<string, string> = {
          minimal: 'Minimal ✦',
          creative: 'Creative ◆',
          modern: 'Modern ●'
        }
        await sendWhatsAppMessage({
          to: from,
          text: `✅ ¡Tu portfolio está listo con el estilo *${templateNames[template]}*!\n\n🌐 *${username}.mivia.es*\n\nPuedes completarlo diciéndome:\n- "sube mi CV" (te pido el PDF)\n- "añade proyecto: Nombre, descripción"\n- "añade skills: React, Figma"`
        })
        return NextResponse.json({ status: 'onboarding_complete_portfolio' })
      }

      // Fallback — sesión en estado inesperado
      await prisma.onboardingSession.delete({ where: { phone: from } })
      return NextResponse.json({ status: 'onboarding_reset' })
    }
    // ── FIN USUARIO NUEVO ───────────────────────────────────────────────────

    if (lowerMessage === 'hola' || lowerMessage === 'menu' || lowerMessage === 'ayuda') {
      console.log('[DEBUG] ✅ ENTRANDO en handler MENU')
      await sendWhatsAppMessage({
        to: from,
        text: `¡Hola! 👋\n\n¿Qué necesitas?`,
        buttons: [
          { id: 'edit_web', title: '📝 Editar mi web' },
          { id: 'view_help', title: '📚 Ver ayuda' },
          { id: 'view_web', title: '👁️ Ver mi web' }
        ]
      })
      return NextResponse.json({ status: 'menu_sent' })
    }

    if (messageText === 'edit_web' || lowerMessage === 'editar' || lowerMessage === 'editar web') {
      console.log('[DEBUG] ✅ ENTRANDO en handler EDIT_WEB')
      await sendWhatsAppMessage({
        to: from,
        text: `Puedes decirme cosas como:\n\n• "Cambia el teléfono a 666 123 456"\n• "Añade servicio: Tartas personalizadas"\n• "Quita el servicio de bollería"\n• "Cambia la foto principal"\n• "Actualiza los horarios"\n\nO escribe "ejemplos" para ver más opciones.\n\nSolo escríbeme con naturalidad lo que necesites 😊`
      })
      return NextResponse.json({ status: 'awaiting_input' })
    }

    if (messageText === 'view_help') {
      console.log('[DEBUG] ✅ ENTRANDO en handler VIEW_HELP')
      await sendWhatsAppMessage({
        to: from,
        text: `Puedo ayudarte con:\n\n🎨 CONTENIDO PRINCIPAL\n• Cambiar subtítulo\n• Cambiar sellos de confianza\n• Cambiar foto principal\n\n🛠️ SERVICIOS\n• Añadir servicio nuevo\n• Eliminar servicio\n• Cambiar foto de servicio\n\n⭐ RESEÑAS\n• Añadir reseña real\n• Editar reseña existente\n\n📞 CONTACTO\n• Cambiar teléfono\n• Cambiar horarios\n• Cambiar título de contacto\n\nℹ️ SOBRE NOSOTROS\n• Cambiar historia del negocio\n• Actualizar valores\n\n🏢 DATOS BÁSICOS\n• Cambiar nombre del negocio\n• Cambiar ciudad\n\nEscribe "ejemplos" para ver casos de uso concretos.`
      })
      return NextResponse.json({ success: true })
    }

    if (lowerMessage === 'ejemplos') {
      console.log('[DEBUG] ✅ ENTRANDO en handler EJEMPLOS')
      await sendWhatsAppMessage({
        to: from,
        text: `📝 Ejemplos de lo que puedes decirme:\n\n"Cambia el teléfono a 666 123 456"\n"Añade servicio: Reformas integrales"\n"Quita el servicio de fontanería"\n"Cambia los sellos por: Sin comisiones, 24h"\n"Añade reseña de María: Muy buen trabajo"\n"Cambia la ciudad a Alicante"\n"Actualiza el horario a: L-V 9-14h y 16-20h"\n\nSolo escríbeme con naturalidad lo que necesites 😊`
      })
      return NextResponse.json({ success: true })
    }

    if (messageText === 'view_web') {
      console.log('[DEBUG] ✅ ENTRANDO en handler VIEW_WEB')
      const baseUrl = business.type === 'PORTFOLIO' ? `https://${business.username}.mivia.es/p/${business.username}` : `https://${business.username}.mivia.es`
      await sendWhatsAppMessage({
        to: from,
        text: `Tu web: ${baseUrl}`
      })
      return NextResponse.json({ status: 'web_sent' })
    }

    if (lowerMessage === 'estadisticas' || lowerMessage === 'estadísticas') {
      console.log('[DEBUG] ✅ ENTRANDO en handler ESTADISTICAS')
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const visits = await prisma.pageView.count({
        where: { businessId: business.id, createdAt: { gte: oneWeekAgo } }
      })
      await sendWhatsAppMessage({
        to: from,
        text: `📊 Estadísticas de esta semana:\n\n${visits} visitas a tu web\n\n¡Sigue así! 🎉`
      })
      return NextResponse.json({ success: true })
    }

    if (messageText === 'view_stats') {
      console.log('[DEBUG] ✅ ENTRANDO en handler VIEW_STATS')
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const visits = await prisma.pageView.count({
        where: { businessId: business.id, createdAt: { gte: oneWeekAgo } }
      })
      await sendWhatsAppMessage({
        to: from,
        text: `📊 Estadísticas de esta semana:\n\n${visits} visitas a tu web\n\n¡Sigue así! 🎉`
      })
      return NextResponse.json({ status: 'stats_sent' })
    }

    // Deshacer último cambio
    if (lowerMessage === 'deshacer' || lowerMessage === 'revertir' || messageText === 'undo') {
      console.log('[DEBUG] ✅ ENTRANDO en handler DESHACER')

      if (business.type === 'PORTFOLIO') {
        await sendWhatsAppMessage({
          to: from,
          text: '⚠️ Deshacer cambios aún no está disponible para Portfolios.'
        })
        return NextResponse.json({ status: 'not_supported' })
      }

      if (!business.profile?.backupContent) {
        await sendWhatsAppMessage({
          to: from,
          text: '⚠️ No hay cambios previos para deshacer.'
        })
        return NextResponse.json({ status: 'no_backup' })
      }

      await prisma.$executeRaw`UPDATE "Profile" SET content = "backupContent", "backupContent" = NULL WHERE id = ${business.profile.id}`

      const webUrl = `https://${business.username}.mivia.es`
      await sendWhatsAppMessage({
        to: from,
        text: `✅ Cambio deshecho correctamente.\n\nVer tu web: ${webUrl}\n\nEscribe "menu" para más opciones.`
      })
      return NextResponse.json({ status: 'undo_success' })
    }

    if (business.type === 'PORTFOLIO') {
      if (!business.portfolio) {
        console.log('Portfolio not found for phone:', from)
        return NextResponse.json({ status: 'portfolio not found' })
      }

      // Handle PDF Document upload for Portfolio
      if (message?.type === 'document') {
        const doc = message.document
        if (doc.mime_type !== 'application/pdf') {
          await sendWhatsAppMessage({
            to: from,
            text: '⚠️ Solo puedo procesar archivos PDF. Por favor, envía tu CV en formato PDF.'
          })
          return NextResponse.json({ status: 'invalid document type' })
        }

        await sendWhatsAppMessage({
          to: from,
          text: '⏳ Recibido. Analizando tu CV... Esto puede tardar unos segundos.'
        })

        let tmpPath: string | null = null
        try {
          const buffer = await downloadWhatsAppMedia(doc.id)
          tmpPath = join('/tmp', `cv-${business.id}-${Date.now()}.pdf`)
          await writeFile(tmpPath, buffer)

          const cvText = await extractTextFromPDF(tmpPath)
          if (!cvText || cvText.trim().length < 50) {
            await sendWhatsAppMessage({
              to: from,
              text: '❌ No he podido extraer el texto del PDF. Asegúrate de que no es una imagen escaneada.'
            })
            return NextResponse.json({ status: 'unreadable pdf' })
          }

          const extractedData = await extractCVWithGemini(cvText)
          
          const content = {
            headline: extractedData.title,
            summary: extractedData.bio,
            experience: extractedData.experience,
            education: extractedData.education,
            projects: business.portfolio.content ? ((business.portfolio.content as Record<string, unknown>).projects as unknown[] | undefined) || [] : []
          }

          const contentJson = JSON.parse(JSON.stringify(content))

          await prisma.portfolio.update({
            where: { id: business.portfolio.id },
            data: {
              name: extractedData.fullName,
              profession: extractedData.title,
              bio: extractedData.bio,
              skills: extractedData.skills,
              content: contentJson
            }
          })

          await prisma.profileUpdate.create({
            data: {
              businessId: business.id,
              rawMessage: 'Documento PDF recibido (CV)',
              type: 'document',
              processed: true
            }
          })

          const baseUrl = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'mivia.es'
          await sendWhatsAppMessage({
            to: from,
            text: `✅ CV analizado con éxito. He generado tu portfolio.\n\nPuedes verlo aquí: https://${business.username}.${baseUrl}/p/${business.username}`
          })
          
          return NextResponse.json({ status: 'portfolio_cv_processed' })

        } catch (error) {
          console.error('[WhatsApp] Error processing CV:', error)
          await sendWhatsAppMessage({
            to: from,
            text: '❌ Hubo un error al procesar tu CV. Inténtalo de nuevo más tarde.'
          })
          return NextResponse.json({ error: 'Internal error processing CV' }, { status: 500 })
        } finally {
          if (tmpPath) {
            await unlink(tmpPath).catch(() => null)
          }
        }
      }

      if (!messageText) {
        return NextResponse.json({ status: 'no text' })
      }

      const { updatedPortfolio, responseMessage, handled } = await applyPortfolioPatchWithGemini(business.portfolio, messageText)

      if (updatedPortfolio && handled) {
        await prisma.$transaction([
          prisma.portfolio.update({
            where: { id: business.portfolio.id },
            data: {
              skills:  updatedPortfolio.skills,
              content: updatedPortfolio.content,
              ...(updatedPortfolio.template ? { template: updatedPortfolio.template } : {}),
              updatedAt: new Date(),
            }
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
        
        const webUrl = `https://${business.username}.mivia.es/p/${business.username}`
        await sendWhatsAppMessage({
          to: from,
          text: `${responseMessage}\n\nVer cambios: ${webUrl}\n\nEscribe "menu" para más opciones.`
        })
      } else {
        await sendWhatsAppMessage({
          to: from,
          text: responseMessage
        })
      }

      return NextResponse.json({ status: 'updated', username: business.username })
    }

    // A partir de aqui es LOCAL_BUSINESS
    if (!business.profile?.content) {
      console.log('Profile content not found for phone:', from)
      return NextResponse.json({ status: 'profile not found' })
    }

    // Backup current content before updating
    await prisma.profile.update({
      where: { id: business.profile.id },
      data: { backupContent: business.profile.content }
    })

    console.log('[Backup] Content backed up before update')

    // Actualizar con Gemini
    const updatedContent = await updateContentWithGemini(business.profile.content, messageText, business)

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
      text: `✅ Tu web se ha actualizado correctamente.\n\nVer cambios: ${webUrl}\n\nEscribe "deshacer" o "revertir" para eliminar este cambio.\nEscribe "menu" para más opciones.`
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
      nullable: true,
      properties: {
        icon: { type: SchemaType.STRING },
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING }
      }
    },
    change_service_photo: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        serviceTitle: {
          type: SchemaType.STRING,
          description: 'Title of the service to update the photo for',
          nullable: false
        },
        imageKeyword: {
          type: SchemaType.STRING,
          description: "English keyword for Unsplash search (2-4 words). E.g: 'small group class', 'yoga studio session'",
          nullable: false
        }
      }
    },
    update_testimonial: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: "Add or update a real customer testimonial",
      properties: {
        index: {
          type: SchemaType.NUMBER,
          description: "Position to update (0, 1, 2). Use 0 for first, 1 for second, 2 for third. If user doesn't specify, use 0.",
          nullable: false
        },
        author: {
          type: SchemaType.STRING,
          description: "Real customer name, e.g. 'María García'",
          nullable: false
        },
        text: {
          type: SchemaType.STRING,
          description: "Real testimonial text from the customer. Keep it natural and authentic.",
          nullable: false
        },
        rating: {
          type: SchemaType.NUMBER,
          description: "Star rating from 1 to 5. Default 5 if not specified.",
          nullable: true
        }
      }
    },
    delete_service: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: "Remove a service from the website",
      properties: {
        serviceTitle: {
          type: SchemaType.STRING,
          description: "Title or partial name of the service to delete. E.g: 'reformas', 'urgencias'",
          nullable: false
        }
      }
    },
    change_hero_photo: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: "Change the hero background photo",
      properties: {
        imageKeyword: {
          type: SchemaType.STRING,
          description: "English keyword for Unsplash search (2-4 words). Generate based on business type and what user describes. E.g: 'plumber working pipes', 'hair salon styling', 'bakery fresh bread'",
          nullable: false
        }
      }
    },
    update_badges: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: "Update hero trust badges",
      properties: {
        badges: {
          type: SchemaType.ARRAY,
          description: "Array of 2-3 short trust badges. E.g: ['Presupuesto sin compromiso', '15 años de experiencia', 'Disponible 24h']",
          nullable: false,
          items: { type: SchemaType.STRING }
        }
      }
    },
    update_cta_heading: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: "Update the contact section CTA heading",
      properties: {
        ctaHeading: {
          type: SchemaType.STRING,
          description: "Short CTA question. E.g: '¿Buscas un fontanero en Elche?', '¿Necesitas un corte de pelo?'",
          nullable: false
        }
      }
    },
    update_business_name: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: "Update the business name",
      properties: {
        name: {
          type: SchemaType.STRING,
          description: "New business name",
          nullable: false
        }
      }
    },
    update_city: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: "Update the business city",
      properties: {
        city: {
          type: SchemaType.STRING,
          description: "New city name",
          nullable: false
        }
      }
    },
    edit_testimonial: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: "Add or update a real customer testimonial",
      properties: {
        index: {
          type: SchemaType.NUMBER,
          description: "Position (0, 1, 2). Default 0 if not specified.",
          nullable: false
        },
        author: {
          type: SchemaType.STRING,
          description: "Customer name",
          nullable: false
        },
        text: {
          type: SchemaType.STRING,
          description: "Testimonial text",
          nullable: false
        },
        rating: {
          type: SchemaType.NUMBER,
          description: "1-5 stars. Default 5.",
          nullable: true
        }
      }
    },
    remove_service: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: "Remove a service by title",
      properties: {
        serviceTitle: {
          type: SchemaType.STRING,
          description: "Service name to remove",
          nullable: false
        }
      }
    },
    update_about: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: "Update the about section with story and values",
      properties: {
        heading: {
          type: SchemaType.STRING,
          description: "Section heading. E.g: 'Sobre nosotros', 'Nuestra historia'",
          nullable: true
        },
        story: {
          type: SchemaType.STRING,
          description: "Business story/description",
          nullable: true
        },
        values: {
          type: SchemaType.ARRAY,
          description: "Array of 3-4 core values. E.g: ['Calidad', 'Puntualidad', 'Confianza']",
          nullable: true,
          items: { type: SchemaType.STRING }
        }
      }
    }
  },
  required: ['field']
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateContentWithGemini(currentContent: any, userMessage: string, business: { id: string }) {
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
    services_count: currentContent.services?.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    services_titles: currentContent.services?.map((s: any) => s.title) ?? []
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
- "cerrado agosto" → field:"hero.subtitle", hero_subtitle:"...texto con aviso de vacaciones..."
- "cambia la foto de Peeling facial" → field:"change_service_photo", change_service_photo:{serviceTitle:"Peeling facial",imageKeyword:"facial peeling treatment"}
- "pon otra foto al servicio de corte de pelo" → field:"change_service_photo", change_service_photo:{serviceTitle:"Corte de pelo",imageKeyword:"professional hair cutting salon"}

change_service_photo: Úsalo cuando el usuario quiera cambiar/actualizar/renovar la foto de un servicio específico. Extrae el nombre del servicio de la lista services_titles y genera una keyword en inglés para Unsplash.
update_testimonial: Úsalo cuando el usuario quiera añadir o actualizar una reseña/testimonio real de un cliente. Extrae el nombre del cliente, el texto de la reseña y el rating si se menciona. Si el usuario dice "añade reseña de Pedro: excelente servicio", extrae author:"Pedro", text:"excelente servicio", index:0. Si especifica "segunda reseña" o "testimonio 2", usa index:1.
delete_service: Úsalo cuando el usuario quiera eliminar/quitar/borrar un servicio. Extrae el nombre del servicio. Ej: "Quita el servicio de reformas" → serviceTitle:"reformas".
change_hero_photo: Úsalo cuando el usuario quiera cambiar la foto principal/hero de fondo. Genera una keyword en inglés basada en lo que describe o el tipo de negocio. Ej: "Cambia la foto principal" → usa el businessType para generar la keyword. "Pon una foto de una peluquería moderna" → imageKeyword:"modern hair salon interior".
update_badges: Úsalo cuando el usuario quiera cambiar los sellos/badges de confianza del hero. Ej: "Cambia los sellos por: Sin comisiones, 24h disponible" → badges:["Sin comisiones","24h disponible"].
update_cta_heading: Úsalo cuando el usuario quiera cambiar el título/pregunta de la sección de contacto. Ej: "Cambia el título de contacto a: ¿Necesitas un electricista urgente?" → ctaHeading:"¿Necesitas un electricista urgente?".
update_business_name: Úsalo cuando el usuario quiera corregir o cambiar el nombre del negocio. Ej: "Cambia el nombre a Fontanería López e Hijos" → name:"Fontanería López e Hijos".
update_city: Úsalo cuando el usuario quiera cambiar la ciudad. Ej: "Cambia la ciudad a Alicante" → city:"Alicante".`

  const result = await model.generateContent(prompt)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch = JSON.parse(result.response.text()) as Record<string, any>

  // Aplicar patch sobre el contenido actual
  const updated = { ...currentContent }

  if (patch.contact_hours) updated.contact = { ...updated.contact, hours: patch.contact_hours }
  if (patch.contact_phone) updated.contact = { ...updated.contact, phone: patch.contact_phone }
  if (patch.hero_phone) updated.hero = { ...updated.hero, phone: patch.hero_phone }
  if (patch.hero_subtitle) updated.hero = { ...updated.hero, subtitle: patch.hero_subtitle }
  if (patch.add_service && updated.services) {
    const service = patch.add_service
    if (!service.description || service.description.trim() === '') {
      service.description = await generateServiceDescription(
        service.title,
        currentContent.businessType || '',
        currentContent.hero?.title || ''
      )
    }
    const imageKeywordPrompt = `Generate a short English keyword phrase (2-4 words) for finding a professional photo on Unsplash for this service:

Service: ${service.title}
Description: ${service.description}
Business type: ${currentContent.businessType || 'local business'}

Examples: "birthday cake decorated", "custom pastry design", "artisan cookies"

Respond ONLY with the keyword phrase, nothing else.`
    const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const keywordResult = await textModel.generateContent(imageKeywordPrompt)
    const imageKeyword = keywordResult.response.text().trim()
    const photo = await fetchUnsplashPhoto(imageKeyword)
    service.image = photo ?? null
    updated.services = [...updated.services, service]
  }

  if (patch.change_service_photo) {
    const { serviceTitle, imageKeyword } = patch.change_service_photo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services: any[] = updated.services || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceIndex = services.findIndex((s: any) =>
      s.title.toLowerCase().includes(serviceTitle.toLowerCase()) ||
      serviceTitle.toLowerCase().includes(s.title.toLowerCase())
    )

    if (serviceIndex !== -1) {
      const photo = await fetchUnsplashPhoto(imageKeyword)
      if (photo) {
        services[serviceIndex] = { ...services[serviceIndex], image: photo }
        updated.services = [...services]
        console.log(`[change_service_photo] Photo updated for "${services[serviceIndex].title}"`)
      } else {
        console.log(`[change_service_photo] No photo found for keyword: ${imageKeyword}`)
      }
    } else {
      console.log(`[change_service_photo] Service not found: ${serviceTitle}`)
    }
  }

  if (patch.update_testimonial) {
    const { index, author, text, rating } = patch.update_testimonial
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testimonials: any[] = [...(updated.testimonials || [])]
    const safeIndex = Math.min(Math.max(index || 0, 0), 2)

    const updatedTestimonial = {
      author,
      text,
      rating: rating || 5,
      isReal: true
    }

    if (testimonials[safeIndex]) {
      testimonials[safeIndex] = updatedTestimonial
      console.log(`[update_testimonial] Testimonial updated at index ${safeIndex} for "${author}"`)
    } else {
      testimonials.push(updatedTestimonial)
      console.log(`[update_testimonial] New testimonial added for "${author}"`)
    }

    updated.testimonials = testimonials
  }

  if (patch.delete_service) {
    const { serviceTitle } = patch.delete_service
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services: any[] = [...(updated.services || [])]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceIndex = services.findIndex((s: any) =>
      s.title.toLowerCase().includes(serviceTitle.toLowerCase()) ||
      serviceTitle.toLowerCase().includes(s.title.toLowerCase())
    )
    if (serviceIndex !== -1) {
      const deletedName = services[serviceIndex].title
      services.splice(serviceIndex, 1)
      updated.services = services
      console.log(`[delete_service] Service "${deletedName}" deleted`)
    } else {
      console.log(`[delete_service] Service not found: ${serviceTitle}`)
    }
  }

  if (patch.change_hero_photo) {
    const { imageKeyword } = patch.change_hero_photo
    const photo = await fetchUnsplashPhoto(imageKeyword)
    if (photo) {
      updated.hero = { ...updated.hero, image: photo }
      console.log(`[change_hero_photo] Hero photo updated with keyword: ${imageKeyword}`)
    } else {
      console.log(`[change_hero_photo] No photo found for keyword: ${imageKeyword}`)
    }
  }

  if (patch.update_badges) {
    updated.hero = { ...updated.hero, badges: patch.update_badges.badges }
    console.log(`[update_badges] Badges updated`)
  }

  if (patch.update_cta_heading) {
    updated.contact = { ...updated.contact, ctaHeading: patch.update_cta_heading.ctaHeading }
    console.log(`[update_cta_heading] CTA heading updated: "${patch.update_cta_heading.ctaHeading}"`)
  }

  if (patch.update_business_name) {
    const newName = patch.update_business_name.name
    updated.hero = { ...updated.hero, title: newName }
    await prisma.profile.update({
      where: { businessId: business.id },
      data: { name: newName }
    })
    console.log(`[update_business_name] Business name updated to "${newName}"`)
  }

  if (patch.update_city) {
    const newCity = patch.update_city.city
    updated.hero = { ...updated.hero, city: newCity }
    await prisma.profile.update({
      where: { businessId: business.id },
      data: { city: newCity }
    })
    console.log(`[update_city] City updated to "${newCity}"`)
  }

  if (patch.edit_testimonial) {
    const { index, author, text, rating } = patch.edit_testimonial
    const testimonials = updated.testimonials || []

    testimonials[index] = {
      author,
      text,
      rating: rating || 5
    }

    updated.testimonials = testimonials
    console.log(`[edit_testimonial] Testimonial updated at index ${index}: ${author}`)
  }

  if (patch.remove_service) {
    const { serviceTitle } = patch.remove_service
    const services = updated.services || []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newServices = services.filter((s: any) =>
      !s.title.toLowerCase().includes(serviceTitle.toLowerCase())
    )

    if (newServices.length < services.length) {
      updated.services = newServices
      console.log(`[remove_service] Service removed: "${serviceTitle}"`)
    } else {
      console.log(`[remove_service] Service not found: "${serviceTitle}"`)
    }
  }

  if (patch.update_about) {
    const { heading, story, values } = patch.update_about

    updated.about = {
      ...updated.about,
      ...(heading && { heading }),
      ...(story && { story }),
      ...(values && { values })
    }

    console.log(`[update_about] About section updated`)
  }

  console.log(`Patch applied: field=${patch.field}`)
  return updated
}

async function generateServiceDescription(
  serviceTitle: string,
  businessType: string,
  businessName: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: 'Eres un copywriter profesional especializado en servicios de negocios locales.'
  })

  const prompt = `Genera UNA descripción breve (25-35 palabras, máximo 2 frases cortas) para este servicio:

Servicio: ${serviceTitle}
Tipo de negocio: ${businessType}
Nombre del negocio: ${businessName}

Requisitos:
- Tono profesional y cercano
- Enfócate en los beneficios para el cliente
- No uses bullets ni listas
- Solo texto corrido en párrafo
- No menciones precios
- Máximo 2 frases
- Enfócate en 1 beneficio clave
- Sé directo y conciso
- Ejemplo de longitud ideal: "Disfruta de nuestras deliciosas galletas rellenas con los sabores más irresistibles. Perfectas para un capricho dulce o para regalar."

Responde SOLO con la descripción, sin preamble.`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

// Schema para el patch de PORTFOLIO
const portfolioPatchSchema = {
  type: SchemaType.OBJECT,
  properties: {
    action: {
      type: SchemaType.STRING,
      description: 'Acción a realizar. Valores: upload_cv_request | add_project | update_skills | edit_experience | edit_education | edit_project | remove_project | change_template'
    },
    project: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: 'Datos del proyecto para add_project o edit_project',
      properties: {
        title:       { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
        tags:        { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      }
    },
    projectIndex: {
      type: SchemaType.NUMBER,
      nullable: true,
      description: 'Índice 0-based del proyecto a editar o eliminar'
    },
    skills: {
      type: SchemaType.ARRAY,
      nullable: true,
      items: { type: SchemaType.STRING },
      description: 'Skills a añadir. Gemini extrae solo los skills mencionados.'
    },
    experience: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: 'Entrada de experiencia laboral',
      properties: {
        company:   { type: SchemaType.STRING },
        role:      { type: SchemaType.STRING },
        startYear: { type: SchemaType.NUMBER },
        endYear:   { type: SchemaType.NUMBER, nullable: true }
      }
    },
    education: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: 'Entrada de formación académica',
      properties: {
        institution: { type: SchemaType.STRING },
        degree:      { type: SchemaType.STRING },
        year:        { type: SchemaType.NUMBER }
      }
    },
    template: {
      type: SchemaType.STRING,
      nullable: true,
      description: 'Template a aplicar: modern | minimal | creative'
    }
  },
  required: ['action']
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function applyPortfolioPatchWithGemini(portfolio: any, userMessage: string): Promise<{ updatedPortfolio: any | null; responseMessage: string; handled: boolean }> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseSchema: portfolioPatchSchema as any,
      maxOutputTokens: 512,
    }
  })

  const prompt = `Analiza este mensaje de WhatsApp de un profesional que quiere editar su portfolio.
Extrae la intención y los datos estructurados.

Mensaje: "${userMessage}"

Estado actual del portfolio:
- Skills: ${JSON.stringify(portfolio.skills ?? [])}
- Proyectos: ${JSON.stringify((portfolio.content?.projects ?? []).map((p: { title: string }, i: number) => ({ index: i, title: p.title })))}
- Experiencia: ${JSON.stringify((portfolio.content?.experience ?? []).map((e: { company: string }) => e.company))}
- Template actual: ${portfolio.template ?? 'modern'}

Reglas:
- Si pide subir CV o documento → action: upload_cv_request
- Si añade proyecto nuevo → action: add_project, rellena project{}
- Si edita proyecto existente (por número o nombre) → action: edit_project, projectIndex (0-based), project{}
- Si elimina proyecto → action: remove_project, projectIndex (0-based)
- Si añade/actualiza skills → action: update_skills, skills[]
- Si actualiza experiencia laboral → action: edit_experience, experience{}
- Si añade educación/formación → action: edit_education, education{}
- Si cambia plantilla/diseño → action: change_template, template (modern|minimal|creative)
- projectIndex: si el usuario dice "primer proyecto" → 0, "segundo" → 1, etc.`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let patch: any
  try {
    const result = await model.generateContent(prompt)
    patch = JSON.parse(result.response.text())
  } catch (err) {
    console.error('[Portfolio patch] Gemini parse error:', err)
    return {
      updatedPortfolio: null,
      responseMessage: 'No entendí bien qué querías cambiar. ¿Puedes ser más específico?',
      handled: false,
    }
  }

  const content = structuredClone(portfolio.content ?? {})
  if (!content.projects)   content.projects   = []
  if (!content.experience) content.experience = []
  if (!content.education)  content.education  = []

  let responseMessage = ''
  let templateUpdate: string | undefined

  switch (patch.action) {

    case 'upload_cv_request': {
      return {
        updatedPortfolio: null,
        responseMessage: '📄 Envíame tu CV en PDF y lo procesaré automáticamente para actualizar tu portfolio.',
        handled: true,
      }
    }

    case 'add_project': {
      if (!patch.project?.title) {
        return { updatedPortfolio: null, responseMessage: 'Necesito al menos el título del proyecto. ¿Cómo se llama?', handled: false }
      }
      const newProject = {
        id:          `proj_${Date.now()}`,
        title:       patch.project.title,
        description: patch.project.description ?? '',
        tags:        patch.project.tags ?? [],
      }
      content.projects.push(newProject)
      responseMessage = `✅ Proyecto *${newProject.title}* añadido. Ahora tienes ${content.projects.length} proyecto(s).`
      break
    }

    case 'edit_project': {
      const idx = patch.projectIndex ?? -1
      if (idx < 0 || idx >= content.projects.length) {
        return { updatedPortfolio: null, responseMessage: `No encontré el proyecto en la posición ${idx + 1}. Tienes ${content.projects.length} proyecto(s).`, handled: false }
      }
      const prev = content.projects[idx]
      content.projects[idx] = {
        ...prev,
        title:       patch.project?.title       ?? prev.title,
        description: patch.project?.description ?? prev.description,
        tags:        patch.project?.tags        ?? prev.tags,
      }
      responseMessage = `✅ Proyecto *${content.projects[idx].title}* actualizado.`
      break
    }

    case 'remove_project': {
      const idx = patch.projectIndex ?? -1
      if (idx < 0 || idx >= content.projects.length) {
        return { updatedPortfolio: null, responseMessage: `No encontré el proyecto en la posición ${idx + 1}.`, handled: false }
      }
      const removed = content.projects.splice(idx, 1)[0]
      responseMessage = `🗑️ Proyecto *${removed.title}* eliminado. Quedan ${content.projects.length} proyecto(s).`
      break
    }

    case 'update_skills': {
      if (!patch.skills?.length) {
        return { updatedPortfolio: null, responseMessage: 'No detecté skills en tu mensaje. ¿Cuáles quieres añadir?', handled: false }
      }
      const currentSkills: string[] = portfolio.skills ?? []
      const newSkills = patch.skills.filter(
        (s: string) => !currentSkills.map((c: string) => c.toLowerCase()).includes(s.toLowerCase())
      )
      const merged = [...currentSkills, ...newSkills]
      portfolio = { ...portfolio, skills: merged }
      responseMessage = newSkills.length > 0
        ? `✅ Skills añadidas: *${newSkills.join(', ')}*. Total: ${merged.length}.`
        : `ℹ️ Ya tienes todas esas skills registradas.`
      break
    }

    case 'edit_experience': {
      if (!patch.experience?.company || !patch.experience?.role) {
        return { updatedPortfolio: null, responseMessage: 'Necesito empresa y cargo. Ej: "TechCorp, Senior Dev, 2021-2024"', handled: false }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = content.experience.findIndex((e: any) => e.company?.toLowerCase() === patch.experience.company.toLowerCase())
      const entry = {
        company:   patch.experience.company,
        role:      patch.experience.role,
        startYear: patch.experience.startYear,
        endYear:   patch.experience.endYear ?? null,
      }
      if (existing >= 0) {
        content.experience[existing] = entry
        responseMessage = `✅ Experiencia en *${entry.company}* actualizada.`
      } else {
        content.experience.push(entry)
        responseMessage = `✅ Experiencia en *${entry.company}* añadida.`
      }
      break
    }

    case 'edit_education': {
      if (!patch.education?.institution || !patch.education?.degree) {
        return { updatedPortfolio: null, responseMessage: 'Necesito institución y titulación. Ej: "UPM, Ing. Informática, 2019"', handled: false }
      }
      content.education.push({
        institution: patch.education.institution,
        degree:      patch.education.degree,
        year:        patch.education.year ?? null,
      })
      responseMessage = `✅ Formación en *${patch.education.institution}* añadida.`
      break
    }

    case 'change_template': {
      const valid = ['modern', 'minimal', 'creative']
      const tpl = patch.template?.toLowerCase()
      if (!tpl || !valid.includes(tpl)) {
        return { updatedPortfolio: null, responseMessage: `Templates disponibles: *modern*, *minimal*, *creative*. ¿Cuál prefieres?`, handled: false }
      }
      templateUpdate = tpl
      responseMessage = `✅ Template cambiado a *${tpl}*.`
      break
    }

    default: {
      return {
        updatedPortfolio: null,
        responseMessage: 'No reconocí esa acción. Puedes: añadir proyectos, actualizar skills, editar experiencia, formación o cambiar plantilla.',
        handled: false,
      }
    }
  }

  const updatedPortfolio = {
    ...portfolio,
    content,
    ...(templateUpdate ? { template: templateUpdate } : {}),
  }

  return { updatedPortfolio, responseMessage, handled: true }
}
