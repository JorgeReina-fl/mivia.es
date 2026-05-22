# Auditoría MVP-mivia — 2026-05-21

> **Auditor:** Claude Opus 4.7 — auditoría de solo lectura, sin modificar código ni BD.
> **Repositorio:** `/home/ubuntu/MVP-mivia`
> **Branch:** `main` (working tree dirty, 30+ ficheros sin commitear).

---

## Resumen ejecutivo

| Métrica | Valor |
|---|---|
| Versión auditada (CHANGELOG) | **v1.2.9** |
| Versión real en `git log` | `ae02116` — *“MVP completo…”* (la única feature commiteada desde el initial commit) |
| LOC totales `src/**/*.{ts,tsx}` | **~9.927** |
| LOC del handler WhatsApp | **1.442** (route.ts monolítico) |
| Endpoints API | **11** |
| Endpoints **sin autenticación efectiva** | **6 / 11** (suspend, unsuspend, logout, profile/create, portfolio/create, portfolio/upload-cv, whatsapp/update) ⚠️ |
| Endpoints **con validación Zod** | **0 / 11** — Zod **no está instalado** |
| Queries Prisma sin `select` | **18 / 19** (sólo `sitemap.ts` usa `select`) |
| Handlers WhatsApp **con try/catch propio** | sólo el outer `POST` y el bloque PDF; el resto de ramas comparten un único `try` |
| `console.*` calls en `src/` | **66** (incluye PII: teléfonos, mensajes, IDs) |
| Migraciones Prisma | **9** (consistentes con el schema actual) |
| Tests automatizados | **0** (sólo `test-webhook.js`, script manual) |
| Commits en `git log` | **2** — CHANGELOG describe ~30 features no commiteadas |
| **Hallazgos críticos** | **9** |
| **Altos** | **14** |
| **Medios** | **17** |
| **Bajos** | **11** |
| **Puntuación global** | **38 / 100** — *Funciona en MVP, no apto para escalar sin sprint de hardening.* |

---

## Hallazgos por severidad

### 🔴 CRÍTICOS (bloquean producción o exponen datos)

#### C-1. Endpoints `/api/admin/*` no están protegidos por el middleware
- **Archivos:** `src/middleware.ts:13` + `src/app/api/admin/suspend/[username]/route.ts`, `src/app/api/admin/unsuspend/[username]/route.ts`, `src/app/api/admin/logout/route.ts`.
- **Impacto:** El middleware comprueba `pathname.startsWith('/admin')`, pero los endpoints viven bajo `/api/admin/...`. Cualquiera puede hacer `POST https://mivia.es/api/admin/suspend/<username>` desde Internet y **suspender la web de cualquier cliente**. Daño potencial a un SaaS que cobra 9 €/mes: 1 atacante puede tumbar todo el negocio.
- **Recomendación:** Añadir comprobación de cookie `admin_session` en cada handler o ampliar matcher del middleware a `/api/admin/:path*`. Idealmente migrar a JWT firmado con `NEXTAUTH_SECRET`.

#### C-2. Cookie de sesión admin no firmada — token literal `'authenticated'`
- **Archivo:** `src/app/api/admin/login/route.ts:12-17` + `src/middleware.ts:16`.
- **Impacto:** La sesión admin se identifica con `cookie.value === 'authenticated'`. Forjar la cookie es trivial (`document.cookie = "admin_session=authenticated"`). Como además el middleware sólo protege `/admin` pages (no API), basta acceder al panel directamente.
- **Recomendación:** Reemplazar por JWT firmado (`jose`/`next-auth`) con expiración y rotación. Usar `__Host-` prefix, `Secure`, `HttpOnly`, `SameSite=Strict`.

#### C-3. Contraseña admin con fallback hardcodeado
- **Archivo:** `src/app/api/admin/login/route.ts:4` → `const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mivia2026'`.
- **Impacto:** Si la env var no está seteada en producción, la contraseña conocida pública permite full takeover del panel. No hay `ADMIN_PASSWORD` ni en `.env` ni en `.env.local` ni en `docker-compose.yml` → en este momento la contraseña real **es `mivia2026`**.
- **Recomendación:** Lanzar error fatal si `ADMIN_PASSWORD` no está definida. Almacenar hash bcrypt en vez de plaintext. Añadir 2FA TOTP.

#### C-4. Webhook `/api/whatsapp/update` sin verificación de firma de Meta
- **Archivo:** `src/app/api/whatsapp/update/route.ts:122` (POST handler).
- **Impacto:** Cualquiera puede POSTear payloads simulando WhatsApp y disparar:
  - Activación de un Business pendiente (línea 184) sin tener el código real, si conoce el `from`.
  - Modificación masiva de perfiles vía Gemini (línea 647 → `updateContentWithGemini`).
  - Consumo ilimitado de la API Gemini ($$).
- **Recomendación:** Validar header `x-hub-signature-256` con `crypto.createHmac('sha256', WHATSAPP_APP_SECRET)` antes de cualquier procesamiento. Documentado por Meta como obligatorio.

