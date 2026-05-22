export default function TerminosCondiciones() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="inline-block bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full mb-6">
          Proyecto en Fase Beta
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Condiciones de Uso</h1>
        <p className="text-sm text-gray-500 mb-8">Versión Beta · Mayo 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-gray-700">

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">⚠️ Proyecto en fase de pruebas</h2>
            <p className="text-amber-800">mivia.es es un experimento tecnológico en fase beta. El servicio se ofrece gratuitamente y sin garantías de disponibilidad, continuidad o exactitud. Puede ser modificado, suspendido o discontinuado en cualquier momento sin previo aviso.</p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Naturaleza del servicio</h2>
            <p>mivia.es es un proyecto tecnológico experimental que permite generar webs automáticas mediante inteligencia artificial. El servicio se ofrece de forma gratuita durante esta fase de pruebas, sin ningún tipo de contraprestación económica.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Servicio &ldquo;tal cual&rdquo; (As-Is)</h2>
            <p>El servicio se presta <strong>sin garantías de ningún tipo</strong>, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sin garantía de disponibilidad continua del servicio</li>
              <li>Sin garantía de exactitud en los contenidos generados por IA</li>
              <li>Sin garantía de idoneidad para ningún propósito comercial</li>
              <li>Sin compromisos de SLA ni tiempos de respuesta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Responsabilidad por contenido generado por IA</h2>
            <p className="font-medium text-red-700">El usuario asume la responsabilidad total de revisar y validar todo el contenido generado automáticamente antes de publicarlo o utilizarlo.</p>
            <p className="mt-3">mivia.es utiliza modelos de inteligencia artificial (Google Gemini) que pueden generar contenido inexacto, incorrecto o inapropiado (&ldquo;alucinaciones&rdquo;). mivia.es no se hace responsable de:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Errores, imprecisiones o alucinaciones en textos generados</li>
              <li>Daños comerciales, reputacionales o económicos derivados del uso del contenido</li>
              <li>Infracciones de derechos de propiedad intelectual por contenido generado</li>
              <li>Testimonios o reseñas ilustrativas que el usuario no haya sustituido por reales</li>
              <li>Fotografías de Unsplash que puedan tener restricciones de uso en casos específicos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Obligaciones del usuario</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Revisar y validar todo el contenido antes de publicarlo</li>
              <li>Usar el servicio únicamente para actividades lícitas</li>
              <li>No publicar contenido ilegal, fraudulento o que vulnere derechos de terceros</li>
              <li>Sustituir los testimonios ilustrativos por reseñas reales propias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Suspensión del servicio</h2>
            <p>mivia.es se reserva el derecho a suspender o eliminar cualquier web generada en cualquier momento y sin previo aviso, especialmente si se detecta uso fraudulento, contenido ilegal o abusivo.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Limitación de responsabilidad</h2>
            <p>La responsabilidad máxima de mivia.es en cualquier circunstancia queda limitada a <strong>€0</strong>, dado que el servicio se presta de forma completamente gratuita y sin contraprestación económica.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Contacto</h2>
            <p>Para cualquier consulta: <strong>hola@mivia.es</strong></p>
          </section>

          <p className="text-sm text-gray-500 pt-8 border-t">Última actualización: Mayo 2026 · Proyecto en fase beta</p>
        </div>
      </div>
    </main>
  )
}
