interface WhatsAppButton {
  id: string
  title: string
}

interface WhatsAppMessage {
  to: string
  text: string
  buttons?: WhatsAppButton[]
}

export async function sendWhatsAppMessage(message: WhatsAppMessage) {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.log('[WhatsApp] Token not configured, logging message:', message)
    return { logged: true }
  }

  const payload = message.buttons
    ? {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: message.to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: message.text },
          action: {
            buttons: message.buttons.map(btn => ({
              type: 'reply',
              reply: { id: btn.id, title: btn.title }
            }))
          }
        }
      }
    : {
        messaging_product: 'whatsapp',
        to: message.to,
        type: 'text',
        text: { body: message.text }
      }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )

    const data = await response.json()
    console.log('[WhatsApp] Message sent:', data)
    return data
  } catch (error) {
    console.error('[WhatsApp] Error sending message:', error)
    return { error }
  }
}

// Alias mantenido por compatibilidad
export const sendWhatsAppButtons = (message: { to: string; text: string; buttons: WhatsAppButton[] }) =>
  sendWhatsAppMessage(message)

export async function downloadWhatsAppMedia(mediaId: string): Promise<Buffer> {
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
  if (!ACCESS_TOKEN) throw new Error('WHATSAPP_ACCESS_TOKEN not configured')

  // 1. Obtener la URL del medio
  const res = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
  })
  
  if (!res.ok) {
    throw new Error(`Failed to get media info: ${await res.text()}`)
  }
  
  const data = await res.json()
  const mediaUrl = data.url
  
  if (!mediaUrl) throw new Error('No media URL found in response')

  // 2. Descargar el archivo binario
  const downloadRes = await fetch(mediaUrl, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
  })
  
  if (!downloadRes.ok) {
    throw new Error(`Failed to download media: ${await downloadRes.text()}`)
  }

  const arrayBuffer = await downloadRes.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