#### C-5. Sin validación de input ni rate limiting en endpoints públicos de creación
- **Archivos:** `src/app/api/profile/create/route.ts:397`, `src/app/api/portfolio/create/route.ts:119`.
- **Impacto:** Cualquiera puede crear Business sin auth → spam masivo de registros, consumo de API Gemini ($$), llenado de BD, generación de URLs maliciosas (`fake-business.mivia.es`). Sin captcha, sin throttling por IP, sin verificación email/teléfono previa.
- **Recomendación:** Captcha (hCaptcha/Cloudflare Turnstile) + rate limit por IP (10/h) + verificación de teléfono OTP antes de crear el Business definitivo.

#### C-6. Secretos reales (Twilio, WhatsApp, Stripe, Gemini, Unsplash) presentes en `.env.local`
- **Archivos:** `.env.local`, `.env` (ambos en `.gitignore`, pero presentes en disco).
- **Impacto:** Los tokens y secretos están en texto plano en el disco de la VM. Si la VM se comparte, hace snapshot, o se rota un sysadmin, todos los secretos quedan expuestos. El `STRIPE_SECRET_KEY` es de test, pero el `WHATSAPP_ACCESS_TOKEN`, `TWILIO_AUTH_TOKEN` y `GEMINI_API_KEY` parecen reales y de producción.
- **Verificar:** ¿Algún `.env*` se subió alguna vez al repo? `git log --all -- '.env*'` no muestra historial, pero recomiendo `git filter-repo --invert-paths --path .env --path .env.local`.
- **Recomendación:** Migrar a un gestor de secretos (Doppler, Vault, AWS Secrets Manager, o como mínimo systemd `LoadCredential`). Rotar **todos** los tokens listados. No commitear nunca `.env.example` con valores reales (ahora no existe `.env.example` — crear uno con placeholders).

#### C-7. Race condition en generación de `username` único
- **Archivos:** `src/app/api/portfolio/create/route.ts:230-234` y `src/app/api/profile/create/route.ts:402-407`.
- **Impacto:** Patrón *“check then create”*: `findUnique` → si libre, `create`. Entre las dos operaciones, otro request concurrente puede ganar la carrera y crear el mismo username. El segundo `create` fallará con P2002 (unique constraint), pero como el primer endpoint **ya cobró tiempo de Gemini** ($) y consumió `Date.now().slice(-4)` (sólo 10.000 combinaciones), la colisión es probable bajo carga.
- **Recomendación:** Usar `try { create } catch P2002 { reintentar con nuevo suffix }` dentro de transacción, o `cuid()` directo y resolver el username via lookup.

#### C-8. WhatsApp puede crear múltiples Business para el mismo teléfono
- **Archivo:** `src/app/api/whatsapp/update/route.ts:210-213` (`phone: { contains: from.slice(-9) }`) + 268-296 (creación dentro de `loc:city`).
- **Impacto:** El handler usa una búsqueda parcial (`contains`) y luego crea un nuevo Business si la sesión está en `loc:city`. Si el usuario envía mensajes rápidos consecutivos durante el onboarding, o si dos sesiones se cruzan, **se crean Business duplicados con teléfonos solapados**. Además, `from.slice(-9)` es vulnerable a colisiones entre números muy distintos que compartan los últimos 9 dígitos.
- **Recomendación:** Unique constraint `(phone, isDeleted=false)` parcial en Postgres, y normalizar el teléfono antes de comparar (E.164).

#### C-9. `legalAcceptedAt` se autorrellena con `new Date()` si el cliente omite el campo
- **Archivo:** `src/app/api/profile/create/route.ts:449` → `legalAcceptedAt: body.legalAcceptedAt ? new Date(body.legalAcceptedAt) : new Date()`.
- **Impacto:** Si el frontend olvida enviar el flag (bug o cliente malicioso), la app **inventa** una marca de aceptación legal LSSI/RGPD. Si hubiera una reclamación, la traza es falsa.
- **Recomendación:** Rechazar la request si no llega `legalAcceptedAt`. Auditar también `portfolio/create` flow A (línea 247) — no verifica aceptación legal antes de crear Business.

---

### 🟠 ALTOS (deuda técnica que limita escalabilidad)

#### A-1. Cero validación con Zod (o cualquier librería de schemas)
- Zod **no figura en `package.json`**. Todos los endpoints validan campos a mano (`if (!fullName)`, `if (file.size > MAX)`). Inconsistente y propenso a errores. La extensión a 50+ campos del Portfolio multiplicará bugs.
- **Recomendación:** Instalar `zod`, definir schemas compartidos en `src/lib/schemas/*.ts`, parsear request bodies con `safeParse` y devolver 400 con detalle.

#### A-2. Bot WhatsApp es un monolito de 1.442 líneas
- `src/app/api/whatsapp/update/route.ts` contiene: webhook verify, onboarding, activación, menú, deshacer, estadísticas, upload CV, patch local y patch portfolio, dos schemas Gemini, dos handlers Gemini. Imposible de testear unitariamente; cambios en una rama rompen otras.
- **Recomendación:** Extraer a `src/lib/whatsapp/handlers/{onboarding,activation,menu,undo,patchProfile,patchPortfolio,uploadCv}.ts`. El route.ts debería ser un dispatcher de ~50 líneas.

