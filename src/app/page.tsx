import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-4 border-b">
        <span className="text-2xl font-bold text-blue-700">mivia.es</span>
        <Link href="/onboarding" className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
          Crea tu web gratis
        </Link>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Cuando alguien busca tu oficio en Google,<br />
          <span className="text-blue-700">apareces tú.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Web profesional en 2 minutos. SEO local automático. Actualízala desde WhatsApp.
        </p>
        <p className="text-lg text-gray-500 mb-10">
          Primer mes gratis — después, solo <strong>9€/mes</strong>.
        </p>
        <Link href="/onboarding" className="bg-blue-700 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-blue-800 inline-block">
          Crea tu web gratis →
        </Link>
      </section>

      {/* 3 PROMESAS */}
      <section className="bg-gray-50 py-20 px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Apareces en Google</h3>
            <p className="text-gray-700 text-sm">SEO local automático para tu oficio y ciudad desde el primer día.</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Web en 2 minutos</h3>
            <p className="text-gray-700 text-sm">La IA genera tu web profesional solo con responder 5 preguntas.</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Gestión por WhatsApp</h3>
            <p className="text-gray-700 text-sm">Manda un mensaje y tu web se actualiza. Sin aprender nada nuevo.</p>
          </div>
        </div>
      </section>

      {/* PITCH */}
      <section className="max-w-2xl mx-auto px-8 py-20 text-center">
        <p className="text-2xl font-medium text-gray-800 italic">
          &quot;Te creo la web en 2 minutos. Apareces en Google buscando tu oficio en tu ciudad. Y cuando quieras cambiar algo, me mandas un WhatsApp. Son 9€ al mes.&quot;
        </p>
      </section>

      {/* FOOTER */}
      <footer className="border-t px-8 py-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mb-4">
            <a href="/legal/terminos" className="hover:text-blue-700 transition">Términos de Servicio</a>
            <a href="/legal/privacidad" className="hover:text-blue-700 transition">Política de Privacidad</a>
            <a href="/legal/aviso-legal" className="hover:text-blue-700 transition">Aviso Legal</a>
            <a href="mailto:abuse@mivia.es" className="hover:text-blue-700 transition">abuse@mivia.es</a>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} mivia.es · Todos los derechos reservados</p>
        </div>
      </footer>
    </main>
  )
}
