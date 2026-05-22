import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PanicButtons from './PanicButtons'

export const dynamic = 'force-dynamic'

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const business = await prisma.business.findUnique({
    where: { username },
    include: {
      profile: true,
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  })

  if (!business) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = business.profile?.content as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const backupContent = business.profile?.backupContent as any

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="text-blue-600 hover:text-blue-900 text-sm mb-2 inline-block">
            ← Volver al dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {business.username}
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left column: Business info */}
          <div className="col-span-2 space-y-6">
            {/* Basic info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información básica</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Username</div>
                  <div className="text-lg font-medium text-gray-900">{business.username}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Teléfono</div>
                  <div className="text-lg font-medium text-gray-900">{business.phone}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    business.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    business.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                    business.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {business.status}
                  </span>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Creado</div>
                  <div className="text-lg font-medium text-gray-900">
                    {new Date(business.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {business.activationCode && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Código de activación</div>
                    <div className="text-2xl font-bold text-yellow-700">{business.activationCode}</div>
                    <div className="text-xs text-gray-500 mt-1">Esperando activación por WhatsApp</div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <a
                  href={`https://${business.username}.mivia.es`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ver web pública →
                </a>
              </div>

              <PanicButtons username={business.username} status={business.status} />
            </div>

            {/* Profile content */}
            {content && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contenido de la web</h2>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Tipo de negocio</div>
                    <div className="text-gray-900">{content.businessType}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700">Hero</div>
                    <div className="text-gray-900">
                      <div className="font-semibold">{content.hero?.title}</div>
                      <div className="text-sm text-gray-600">{content.hero?.subtitle}</div>
                    </div>
                  </div>

                  {content.services && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Servicios</div>
                      <div className="grid grid-cols-2 gap-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {content.services.map((service: any, idx: number) => (
                          <div key={idx} className="text-sm bg-gray-50 rounded px-3 py-2">
                            {service.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {content.contact && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Contacto</div>
                      <div className="text-sm text-gray-900">
                        <div>📞 {content.contact.phone}</div>
                        {content.contact.hours && <div>🕐 {content.contact.hours}</div>}
                      </div>
                    </div>
                  )}
                </div>

                {backupContent && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">✓ Backup disponible (puede deshacer último cambio)</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column: Updates history */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Historial de actualizaciones
              </h2>

              {business.updates && business.updates.length > 0 ? (
                <div className="space-y-3">
                  {business.updates.map((update) => (
                    <div key={update.id} className="text-sm border-l-2 border-blue-500 pl-3 py-2">
                      <div className="text-gray-900 font-medium">
                        {update.rawMessage.length > 60
                          ? update.rawMessage.substring(0, 60) + '...'
                          : update.rawMessage
                        }
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(update.createdAt).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-8">
                  Sin actualizaciones todavía
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