#### A-3. Lógica de extracción Gemini duplicada en 3 sitios
- `src/lib/gemini-cv-extractor.ts:100` (`extractCVWithGemini`), `src/lib/gemini-rate-limiter.ts:7` (wrapper con timeout), `src/app/api/portfolio/create/route.ts:37` (`generatePortfolioSeed`), `src/app/api/profile/create/route.ts:190` (`generateWebContent`), `src/app/api/whatsapp/update/route.ts:906` (`updateContentWithGemini`) + 1258 (`applyPortfolioPatchWithGemini`).
- Cada llamada inicializa `new GoogleGenerativeAI(...)` por separado → multiples instancias, sin reuse, sin pooling.
- **Recomendación:** Centralizar en `src/lib/gemini/client.ts` (singleton) + `src/lib/gemini/prompts/*.ts` (prompts) + `src/lib/gemini/schemas/*.ts`.

#### A-4. Caché de Business solo se usa en `/[username]`, no en `/p/[username]`
- `src/app/[username]/page.tsx:26` usa `getBusinessByUsername` (`unstable_cache`, TTL 1h).
- `src/app/p/[username]/page.tsx:17` y `:65` hacen `prisma.business.findUnique` directamente, sin caché.
- **Impacto:** Las rutas `/p/<user>` golpean BD en cada request. Cuando un portfolio se viralice, latencia y carga se disparan.
- **Recomendación:** Reutilizar `getBusinessByUsername` en ambas páginas.

#### A-5. La caché nunca se invalida tras un update por WhatsApp
- `src/lib/cache-business.ts:27` exporta `invalidateBusinessCache`, pero **no se llama desde ningún sitio**.
- **Impacto:** Tras editar la web por WhatsApp, el cliente ve cambios reflejados hasta 1h más tarde. Mala UX de un SaaS que promete edición instantánea.
- **Recomendación:** Llamar `revalidateTag('business')` después de cada `prisma.profile.update` / `prisma.portfolio.update` en el webhook.

#### A-6. Queries Prisma sin `select` — over-fetching sistémico
- 18 de 19 queries traen el modelo completo más `include` ramificados. `getBusinessByUsername` arrastra `profile + portfolio + uploads` siempre, incluso para el favicon.
- **Recomendación:** Auditar cada query y añadir `select` con los campos estrictamente necesarios. Especialmente crítico en `cache-business.ts` (se cachean blobs grandes).

#### A-7. Plantillas `<img>` sin `next/image`
- Todas las plantillas (`TemplatHogar`, `TemplatBoutique`, `TemplatEstudio`, `PortfolioModern`, `PortfolioMinimal`) renderizan fotos de Unsplash con `<img>`. Sin optimización ni lazy loading nativo, LCP penalizado, Core Web Vitals bajan → SEO penalizado.
- **Recomendación:** Migrar a `next/image` con `remotePatterns` para `images.unsplash.com`.

#### A-8. `/api/cron/weekly-notifications` no es resiliente
- `src/app/api/cron/weekly-notifications/route.ts:19-29`: bucle `for` con `await sendWhatsAppMessage` sin try/catch. Un fallo de WhatsApp (rate limit, 5xx) aborta todas las notificaciones restantes.
- Tampoco hay paginación: si el SaaS crece a 10.000 clientes activos, el cron tardará horas.
- **Recomendación:** `Promise.allSettled` con `p-limit`, retry con backoff, logging por business, persistencia de “última notificación enviada” para reanudar.

#### A-9. Sin headers de seguridad
- `next.config.ts` no define `headers()`. Faltan: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`.
- **Recomendación:** Añadir bloque `async headers()` en `next.config.ts`.

#### A-10. Subdominios no resuelven correctamente para `/p/<username>`
- `src/middleware.ts:46`: reescribe `acme.mivia.es/x` → `/acme/x`. Pero `src/app/p/[username]/page.tsx` espera la ruta `/p/<user>`. Si un portfolio se accede desde `acme.mivia.es/p/acme`, el middleware lo reescribe a `/acme/p/acme` → 404 o ruta colision.
- **Verificar:** Probar `https://juan-dev.mivia.es/p/juan-dev` y `https://juan-dev.mivia.es/`.
- **Recomendación:** Decidir un único formato canónico (subdominio raíz para portfolios) y borrar la ruta `/p/[username]` o redirigirla.

#### A-11. Datos personales (teléfonos, mensajes) logueados en stdout
- `console.log` con `from`, `messageText` y `[DEBUG]` en `src/app/api/whatsapp/update/route.ts:158-163, 169, 192, 442, 458, etc.`. Si los logs van a un agregador (CloudWatch, Loki, Stackdriver), se incumple **RGPD Art. 32** (medidas técnicas).
- **Recomendación:** Pasar a logger estructurado (`pino`) con `redact: ['phone','from','messageText']`. Nivel `debug` desactivado en producción.

#### A-12. `next-auth` instalado pero no integrado
- `package.json:19` lista `next-auth@5.0.0-beta.31` y `@auth/prisma-adapter`, pero no hay configuración (`auth.ts`, `[...nextauth]/route.ts`). 30 MB de dependencias muertas; señal de implementación abandonada.
- **Recomendación:** O configurar NextAuth para reemplazar la cookie hardcodeada (C-2), o desinstalar.

