import Link from 'next/link'

export default function Privacidad() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
      <div className="prose prose-slate">
        <p className="mb-4">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">1. Responsable del tratamiento</h2>
        <p className="mb-4">Jorge Reina Carpio<br/>Email: abuse@mivia.es</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">2. Datos que recopilamos</h2>
        <p className="mb-4">Al crear tu perfil en mivia.es, recopilamos:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Nombre del negocio</li>
          <li>Ciudad</li>
          <li>Servicios que ofreces</li>
          <li>Teléfono de contacto</li>
          <li>Información de pago (procesada por Stripe)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">3. Finalidad del tratamiento</h2>
        <p className="mb-4">Utilizamos tus datos para:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Generar y publicar tu página web</li>
          <li>Gestionar tu suscripción</li>
          <li>Enviarte comunicaciones sobre el servicio</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">4. Base legal</h2>
        <p className="mb-4">El tratamiento se basa en la ejecución del contrato de servicio (RGPD Art. 6.1.b).</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">5. Conservación de datos</h2>
        <p className="mb-4">Conservamos tus datos mientras mantengas tu suscripción activa y durante 5 años adicionales por obligaciones legales.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">6. Tus derechos</h2>
        <p className="mb-4">Tienes derecho a:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Acceder a tus datos personales</li>
          <li>Rectificar datos inexactos</li>
          <li>Solicitar la supresión de tus datos</li>
          <li>Oponerte al tratamiento</li>
          <li>Solicitar la portabilidad de tus datos</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">7. Contacto</h2>
        <p className="mb-4">Para ejercer tus derechos: <a href="mailto:abuse@mivia.es" className="text-blue-700 hover:underline">abuse@mivia.es</a></p>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-blue-700 hover:underline">← Volver a mivia.es</Link>
      </div>
    </div>
  )
}
