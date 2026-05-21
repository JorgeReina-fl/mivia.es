import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai'
import { checkRateLimit, getClientIp, rateLimitHeaders, initCleanup } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// ── Gemini setup ────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const portfolioSeedSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    bio: {
      type: SchemaType.STRING,
      description: 'Párrafo de 2-3 frases en primera persona. Tono profesional pero cercano.',
    },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Entre 6 y 8 habilidades clave para la profesión.',
    },
    tagline: {
      type: SchemaType.STRING,
      description: 'Frase corta de impacto, máximo 10 palabras.',
    },
  },
  required: ['bio', 'skills', 'tagline'],
}

interface PortfolioSeed {
  bio: string
  skills: string[]
  tagline: string
}

async function generatePortfolioSeed(
  fullName: string,
  profession: string,
): Promise<PortfolioSeed | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: portfolioSeedSchema,
        temperature: 0.3,
        maxOutputTokens: 512,
      },
    })

    const prompt = `Dado un profesional llamado ${fullName} que trabaja como ${profession}, genera en español:
- bio: párrafo de 2-3 frases en primera persona, tono profesional pero cercano, que resuma su especialidad y propuesta de valor.
- skills: array de 6-8 habilidades clave para la profesión "${profession}".
- tagline: frase corta de impacto (máximo 10 palabras) para encabezar su portfolio.

Responde únicamente con el JSON estructurado.`

    const timeoutMs = 5000
    const geminiPromise = model.generateContent(prompt)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Seed generation timeout')), timeoutMs)
    )
    const result = await Promise.race([geminiPromise, timeoutPromise])
    return JSON.parse(result.response.text()) as PortfolioSeed
  } catch (err) {
    // Non-fatal — portfolio is created with empty defaults if Gemini fails
    console.warn('[portfolio/create] Gemini seed generation failed (non-fatal):', err)
    return null
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
interface ProjectInput {
  title: string
  description: string
  tags?: string[]
  url?: string
  year?: number
}

interface CreatePortfolioBody {
  businessId?: string
  fullName: string
  title?: string       // legacy alias for profession
  profession?: string
  bio?: string
  skills?: string[]
  experience?: unknown[]
  projects?: ProjectInput[]
  location?: string
  email?: string
  website?: string
  socialLinks?: {
    linkedin?: string
    github?: string
    instagram?: string
    twitter?: string
  }
  template?: string
  legalAcceptedAt?: string
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limiting: 5 requests/hora por IP
  initCleanup()
  const ip = getClientIp(req)
  const rl = checkRateLimit(ip, 5, 60 * 60 * 1000)

  if (!rl.allowed) {
    console.warn(`[Rate Limit] IP ${ip} excedió límite en /api/portfolio/create`)
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  try {
    const body: CreatePortfolioBody = await req.json()
    const {
      businessId,
      fullName,
      title,
      profession,
      bio = '',
      skills = [],
      experience = [],
      projects = [],
      location,
      email,
      website,
      socialLinks = {},
      template = 'modern',
      legalAcceptedAt,
    } = body

    const resolvedProfession = profession || title || ''

    if (!fullName || !resolvedProfession) {
      return NextResponse.json(
        { error: 'Campos obligatorios: fullName, profession' },
        { status: 400 }
      )
    }

    // ── Flow A: existing business ──────────────────────────────────────────
    if (businessId) {
      const business = await prisma.business.findUnique({ where: { id: businessId } })
      if (!business || business.isDeleted) {
        return NextResponse.json({ error: 'Business no encontrado' }, { status: 404 })
      }
      const existing = await prisma.portfolio.findUnique({ where: { businessId } })
      if (existing) {
        return NextResponse.json(
          { error: 'Este business ya tiene un portfolio. Usa el endpoint de actualización.' },
          { status: 409 }
        )
      }

      const contentRaw = {
        headline: resolvedProfession,
        summary: bio,
        experience,
        projects: projects.map((p, i) => ({
          id: `proj-${i}`,
          title: p.title,
          description: p.description,
          tags: p.tags ?? [],
          url: p.url,
          year: p.year,
        })),
      }
      const content = JSON.parse(JSON.stringify(contentRaw)) as Prisma.InputJsonValue

      const portfolio = await prisma.portfolio.create({
        data: {
          businessId,
          name: fullName,
          profession: resolvedProfession,
          bio,
          location: location ?? null,
          email: email ?? null,
          website: website ?? null,
          socialLinks,
          skills,
          content,
          template,
        },
      })
      await prisma.business.update({
        where: { id: businessId },
        data: { type: 'PORTFOLIO' },
      })

      return NextResponse.json({
        success: true,
        portfolioId: portfolio.id,
        businessId,
        url: `${business.username}.mivia.es`,
      })
    }

    // ── Flow B: web wizard — create Business + Portfolio atomically ────────
    // Generate bio, skills and tagline with Gemini (non-fatal if it fails)
    const seed = await generatePortfolioSeed(fullName, resolvedProfession)

    const resolvedBio    = seed?.bio    ?? bio
    const resolvedSkills = seed?.skills ?? skills

    const contentRaw = {
      headline: resolvedProfession,
      summary:  resolvedBio,
      experience,
      projects: projects.map((p, i) => ({
        id: `proj-${i}`,
        title: p.title,
        description: p.description,
        tags: p.tags ?? [],
        url: p.url,
        year: p.year,
      })),
      ...(seed?.tagline ? { hero: { tagline: seed.tagline } } : {}),
    }
    const content = JSON.parse(JSON.stringify(contentRaw)) as Prisma.InputJsonValue

    const base = slugify(fullName)
    const suffix = Date.now().toString().slice(-4)
    let username = `${base}-${suffix}`

    // Ensure uniqueness
    const taken = await prisma.business.findUnique({ where: { username } })
    if (taken) username = `${base}-${Date.now().toString().slice(-6)}`

    const activationCode = randomCode()
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const business = await prisma.business.create({
      data: {
        username,
        phone: '',
        type: 'PORTFOLIO',
        status: 'pending',
        activationCode,
        trialEndsAt,
        legalAcceptedAt: legalAcceptedAt ? new Date(legalAcceptedAt) : null,
        portfolio: {
          create: {
            name: fullName,
            profession: resolvedProfession,
            bio: resolvedBio,
            location: location ?? null,
            email: email ?? null,
            website: website ?? null,
            socialLinks,
            skills: resolvedSkills,
            content,
            template,
          },
        },
      },
    })

    const portfolio = await prisma.portfolio.findUnique({ where: { businessId: business.id } })

    return NextResponse.json({
      success: true,
      portfolioId: portfolio?.id ?? null,
      businessId: business.id,
      username,
      activationCode,
      url: `${username}.mivia.es`,
    })
  } catch (error) {
    console.error('[portfolio/create]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