#### A-13. Twilio y Stripe instalados pero sin uso real
- `package.json:26-27`. Ningún `import twilio` o `import stripe` en `src/`. La integración WhatsApp **no usa Twilio** sino la Cloud API de Meta directamente. Stripe está enumerado pero `Subscription` model no se escribe en ningún endpoint.
- **Recomendación:** Desinstalar lo no usado o documentar como “para futuro”. Cada dep aumenta superficie de ataque y bundle.

#### A-14. Sin healthchecks ni resource limits en docker-compose
- `docker-compose.yml:1-49`: ni `healthcheck`, ni `mem_limit`, ni `cpus`. Postgres expone 5432 al host con contraseña débil (`mivia2024secure`). Si la VM tiene IP pública y el firewall no bloquea, BD accesible desde Internet.
- **Recomendación:** Bind `127.0.0.1:5432:5432`, contraseña fuerte, healthcheck (`pg_isready`), mem_limit, ulimits.

---

### 🟡 MEDIOS (mejoras de calidad)

#### M-1. Enum fantasma `'trades'`
- `prisma/schema.prisma:49` → `template String @default("trades")` en `Profile`. Pero los templates reales son `hogar | boutique | estudio | impacto`. La ruta `src/app/[username]/page.tsx:166` hace fallback a `impacto` cuando recibe `trades`. **El default actual nunca matchea un template real**.
- También usado como tema literal `theme: 'trades'` en `src/app/api/whatsapp/update/route.ts:284` y `template: 'trades'` en `src/app/api/profile/create/route.ts:461`.
- **Recomendación:** Cambiar default a `'impacto'`, migrar Profiles existentes (`UPDATE Profile SET template='impacto' WHERE template='trades'`).

#### M-2. Campos JSON sin schema runtime
- `Profile.content`, `Profile.services`, `Portfolio.content`, `Portfolio.socialLinks`, `OnboardingSession.data`. Cualquier shape se acepta. Si Gemini devuelve algo malformado, la app crashea en runtime renderizando el template.
- **Recomendación:** Definir un schema Zod por campo y validar antes de persistir. Idealmente, normalizar a columnas relacionales cuando se acercan a un esquema estable.

#### M-3. Falta de índices en columnas usadas en filtros
- `Business.phone` (búsqueda WhatsApp `contains`), `Business.status` (filtros `findMany`), `ProfileUpdate.businessId + createdAt` (panel admin), `PageView.businessId + createdAt` (analytics weekly).
- **Recomendación:** Añadir `@@index([status])`, `@@index([phone])`, `@@index([businessId, createdAt(sort: Desc)])` en los modelos relevantes. Migración aditiva, sin riesgo.

#### M-4. Soft delete inconsistente
- `notDeleted = { isDeleted: false }` existe en `src/lib/softDelete.ts:34`, pero **no se aplica** en:
  - `src/app/api/admin/page.tsx:7-15` (`count()` sin filtro → admin ve negocios borrados).
  - `src/app/api/whatsapp/update/route.ts:171` y otras (algunas sí, otras no).
- **Recomendación:** Extender `prisma.$extends` con middleware que aplique `isDeleted: false` por defecto, o auditar todos los `findMany`/`findUnique`/`count`.

#### M-5. Tres flujos paralelos de creación con código copiado
- `slugify` está reimplementado tres veces (`profile/create:14`, `portfolio/create:104`, `whatsapp/update:337` inline). Cada uno con variantes ligeramente distintas en cómo trata acentos y longitud.
- **Recomendación:** `src/lib/slugify.ts` único y compartido.

#### M-6. `dangerouslySetInnerHTML` con strings parametrizados
- `src/templates/PortfolioCreative.tsx:239` y `src/templates/PortfolioMinimal.tsx:153` inyectan CSS dinámico. Si `accent` o `name` vienen de input no sanitizado y se inyectan en el CSS, hay riesgo (improbable XSS pero CSS injection sí).
- `src/components/profile/StructuredData.tsx:68` inyecta JSON-LD — el `JSON.stringify` mitiga, pero `</script>` dentro de un string seguiría rompiendo si Gemini lo introduce.
- **Recomendación:** Sanitizar valores antes de interpolar en CSS; usar `replace(/</g, '\\u003c')` en JSON-LD.

#### M-7. Webhook GET con fallback de token débil
- `src/app/api/whatsapp/update/route.ts:112` → `'mivia_webhook_2026'`. Si `WHATSAPP_VERIFY_TOKEN` no se setea, un atacante con este token puede re-suscribir el webhook a su URL.
- **Recomendación:** Lanzar error fatal en lugar de fallback.

#### M-8. Reseñas falsas auto-generadas con disclaimer
- `src/app/api/profile/create/route.ts:144-163`: Gemini genera 3 testimonios ficticios con nota `"Ejemplo ilustrativo — el cliente debe sustituirlo por reseñas reales"`. En España, **LSSI-CE Art. 20** y **RDL 1/2007** prohiben reviews falsas en webs comerciales aunque haya disclaimer. Riesgo legal y reputacional.
- **Recomendación:** Empezar sin testimonios o con `[]` y un placeholder UI claro de “Añade tu primera reseña real desde WhatsApp”.

