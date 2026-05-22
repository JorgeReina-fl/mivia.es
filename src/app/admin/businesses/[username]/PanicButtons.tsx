'use client'

import { useRouter } from 'next/navigation'
export default function PanicButtons({
  username,
  status,
}: {
  username: string
  status: string
}) {
  const router = useRouter()

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`¿Estás TOTALMENTE SEGURO de que deseas eliminar a ${username}? Esta acción destruirá su perfil, portfolio y toda la base de datos asociada y NO se puede deshacer.`)
    if (!confirmDelete) return

    const res = await fetch(`/api/admin/delete/${username}`, { method: 'POST' })
    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      alert('Error al eliminar')
    }
  }

  return (
    <div className="mt-8 p-4 border border-red-200 rounded-xl bg-red-50">
      <h3 className="text-sm font-semibold text-red-800 mb-2">
        ⚠️ Zona de emergencia
      </h3>
      <p className="text-xs text-red-600 mb-3">
        Suspende la web inmediatamente si detectas contenido ilegal o abusivo.
        El negocio NO será notificado.
      </p>
      <div className="flex gap-2">
        {status !== 'suspended' && (
          <button
            onClick={async () => {
              if (!confirm('¿Suspender esta web inmediatamente?')) return
              await fetch(`/api/admin/suspend/${username}`, { method: 'POST' })
              window.location.reload()
            }}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            🚨 Suspender web ahora
          </button>
        )}
        {status === 'suspended' && (
          <button
            onClick={async () => {
              await fetch(`/api/admin/unsuspend/${username}`, { method: 'POST' })
              window.location.reload()
            }}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            ✅ Reactivar web
          </button>
        )}
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-800 text-white text-sm font-bold rounded-lg hover:bg-red-900 transition-colors"
        >
          🗑️ Eliminar Definitivamente
        </button>
      </div>
    </div>
  )
}
