import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const totalBusinesses = await prisma.business.count()
  const pendingCount = await prisma.business.count({ where: { status: 'pending' } })
  const trialCount = await prisma.business.count({ where: { status: 'trial' } })
  const activeCount = await prisma.business.count({ where: { status: 'active' } })

  const recentBusinesses = await prisma.business.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { profile: true }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel - mivia.es</h1>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-2">Total Negocios</div>
            <div className="text-3xl font-bold text-gray-900">{totalBusinesses}</div>
          </div>

          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <div className="text-sm text-yellow-700 mb-2">Pendientes</div>
            <div className="text-3xl font-bold text-yellow-900">{pendingCount}</div>
          </div>

          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="text-sm text-blue-700 mb-2">Trial</div>
            <div className="text-3xl font-bold text-blue-900">{trialCount}</div>
          </div>

          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="text-sm text-green-700 mb-2">Activos</div>
            <div className="text-3xl font-bold text-green-900">{activeCount}</div>
          </div>
        </div>

        {/* Recent businesses table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Últimos negocios registrados</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBusinesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {business.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{business.phone}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        business.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        business.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                        business.status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {business.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(business.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/businesses/${business.username}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver detalle
                      </Link>
                      <a
                        href={`https://${business.username}.mivia.es`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                      >
                        Ver web →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
