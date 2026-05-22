export default function AvisoLegal() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Aviso Legal</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-gray-700">

          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Datos identificativos del titular</h2>
            <p>En cumplimiento del artículo 10 de la Ley 34/2002 (LSSI-CE):</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Titular:</strong> Jorge Reina Guamán</li>
              <li><strong>NIF:</strong> 78249988D</li>
              <li><strong>Domicilio:</strong> Elche, Alicante, España</li>
              <li><strong>Email:</strong> hola@mivia.es</li>
              <li><strong>Web:</strong> https://mivia.es</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Objeto y naturaleza</h2>
            <p>mivia.es es un <strong>proyecto experimental en fase beta</strong> que permite a autónomos y pequeñas empresas crear webs profesionales automáticas mediante inteligencia artificial. El servicio se ofrece de forma gratuita y sin garantías durante esta fase de pruebas.</p>
            <p className="mt-2">El operador actúa a título personal como desarrollador independiente, sin constituir actividad económica organizada.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Propiedad intelectual</h2>
            <p>El código fuente, diseño, plantillas, logotipos y cualquier otro elemento de mivia.es son propiedad exclusiva del titular. Queda expresamente prohibida su reproducción o comunicación pública sin autorización expresa.</p>
            <p>El contenido textual generado automáticamente mediante IA no está sujeto a derechos de autor en virtud de la normativa española y europea vigente.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Responsabilidad</h2>
            <p>El titular no se hace responsable de errores en contenidos generados por IA, daños derivados del uso incorrecto del servicio, ni contenidos publicados por los clientes en sus webs generadas.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Legislación aplicable</h2>
            <p>Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales de Elche (Alicante).</p>
          </section>

          <p className="text-sm text-gray-500 pt-8 border-t">Última actualización: Mayo 2026</p>
        </div>
      </div>
    </main>
  )
}