#### M-9. Sin paginación en el panel admin
- `src/app/admin/page.tsx:12` trae `take: 10`, pero `count()` se ejecuta 4 veces. A escala, agregaciones lentas. La página de detalle (`admin/businesses/[username]/page.tsx:18`) trae 20 updates sin paginar — y `ProfileUpdate.rawMessage` puede ser largo.
- **Recomendación:** Cursors, agregaciones cacheadas o materializadas.

#### M-10. `/api/whatsapp/update` mezcla activación y onboarding sin distinción de tipo
- El nuevo Business creado en `loc:city` arranca con `status: 'trial'`, saltándose el paso de activación. Mientras que el creado via `/api/profile/create` requiere activación. Comportamiento incoherente entre canales.
- **Recomendación:** Documentar la diferencia o unificar el estado inicial.

#### M-11. Sin tests automatizados
- 0 archivos `*.test.ts`, `*.spec.ts`, no Jest/Vitest/Playwright en `package.json`. Sólo `test-webhook.js` que es un curl programado.
- **Rutas críticas que deberían tener E2E:**
  1. Onboarding portfolio web → render `/p/<user>` (con y sin CV).
  2. Onboarding local business → render `/<user>` con plantilla.
  3. WhatsApp activación (`ACTIVA <code>`).
  4. WhatsApp patch de servicio + deshacer.
  5. Admin login → suspender → 403 en subdominio.
- **Recomendación:** Playwright + 1 test E2E por flujo. Mínimo viable: smoke test que arranque docker-compose y golpee los 5 escenarios.

#### M-12. Sin backup automático de Postgres
- `docker-compose.yml`: volumen `mivia_postgres_data`, sin `pg_dump` programado, sin replica. Single point of failure. Carpeta `backups/` en raíz solo contiene templates `.tsx` (no dumps).
- **Recomendación:** Cron diario `pg_dump | gzip | aws s3 cp` con rotación de 30 días.

#### M-13. `Dockerfile` no propaga `NODE_ENV=production` en el builder
- `Dockerfile:6-14`: el build se hace sin `NODE_ENV=production`. Algunos paquetes (e.g. Prisma) usan esta variable para optimizaciones. La etapa final sí define `ENV NODE_ENV=production`.
- **Recomendación:** Añadir `ENV NODE_ENV=production` al builder.

#### M-14. `src/app/onboarding/route.ts` y `src/app/route.ts` leen HTML con `readFileSync` síncrono
- En cada request del landing y onboarding, se lee el HTML del disco. Sin caché en memoria, sin manejo de error si el archivo no existe.
- **Recomendación:** Convertir a páginas React o cachear el contenido al boot.

#### M-15. `setTimeout` para timeouts de Gemini que no aborta la request HTTP
- `src/app/api/portfolio/create/route.ts:61-64`: `Promise.race` con timeout. La promise pierde, pero la request a Gemini sigue corriendo en background hasta completarse → consume cuota.
- `src/lib/gemini-rate-limiter.ts:9-14`: mismo patrón.
- **Recomendación:** Pasar `AbortController.signal` al SDK si lo soporta, o aceptar el coste y documentarlo.

#### M-16. `extractCVWithGemini` (sin rate-limit) usado en el handler WhatsApp
- `src/app/api/whatsapp/update/route.ts:6,536` importa el wrapper *sin* rate limit. Sólo `/api/portfolio/upload-cv` usa `extractCVWithGeminiSafe`. Inconsistencia → posible saturación de Gemini desde WhatsApp.
- **Recomendación:** Usar siempre `extractCVWithGeminiSafe`.

#### M-17. Onboarding wizard expone el flag `legalAccepted` pero el back lo ignora en algunos paths
- `Onboarding.html:1907-1908` exige `legalAccepted` en step 9 (portfolio) y step 6 (local). Pero `/api/portfolio/create` flow A (con `businessId`) **no comprueba `legalAcceptedAt`** (línea 247-262, no se lee del body). Si una integración no-web invoca este flow, salta el consentimiento.
- **Recomendación:** Mover la validación al backend, no al frontend.

---

### 🟢 BAJOS (nice-to-have)

#### B-1. `src/app/[username]/page.tsx` usa 6 `eslint-disable @typescript-eslint/no-explicit-any`
- Apunta a tipos `content as any` no resueltos. Síntoma de A-1.

#### B-2. CHANGELOG.md y `git log` divergen completamente
- `git log` tiene 2 commits, CHANGELOG describe 9+ releases (1.2.9, 1.2.1, FASE 4…). El working tree tiene 30 ficheros modificados sin commitear. **Trabajo sin trazabilidad** — si la VM muere, se pierde el historial real de cambios.
- **Recomendación:** Sprint de “commit por feature” para reconstruir el historial. Habilitar `pre-push` hook que prohíba pushear con tree sucio.

#### B-3. README desactualizado respecto a v1.2.9
- `README.md:13`: dice “6 pasos” de onboarding; el actual tiene hasta 10 (con rama portfolio). No menciona Portfolio, CV upload, ni los 3 nuevos endpoints.

