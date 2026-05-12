import Link from 'next/link'

export default function AvisoLegal() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Aviso Legal</h1>
      <div className="prose prose-slate">
        <p className="mb-4">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">1. Datos identificativos</h2>
        <p className="mb-4">
          En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE):
        </p>
        <ul className="list-none mb-4">
          <li><strong>Titular:</strong> Jorge Reina Carpio</li>
          <li><strong>Dominio:</strong> mivia.es</li>
          <li><strong>Email:</strong> abuse@mivia.es</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">2. Objeto</h2>
        <p className="mb-4">mivia.es es una plataforma SaaS que permite a autónomos y micropymes crear páginas web profesionales de forma automática.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">3. Condiciones de uso</h2>
        <p className="mb-4">El acceso y uso de mivia.es implica la aceptación de estos términos. El usuario se compromete a hacer un uso lícito del servicio.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">4. Propiedad intelectual</h2>
        <p className="mb-4">El código, diseño y contenidos de mivia.es son propiedad de Jorge Reina Carpio. El contenido publicado por los usuarios es responsabilidad exclusiva de estos.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">5. Responsabilidad</h2>
        <p className="mb-4">mivia.es actúa como plataforma intermediaria conforme a la DSA (Digital Services Act). No nos responsabilizamos del contenido publicado por terceros, pero aplicamos mecanismos de moderación y reportes.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">6. Protección de datos</h2>
        <p className="mb-4">El tratamiento de datos personales se rige por nuestra <a href="/legal/privacidad" className="text-blue-700 hover:underline">Política de Privacidad</a>.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">7. Contacto</h2>
        <p className="mb-4">Para notificaciones legales: <a href="mailto:abuse@mivia.es" className="text-blue-700 hover:underline">abuse@mivia.es</a></p>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-blue-700 hover:underline">← Volver a mivia.es</Link>
      </div>
    </div>
  )
}
