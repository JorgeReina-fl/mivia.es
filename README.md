# mivia.es

**Generador automático de páginas web profesionales para autónomos y micropymes españoles.**

Plataforma SaaS que permite a cualquier profesional (fontaneros, peluqueros, electricistas) tener su web profesional en 2 minutos, sin conocimientos técnicos. Todo gestionado vía WhatsApp.

---

## 🚀 Características

### Para el usuario final
- ✅ Onboarding guiado en 6 pasos
- ✅ Generación automática con IA (Gemini 2.0 Flash)
- ✅ 4 vibes visuales (moderno, profesional, cercano, premium)
- ✅ Activación vía código de WhatsApp
- ✅ Actualización de contenido por WhatsApp con lenguaje natural
- ✅ Sistema de deshacer cambios
- ✅ Subdominio personalizado: `{username}.mivia.es`

### Tecnología
- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Backend:** Next.js API Routes + Prisma ORM
- **Base de datos:** PostgreSQL 16
- **IA:** Google Gemini 2.0 Flash (generación de contenido estructurado)
- **Infraestructura:** Docker + Nginx + Oracle Cloud VM
- **SSL:** Wildcard cert para `*.mivia.es`
- **Integración:** WhatsApp Business Cloud API

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     mivia.es (Landing)                      │
│                  Legal: LSSI + RGPD + Cookies               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Onboarding (6 pasos + vibe selector)           │
│   1. Nombre negocio  2. Ciudad  3. Servicios                │
│   4. Propuesta valor 5. Teléfono 6. Confirmación            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  POST /api/profile/create                   │
│  • Detecta businessType (local/mobile_service/portfolio)    │
│  • Genera activationCode aleatorio (4 dígitos)              │
│  • Crea Business (status: pending) + Profile en PostgreSQL  │
│  • Responde: {username, activationCode}                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         Pantalla de éxito con código ACTIVA XXXX            │
│   Botón WhatsApp: wa.me/865782210?text=ACTIVA%20XXXX        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         Webhook WhatsApp: /api/whatsapp/update              │
│                                                             │
│  Mensajes del usuario → Lógica de procesamiento:           │
│                                                             │
│  1. "ACTIVA XXXX"                                           │
│     → Busca Business por activationCode                     │
│     → Cambia status: pending → trial                        │
│     → Borra activationCode                                  │
│     → Web publicada en {username}.mivia.es                  │
│                                                             │
│  2. "hola" / "menu" / "ayuda"                               │
│     → Envía menú interactivo con botones:                   │
│       • 📝 Editar información                               │
│       • ➕ Añadir servicio                                  │
│       • ⏪ Deshacer cambio                                  │
│                                                             │
│  3. "edit_info" → Espera mensaje de actualización           │
│                                                             │
│  4. "undo"                                                  │
│     → Restaura Profile.backupContent → Profile.content      │
│     → Borra backup                                          │
│                                                             │
│  5. Cualquier otro texto                                    │
│     → Busca Business por teléfono (últimos 9 dígitos)       │
│     → Backup automático: content → backupContent            │
│     → Llama a Gemini con prompt estructurado:               │
│       * Campos permitidos (whitelist): hero.subtitle,       │
│         hero.phone, services, contact.hours, etc.           │
│       * Campos prohibidos: businessType, theme, colors      │
│     → Valida que no se tocaron campos críticos              │
│     → Guarda JSON actualizado en Profile.content            │
│     → Registra en ProfileUpdate para auditoría              │
│     → Envía confirmación con enlace a la web                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│          Web del cliente: {username}.mivia.es               │
│   • Renderiza desde Profile.content (JSON estructurado)     │
│   • Secciones condicionales según businessType              │
│   • Mapa (local), Zona de cobertura (mobile_service),       │
│     Portfolio (portfolio)                                   │
│   • SEO optimizado con metadata dinámica                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Modelo de datos

```prisma
model Business {
  id             String   @id @default(cuid())
  username       String   @unique
  phone          String
  status         String   @default("pending")  // pending, trial, active, suspended
  activationCode String?
  profile        Profile?
  createdAt      DateTime @default(now())
}

model Profile {
  id            String          @id @default(cuid())
  businessId    String          @unique
  business      Business        @relation(fields: [businessId], references: [id], onDelete: Cascade)
  content       Json            // JSON estructurado de la web
  backupContent Json?           // Backup del contenido anterior
  updates       ProfileUpdate[]
  createdAt     DateTime        @default(now())
}

model ProfileUpdate {
  id         String   @id @default(cuid())
  profileId  String
  profile    Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  rawMessage String
  processed  Boolean  @default(false)
  createdAt  DateTime @default(now())
}
```

