import Link from 'next/link'

export default function Terminos() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Términos de Servicio</h1>
      <div className="prose prose-slate">
        <p className="mb-4">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">1. Aceptación de los términos</h2>
        <p className="mb-4">Al usar mivia.es, aceptas estos términos. El servicio consiste en la creación automática de páginas web profesionales para autónomos y micropymes.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">2. Descripción del servicio</h2>
        <p className="mb-4">mivia.es ofrece:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Generación automática de webs profesionales mediante IA</li>
          <li>Subdominio personalizado (tunegocio.mivia.es)</li>
          <li>SEO local automático</li>
          <li>30 días de prueba gratuita</li>
          <li>Suscripción mensual de 9€ tras el período de prueba</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">3. Obligaciones del usuario</h2>
        <p className="mb-4">El usuario se compromete a:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Proporcionar información veraz y actualizada</li>
          <li>No publicar contenido ilegal, ofensivo o fraudulento</li>
          <li>No utilizar el servicio para actividades ilegales</li>
          <li>Respetar los derechos de propiedad intelectual</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">4. Moderación de contenido</h2>
        <p className="mb-4">mivia.es se reserva el derecho de suspender o eliminar perfiles que incumplan estos términos o contengan contenido ilegal.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">5. Cancelación y reembolsos</h2>
        <p className="mb-4">Puedes cancelar tu suscripción en cualquier momento. No se realizan reembolsos por períodos ya facturados.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">6. Limitación de responsabilidad</h2>
        <p className="mb-4">mivia.es no se responsabiliza del contenido publicado por los usuarios ni de los resultados comerciales obtenidos.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">7. Contacto</h2>
        <p className="mb-4">Para cualquier consulta: <a href="mailto:abuse@mivia.es" className="text-blue-700 hover:underline">abuse@mivia.es</a></p>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-blue-700 hover:underline">← Volver a mivia.es</Link>
      </div>
    </div>
  )
}
