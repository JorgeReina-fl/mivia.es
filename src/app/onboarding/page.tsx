'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { STYLE_PRESETS } from '@/lib/design-presets'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
}

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [vibe, setVibe] = useState<string>('modern')
  const [form, setForm] = useState({
    businessName: '',
    city: '',
    services: '',
    trustReason: '',
    contactPhone: '',
    username: '',
  })

  const loadingSteps = [
    '🔍 Analizando tu sector y competencia local...',
    '🎨 Diseñando la paleta de colores para tu oficio...',
    '✍️ Escribiendo textos persuasivos para captar clientes...',
    '📈 Optimizando para Google y SEO local...',
    '⚡ Ensamblando el código de tu web profesional...',
    '🚀 Preparando tu dirección web personalizada...',
  ]
  const [loadingTextIndex, setLoadingTextIndex] = useState(0)

  useEffect(() => {
    if (form.businessName) {
      setForm(prev => ({ ...prev, username: slugify(prev.businessName) }))
    }
  }, [form.businessName])

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingTextIndex(prev => (prev + 1) % loadingSteps.length)
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [loading, loadingSteps.length])

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)

  const submit = async () => {
    setLoading(true)
    const res = await fetch('/api/profile/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, vibe }),
    })
    const data = await res.json()
    if (data.username) {
      router.push(`/onboarding/success?username=${data.username}&code=${data.activationCode}`)
    } else {
      alert('Error al crear el perfil. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "text-xl font-bold mb-2 text-gray-900"
  const descClass = "text-sm text-gray-600 mb-4"

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg w-full">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Creando tu web...</h2>
            <p className="text-blue-700 font-medium text-lg min-h-[3rem] transition-opacity duration-500">
              {loadingSteps[loadingTextIndex]}
            </p>
            <p className="text-xs text-gray-400 mt-8">Esto puede tardar entre 10 y 20 segundos</p>
          </div>
        ) : (
          <>
        <div className="mb-6">
          <span className="text-blue-700 font-bold text-xl">mivia.es</span>
          <div className="flex gap-1 mt-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-blue-700' : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">Paso {step} de 6</p>
        </div>

        {step === 1 && (
          <div>
            <h2 className={labelClass}>¿Cómo se llama tu negocio y en qué ciudad trabajas?</h2>
            <p className={descClass}>Ejemplo: &quot;Fontanería López, trabajo en Elche&quot;</p>
            <input className={inputClass + " mb-3"} placeholder="Nombre del negocio" value={form.businessName} onChange={e => update('businessName', e.target.value)} />
            <input className={inputClass} placeholder="Ciudad o zona" value={form.city} onChange={e => update('city', e.target.value)} />
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className={labelClass}>¿Cuáles son los 3 servicios que más te piden?</h2>
            <p className={descClass}>Ejemplo: &quot;Desatascos 24h, cambiar bañera por plato de ducha, reparar termos&quot;</p>
            <textarea className={inputClass + " h-32 resize-none"} placeholder="Escribe tus 3 servicios principales..." value={form.services} onChange={e => update('services', e.target.value)} />
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className={labelClass}>¿Por qué confían en ti tus clientes?</h2>
            <p className={descClass}>Ejemplo: &quot;Llevo 15 años en el barrio y doy presupuesto cerrado antes de empezar&quot;</p>
            <textarea className={inputClass + " h-32 resize-none"} placeholder="Tu propuesta de valor..." value={form.trustReason} onChange={e => update('trustReason', e.target.value)} />
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className={labelClass}>¿A qué número quieres que te llamen o escriban?</h2>
            <p className={descClass}>Ejemplo: &quot;600 123 456, mejor por WhatsApp&quot;</p>
            <input className={inputClass} placeholder="Número de teléfono" value={form.contactPhone} onChange={e => update('contactPhone', e.target.value)} />
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className={labelClass}>¡Casi listo! 🎉</h2>
            <p className={descClass}>Revisa tu información y personaliza tu dirección web.</p>
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 space-y-1 mb-4">
              <p><strong>Negocio:</strong> {form.businessName}</p>
              <p><strong>Ciudad:</strong> {form.city}</p>
              <p><strong>Servicios:</strong> {form.services}</p>
              <p><strong>Diferencial:</strong> {form.trustReason}</p>
              <p><strong>Contacto:</strong> {form.contactPhone}</p>
            </div>

            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
              <p className="text-xs font-semibold text-blue-700 mb-2">🌐 Tu dirección web será:</p>
              <div className="flex items-center gap-1 bg-white border border-blue-300 rounded-lg px-3 py-2">
                <span className="text-gray-400 text-sm whitespace-nowrap">mivia.es/</span>
                <input
                  className="flex-1 text-sm text-blue-800 font-medium bg-transparent focus:outline-none min-w-0"
                  value={form.username}
                  onChange={e => update('username', slugify(e.target.value))}
                  placeholder="tu-negocio"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Puedes personalizarla. Solo letras, números y guiones.</p>
              <p className="text-xs text-blue-600 mt-1 font-medium">→ {form.username}.mivia.es</p>
            </div>
          </div>
        )}

        {step === 6 && (
          <>
            <h2 className="text-2xl font-bold mb-2">Elige el estilo de tu web</h2>
            <p className="text-gray-600 mb-6">Selecciona la vibra que mejor represente tu negocio</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {Object.values(STYLE_PRESETS).map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setVibe(preset.id)}
                  className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                    vibe === preset.id
                      ? 'border-blue-700 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{preset.label}</h3>
                    {vibe === preset.id && (
                      <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{preset.description}</p>

                  {/* Preview visual */}
                  <div className="mt-4 flex gap-2">
                    <div className={`w-full h-2 bg-gray-200 ${preset.corners}`} />
                    <div className={`w-full h-2 bg-gray-300 ${preset.corners}`} />
                    <div className={`w-full h-2 bg-gray-400 ${preset.corners}`} />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-4">
          {step > 1 && (
            <button
              onClick={back}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Atrás
            </button>
          )}
          {step < 5 && (
            <button
              onClick={next}
              disabled={
                (step === 1 && (!form.businessName || !form.city)) ||
                (step === 2 && !form.services) ||
                (step === 3 && !form.trustReason) ||
                (step === 4 && !form.contactPhone)
              }
              className="flex-1 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          )}
          {step === 5 && (
            <button
              onClick={() => setStep(6)}
              className="flex-1 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800"
            >
              Continuar →
            </button>
          )}
          {step === 6 && (
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 disabled:bg-gray-400"
            >
              {loading ? 'Generando...' : 'Crear mi web gratis →'}
            </button>
          )}
        </div>
      </>
      )}
      </div>
    </main>
  )
}