#### B-4. Carpetas duplicadas de backups dentro del repo
- `/backup_templates_original/` y `/backups/templates-20260520-115814/` ocupan espacio y aparecen en `git status`. Versionado correcto debería estar en git, no en filesystem.

#### B-5. Variable `NEXT_PUBLIC_WA_BUSINESS` sólo en `.env`, no en `docker-compose.yml`
- `src/app/onboarding/success/page.tsx:16`. En el contenedor estará `undefined`, se cae al fallback `'622546602'`. Mismo problema con `UNSPLASH_ACCESS_KEY` (no listada en compose).
- **Recomendación:** Sincronizar `docker-compose.yml` con todas las env vars referenciadas.

#### B-6. Hardcoded copy en español por todo el código
- Mensajes WhatsApp, errores API, copy del onboarding. Si en el roadmap hay expansión a otro idioma (CAT, PT, EN), todo este texto deberá rastrearse manualmente.
- **Recomendación:** Diferir i18n hasta validar PMF, pero al menos centralizar strings en `src/lib/i18n/es.ts`.

#### B-7. ESLint config minimal (sólo `next/core-web-vitals` + `next/typescript`)
- No incluye `eslint-plugin-security`, `eslint-plugin-no-secrets`. Faltan reglas que detectarían algunos hallazgos críticos automáticamente.

#### B-8. Comentarios `[DEBUG] ✅ ENTRANDO en handler ...` en producción
- `src/app/api/whatsapp/update/route.ts:391, 405, 414, 423, 432, 442, 456, 471`. Olor a debugging dejado en código productivo.

#### B-9. `tsconfig.json` con `target: ES2017`
- Innecesariamente conservador para Node 20. Compilar a ES2022 reduce polyfills y mejora performance.

#### B-10. CSP attributable en `<style dangerouslySetInnerHTML>`
- Si se añade CSP estricta más adelante (A-9), estos bloques rompen sin `nonce`. Planificar `useId()` + nonces.

#### B-11. Carpeta `public/claude-design/` versionada como “design temporal”
- Suena a directorio de borradores. Si es definitivo, renombrar. Si es temporal, sacarlo del repo.

---

## Análisis por dominio

### 1. Seguridad

Resumen: **el sistema de auth es el punto más débil**. Combinando C-1 + C-2 + C-3, un atacante puede comprometer todo el panel admin en menos de 5 minutos sin conocer ningún credencial.

Detalles adicionales:

- `middleware.ts` valida el subdominio (3-30 chars, `[a-z0-9-]`) → buena defensa contra path traversal y XSS-via-subdomain. ✅
- Magic bytes PDF (`%PDF-`) verificados en `upload-cv:82-87`. ✅
- DOCX no tiene comprobación de magic bytes (DOCX = ZIP `PK\x03\x04`). Atacante puede subir un ZIP malicioso renombrado a `.docx` (riesgo bajo: mammoth fallaría, pero queda en `/tmp`).
- No hay verificación antivirus de los uploads (riesgo bajo si los `/tmp` no se sirven, pero crece si en el futuro se almacenan en S3/CDN).
- `prisma.$executeRaw` en `whatsapp/update:489` usa parametrización (`${business.profile.id}` como template literal de tag → safe), pero el patrón es innecesario; sustituible por `prisma.profile.update`.
- `softDelete.ts` cumple RGPD (seudonimización del teléfono). Bien planteado.
- Endpoint `favicon/[username]` interpola `colors.primary` (controlado por Gemini) en SVG: si Gemini devolviera `"><script>...`, el SVG inline tendría XSS. **Probabilidad baja** (Gemini con responseSchema enum sólo emite hex válido), pero defender con regex `/^#[0-9a-fA-F]{6}$/`.

### 2. Integridad de datos

- Schema sin `@@index` salvo los unique automáticos → ver M-3.
- Sin `onDelete: Cascade` ni `onDelete: SetNull` en las relaciones → cualquier borrado físico falla. Compatible con la política de soft-delete, pero impide cleanup operacional (e.g. eliminar duplicados de C-8 manualmente exige scripts multitabla).
- Modelos sin `createdAt/updatedAt`: `Profile`, `Subscription` carecen de timestamps. Para un SaaS facturable, no saber cuándo se creó/actualizó una `Subscription` es problemático.
- Enum `BusinessType` tiene 2 valores (`LOCAL_BUSINESS`, `PORTFOLIO`). El prompt de Gemini en `profile/create:32-35` define un enum paralelo (`local | mobile_service | portfolio | digital`) — son ejes diferentes (tipo de cuenta vs sub-tipo dentro de LOCAL_BUSINESS). Documentar.
- `OnboardingSession.step` es string libre — sustituible por enum.
- Sin backups automáticos (M-12). Single point of failure crítico.

### 3. Consistencia de código

