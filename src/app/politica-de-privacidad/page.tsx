export default function PoliticaPrivacidad() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: Mayo 2026</p>
        <div className="prose prose-slate max-w-none space-y-6 text-gray-700">

          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Responsable del tratamiento</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Identidad:</strong> Jorge Reina Guamán</li>
              <li><strong>NIF:</strong> 78249988D</li>
              <li><strong>Email:</strong> privacidad@mivia.es</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Datos que tratamos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left">Categoría</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Datos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-200 px-4 py-2">Identificación</td><td className="border border-gray-200 px-4 py-2">Nombre del negocio</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Contacto</td><td className="border border-gray-200 px-4 py-2">Teléfono, email (opcional)</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Ubicación</td><td className="border border-gray-200 px-4 py-2">Ciudad</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Comunicaciones</td><td className="border border-gray-200 px-4 py-2">Mensajes de WhatsApp</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Técnicos</td><td className="border border-gray-200 px-4 py-2">IP, fecha de acceso</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Facturación</td><td className="border border-gray-200 px-4 py-2">Gestionados por Stripe</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Bases legales</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Ejecución del contrato:</strong> Crear y gestionar tu web, facturación, atención por WhatsApp</li>
              <li><strong>Obligación legal:</strong> Cumplimiento fiscal y mercantil</li>
              <li><strong>Consentimiento:</strong> Comunicaciones comerciales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Plazos de conservación</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Datos del servicio activo: Durante la vigencia del contrato</li>
              <li>Tras cancelación: Bloqueados 5 años</li>
              <li>Datos de facturación: 6 años (obligación fiscal)</li>
              <li>Historial WhatsApp: 30 días tras cancelación</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Proveedores y transferencias internacionales</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left">Proveedor</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Servicio</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Garantías</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-200 px-4 py-2">Stripe Inc.</td><td className="border border-gray-200 px-4 py-2">Pagos</td><td className="border border-gray-200 px-4 py-2">DPF UE-EE.UU.</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Google LLC</td><td className="border border-gray-200 px-4 py-2">IA Gemini</td><td className="border border-gray-200 px-4 py-2">DPF UE-EE.UU.</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Meta Platforms</td><td className="border border-gray-200 px-4 py-2">WhatsApp API</td><td className="border border-gray-200 px-4 py-2">DPF UE-EE.UU.</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Oracle Corporation</td><td className="border border-gray-200 px-4 py-2">Cloud (Europa)</td><td className="border border-gray-200 px-4 py-2">BCR + DPA</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Tus derechos</h2>
            <p>Tienes derecho de Acceso, Rectificación, Supresión, Oposición, Portabilidad y Limitación. Escribe a <strong>privacidad@mivia.es</strong>. Responderemos en 30 días. Puedes reclamar ante la AEPD (www.aepd.es).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. WhatsApp</h2>
            <p>Al activar tu web por WhatsApp, consientes recibir notificaciones del servicio. No usaremos tu número para publicidad no solicitada. Meta Platforms actúa como Subencargado del Tratamiento.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Cookies</h2>
            <p>Usamos únicamente cookies técnicas necesarias. No usamos cookies de analítica ni publicidad de terceros.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. Seguridad</h2>
            <p>HTTPS/TLS, base de datos en servidores europeos (Oracle Cloud), acceso restringido y backups cifrados.</p>
          </section>

          <p className="text-sm text-gray-500 pt-8 border-t">Contacto privacidad: privacidad@mivia.es</p>
        </div>
      </div>
    </main>
  )
}
