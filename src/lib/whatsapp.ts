interface WhatsAppMessage {
  to: string
  text: string
}

interface WhatsAppButtonMessage {
  to: string
  text: string
  buttons: Array<{ id: string; title: string }>
}

export async function sendWhatsAppMessage(message: WhatsAppMessage) {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.log('[WhatsApp] Token not configured, logging message:', message)
    return { logged: true }
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
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: message.to,
          text: { body: message.text }
        })
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

export async function sendWhatsAppButtons(message: WhatsAppButtonMessage) {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.log('[WhatsApp] Token not configured, logging buttons:', message)
    return { logged: true }
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
        body: JSON.stringify({
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
        })
      }
    )

    const data = await response.json()
    console.log('[WhatsApp] Buttons sent:', data)
    return data
  } catch (error) {
    console.error('[WhatsApp] Error sending buttons:', error)
    return { error }
  }
}