---

## 🔧 Variables de entorno

Crear archivo `.env` en la raíz:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mivia"

# Next.js
NEXT_PUBLIC_BASE_URL="https://mivia.es"
NEXT_PUBLIC_WA_BUSINESS="865782210"

# Google Gemini
GEMINI_API_KEY="your_gemini_api_key_here"

# WhatsApp Business API (opcional para testing sin tokens)
WHATSAPP_ACCESS_TOKEN="your_meta_access_token"
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
```

---

## 🚀 Deployment

### Requisitos
- Ubuntu 24.04 LTS
- Docker + Docker Compose
- Dominio configurado con wildcard DNS: `*.mivia.es → IP del servidor`
- SSL wildcard cert para `*.mivia.es`

### Instalación

1. **Clonar repositorio:**
```bash
git clone https://github.com/JorgeReina-fl/mivia.es.git
cd mivia.es
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Levantar servicios con Docker:**
```bash
docker compose up -d
```

4. **Ejecutar migraciones de Prisma:**
```bash
docker compose exec app npx prisma migrate deploy
```

5. **Verificar que funciona:**
```bash
curl https://mivia.es
```

### Estructura de Docker

```yaml
services:
  app:          # Next.js (puerto 3000)
  postgres-db:  # PostgreSQL 16 (puerto 5432, solo interno)
  nginx:        # Reverse proxy con SSL (puertos 80, 443)
```

---

## 🔒 Seguridad

- ✅ Validación de código de activación (previene hijacking de números)
- ✅ Whitelist de campos modificables vía WhatsApp
- ✅ Campos críticos protegidos (businessType, theme, colors)
- ✅ Rate limiting en Meta para verificación de números
- ✅ SSL wildcard con certificados válidos
- ✅ Base de datos solo accesible dentro de Docker

---

## 📝 Flujo de usuario

1. Usuario entra en **mivia.es**
2. Completa **onboarding** (6 pasos)
3. Recibe **código de activación** en pantalla
4. Envía **"ACTIVA XXXX"** por WhatsApp al 865782210
5. Web se publica en **{username}.mivia.es**
6. Usuario puede actualizar enviando mensajes como:
   - "Mi nuevo horario es L-V 9-20h"
   - "Cambia el teléfono al 600123456"
   - "Añade servicio: Instalación de aire acondicionado"
7. Bot confirma cada cambio con enlace a la web actualizada
8. Si se equivoca, puede enviar **"undo"** para deshacer

---

## 🎨 Branding

Logo: M formada por dos pilares geométricos convergentes + rayo central ascendente
Colores: Azul profundo (#0c4a6e) + Azul cielo (#0ea5e9)
Tipografía: Poppins (Semibold para "mivia", Light para ".es")

---

## 🛠️ Comandos útiles

```bash
# Ver logs del webhook
docker logs mivia-app --tail 50 | grep -i whatsapp

# Acceder a PostgreSQL
docker exec -it mivia-postgres psql -U mivia -d mivia

# Rebuild tras cambios en código
docker compose up -d --build app

# Ver últimos negocios creados
docker exec mivia-postgres psql -U mivia -d mivia -c \
  'SELECT username, status, "createdAt" FROM "Business" ORDER BY "createdAt" DESC LIMIT 5;'
```

---

## 📈 Roadmap

- [x] Sistema de activación con código
- [x] Menú interactivo de WhatsApp
- [x] Sistema de deshacer cambios
- [ ] Verificación de WhatsApp Business oficial
- [ ] Admin panel para gestión de usuarios
- [ ] Stripe SEPA para cobros automáticos (€9/mes)
- [ ] Dashboard de métricas
- [ ] Sistema de templates adicionales

---

## 👤 Autor

**Jorge Reina**
- GitHub: [@JorgeReina-fl](https://github.com/JorgeReina-fl)
- Web: [jorgereina.com](https://jorgereina.com)

---

## 📄 Licencia

Propietario - Todos los derechos reservados