- 2 patrones distintos de Prisma (`include` ramificado vs queries directas).
- 5 implementaciones de Gemini (A-3).
- 3 `slugify` distintos (M-5).
- Imports mezclados: `@/lib/prisma`, `../lib/prisma`. La mayoría usa `@/` pero algunos archivos (`p/[username]/page.tsx`) usan rutas absolutas con extensión, otros sin. Forzar un único estilo con `eslint-plugin-import`.
- Anotaciones `eslint-disable` repartidas (40+) — síntoma de tipos `any` no resueltos.
- Mensajes WhatsApp del bot copiados literalmente entre el handler `loc:city` y `port:template` (`Tu página/portfolio está lista` + lista de acciones).

### 4. Performance

- Sin `select` (A-6): cada query trae blobs JSON de varios KB.
- Caché aplicada parcialmente (A-4) y nunca invalidada (A-5).
- Imágenes sin `next/image` (A-7).
- N+1 potencial en `weekly-notifications`: `getWeeklyVisits` se llama dentro del bucle, cada uno con `count` propio. Para 1.000 businesses son 1.000 round-trips.
- Templates de **700-950 líneas** cada uno (Hogar, Estudio, Boutique, Impacto). Aunque están lazy-loaded (`dynamic`), el primer paint los descarga completos. Considerar splitting interno por sección.
- Onboarding.html: **2.248 líneas**, un único bundle React inline. Carga ~150KB de JS para mostrar 10 steps.
- Gemini sin abort real (M-15): cada timeout deja una request “fantasma” consumiendo cuota.

### 5. UX

- Wizard onboarding: la lógica de `back/next` tiene saltos `step==0→7→8→9→10` que dependen de `isPortfolio`. Probabilidad de bug si se añade un step (testear con QA antes de mergear).
- Mensajes de error de los endpoints son **genéricos** (“Error interno del servidor”). El frontend muestra `alert("Error al crear: " + apiRes?.error || "inténtalo de nuevo")` — el usuario no sabe si es validación, red o BD.
- WhatsApp bot: muchos handlers responden (✅ bien), pero la rama portfolio cuando Gemini falla devuelve mensajes genéricos. El fallback en `applyPortfolioPatchWithGemini:1296-1302` cubre parse error pero no errores de red Gemini → si Gemini está caído, el bot se cuelga 30s (sin timeout) y el usuario no recibe respuesta. **Falta timeout en `applyPortfolioPatchWithGemini` y `updateContentWithGemini`**.
- Estado “portfolio creado pero CV upload falló” es silencioso (`Onboarding.html:2080-2086` log warn pero no muestra al usuario). El cliente cree que todo va bien pero su portfolio queda vacío.
- No hay empty state visual en `/p/<user>` cuando un portfolio recién creado aún no tiene proyectos.
- Subscription model existe pero sin UI ni endpoint → no se puede activar un plan de pago realmente; el SaaS no cobra todavía. **Verificar** con el dueño si esto es intencional.

### 6. Infraestructura y deploy

- `docker-compose.yml`: cubierto (A-14, M-12, B-5).
- `next.config.ts`: sin headers de seguridad (A-9), sin `compress`, sin `poweredByHeader: false`.
- Dockerfile sin multi-stage cache de `npm ci` óptimo (no copia `package-lock.json` antes que el código). Build lento.
- Cron `/api/cron/weekly-notifications` — auth con `Bearer ${CRON_SECRET}` ✅ — pero sin trigger configurado en el repo (no hay `vercel.json` ni systemd unit ni cron unix). ¿Cómo se invoca? **Verificar.**
- Sin rotación de logs (`docker logs` crece indefinidamente sin `logging.options.max-size`).
- `prisma generate` corre en build con `DATABASE_URL=build@build` → ok para offline, pero `next build` también ejecuta páginas estáticas; si alguna ejecuta queries en build-time fallaría silenciosamente.

### 7. Testing

Cobertura estimada: **0%**. Riesgo alto en un SaaS de pago.

5 rutas críticas que deberían tener E2E (Playwright recomendado):

1. **Wizard local business completo** → `/api/profile/create` → render `/<user>` con template correcto.
2. **Wizard portfolio con CV** → `/api/portfolio/create` → `/api/portfolio/upload-cv` → render `/p/<user>` con skills extraídas.
3. **Activación WhatsApp** → POST `/api/whatsapp/update` con `ACTIVA XXXX` → `status: 'trial'`.
4. **Patch WhatsApp + deshacer** → POST con `cambia teléfono` → POST con `deshacer` → contenido revierte.
5. **Admin panic button** → login → suspend `<user>` → `GET /<user>` devuelve 403 / página suspendida.

Mínimo para entrar a producción: tests 1 y 3.

Sin `npm test` ni `npm run smoke` en `package.json`. Sólo `dev`, `build`, `start`, `lint`. Añadir `test:e2e`.

### 8. Documentación

- `CHANGELOG.md` (28KB) describe 9 releases. `git log` tiene 2 commits.
- `CONTEXT_NEXT_SESSION.md`, `CONTEXT_SECURITY_FIXES.md`, `SESSION_SUMMARY_20260520.md`, `NEXT_CHAT_BRIEFING.md`: 4 ficheros de “contexto para futuras sesiones de IA” en raíz del repo. Útil para humanos pero ruido para nuevos colaboradores y para `npm publish`/Docker context.
- README desactualizado (B-3).
- No hay `.env.example`. Cualquiera que clone necesita adivinar qué variables existen.
- Endpoints **no documentados** en ningún OpenAPI / Postman / Markdown. La única referencia es leer el code.
- Handlers WhatsApp (40+ ramas distintas) no están documentados — sólo en código. Un nuevo dev tarda horas en mapearlos.
- **Recomendación urgente:** `docs/api.md` con tabla `endpoint | method | auth | body | response`. `docs/whatsapp-commands.md` con tabla `comando | regex | acción | respuesta`.

