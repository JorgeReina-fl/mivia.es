import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWeeklyVisits } from '@/lib/analytics'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const activeBusinesses = await prisma.business.findMany({
    where: { status: 'active' },
    include: { profile: true }
  })

  let sent = 0

  for (const business of activeBusinesses) {
    const visits = await getWeeklyVisits(business.id)

    if (visits > 0) {
      await sendWhatsAppMessage({
        to: business.phone,
        text: `¡Hola! Esta semana tu web ${business.username}.mivia.es tuvo ${visits} visitas. ¡Buen trabajo! 🎉`
      })
      sent++
    }
  }

  return NextResponse.json({ sent, total: activeBusinesses.length })
}