---

## Roadmap de remediación sugerido

### Sprint 1 — Hardening de producción (1 semana)
**Bloquean facturación real.** Sin esto, no recomiendo cobrar 9 €/mes a clientes reales.

1. **C-1, C-2, C-3** — proteger admin: middleware sobre `/api/admin/*`, JWT firmado, contraseña obligatoria con hash.
2. **C-4** — verificar firma `x-hub-signature-256` en webhook WhatsApp.
3. **C-6** — rotar todos los tokens en `.env` (Twilio, WhatsApp, Gemini, Unsplash), crear `.env.example` y migrar a gestor de secretos.
4. **C-9** — validar `legalAcceptedAt` obligatorio en backend.
5. **A-14** — bind Postgres a `127.0.0.1`, healthchecks, contraseña fuerte.

Crear `.env.example` y un `SECURITY.md` documentando los procedimientos.

### Sprint 2 — Robustez y escalabilidad (2 semanas)

6. **C-5** — rate limit + captcha en endpoints públicos de creación.
7. **C-7, C-8** — race conditions en username y duplicados de Business.
8. **A-1** — instalar Zod + schemas compartidos para los 11 endpoints.
9. **A-2** — refactor del handler WhatsApp en módulos.
10. **A-3** — centralizar cliente Gemini + prompts.
11. **A-4, A-5** — caché unificada + invalidación tras updates.
12. **A-9** — security headers.
13. **A-11** — logger redactado.
14. **M-11** — Playwright + 2 tests E2E críticos (flow profile + flow activación).
15. **M-12** — backup automático Postgres.

### Sprint 3 — Calidad y mantenibilidad (1 mes)

16. **A-6** — `select` en queries críticas.
17. **A-7** — migración a `next/image`.
18. **A-8** — cron resiliente con paginación y retry.
19. **A-10** — clarificar ruteo de subdominios + `/p/<user>`.
20. **M-1** — eliminar `'trades'` ghost.
21. **M-2** — Zod schemas para campos JSON.
22. **M-3** — índices Prisma.
23. **M-4** — middleware `softDelete` global.
24. **M-8** — quitar reseñas falsas.
25. **M-9** — paginación admin.
26. **B-2, B-3** — sincronizar CHANGELOG/git/README.
27. **Resto de B-***.

---

## Métricas

| Métrica | Valor |
|---|---|
| LOC `src/app/api/**` | ~2.395 |
| LOC `src/templates/**` | ~4.901 (5 templates, 700-950 cada uno) |
| LOC `src/lib/**` | ~370 |
| Endpoints API totales | 11 |
| Endpoints sin auth efectiva | **6/11** |
| Endpoints sin validación Zod | **11/11** |
| Endpoints sin rate limit | **11/11** |
| Queries Prisma totales (find/count) | 19 |
| Queries Prisma sin `select` | **18/19** |
| Queries Prisma sin filtro `isDeleted` | ~5 |
| Handlers WhatsApp identificables | ~22 ramas en el switch monolítico |
| Handlers WhatsApp con try/catch propio | 2 (el outer y el de PDF) |
| `console.*` en `src/` | 66 |
| Migraciones aplicadas | 9 |
| Migraciones con drift potencial | 0 (schema coincide con migraciones) |
| Tests automatizados | 0 |
| Cobertura estimada | 0% |
| Cobertura de tests E2E recomendada para v1.3 | ≥ 5 flujos críticos |
| Commits en `git log` | 2 |
| Features documentadas en CHANGELOG sin commit | ~30 |
| Env vars referenciadas en código | 11 |
| Env vars en `docker-compose.yml` | 12 (incluye `DATABASE_URL` interno) |
| Env vars **faltantes en docker-compose** | `UNSPLASH_ACCESS_KEY`, `NEXT_PUBLIC_WA_BUSINESS`, `ADMIN_PASSWORD` |
| Dependencias “muertas” (instaladas, no usadas) | `next-auth`, `@auth/prisma-adapter`, `stripe`, `twilio` |

---

## Notas finales

El MVP **funciona** y los flujos felices están bien resueltos (Gemini estructurado, plantillas variadas, subdomain routing). El núcleo de la idea de negocio se aguanta.

**Pero la base de seguridad y operación es la de un side-project, no la de un SaaS B2B que cobra suscripción.** Los 9 críticos son resolubles en un sprint y deberían ser condición previa a la primera factura real. Los altos son la diferencia entre “SaaS que aguanta 50 clientes” y “SaaS que aguanta 5.000”.

Recomendación priorizada en una frase: **antes de hacer una sola conversión de pago, ejecutar Sprint 1 completo (5 hallazgos críticos) — 1 semana, ~25h de trabajo.**

— Fin del informe —
