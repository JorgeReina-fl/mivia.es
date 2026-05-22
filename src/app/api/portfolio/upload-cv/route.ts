import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { extractCVWithGeminiSafe } from '@/lib/gemini-rate-limiter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function cleanNullStrings(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== 'null' && v !== '')
  )
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

async function extractTextFromPDF(filePath: string): Promise<string> {
  // pdf2json is pure-JS — no native canvas dependency, works in Alpine/Node 20
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFParser = require('pdf2json')
  return new Promise((resolve, reject) => {
    const parser = new PDFParser()
    parser.on('pdfParser_dataReady', (data: { Pages: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> }) => {
      const text = data.Pages
        .map((pg) => pg.Texts.map((t) => decodeURIComponent(t.R.map((r) => r.T).join(''))).join(' '))
        .join('\n')
      resolve(text)
    })
    parser.on('pdfParser_dataError', (err: { parserError: Error }) => reject(err.parserError))
    parser.loadPDF(filePath)
  })
}

async function extractTextFromDOCX(filePath: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth: { extractRawText: (o: { path: string }) => Promise<{ value: string }> } = require('mammoth')
  const result = await mammoth.extractRawText({ path: filePath })
  return result.value
}

export async function POST(req: NextRequest) {
  let tmpPath: string | null = null

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const businessId = formData.get('businessId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Se requiere un archivo (file)' }, { status: 400 })
    }
    if (!businessId) {
      return NextResponse.json({ error: 'Se requiere businessId' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no soportado. Usa PDF o DOCX.' },
        { status: 415 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Archivo demasiado grande. Máximo 10 MB.' },
        { status: 413 }
      )
    }

    // Read buffer early for magic bytes check (avoids DB call on invalid files)
    const buffer = Buffer.from(await file.arrayBuffer())

    // Magic bytes check for PDF
    if (file.type === 'application/pdf') {
      const magic = buffer.slice(0, 5).toString('ascii')
      if (magic !== '%PDF-') {
        return NextResponse.json(
          { error: 'El archivo no es un PDF válido.' },
          { status: 415 }
        )
      }
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } })
    if (!business || business.isDeleted) {
      return NextResponse.json({ error: 'Business no encontrado' }, { status: 404 })
    }

    // Check if a Portfolio already exists for this Business (wizard flow creates one first)
    const existingPortfolio = await prisma.portfolio.findUnique({ where: { businessId } })

    // Save to /tmp with sanitized filename
    const safeBusinessId = businessId.replace(/[^a-zA-Z0-9]/g, '')
    const ext = file.type === 'application/pdf' ? 'pdf' : 'docx'
    tmpPath = join('/tmp', `cv-${safeBusinessId}-${Date.now()}.${ext}`)
    await writeFile(tmpPath, buffer)

    // Extract text
    let cvText: string
    if (file.type === 'application/pdf') {
      cvText = await extractTextFromPDF(tmpPath)
    } else {
      cvText = await extractTextFromDOCX(tmpPath)
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: 'No se pudo extraer texto del archivo. Asegúrate de que el CV no es una imagen escaneada.' },
        { status: 422 }
      )
    }

    // Extract structured data with Gemini (rate-limited, timeout 8s)
    const extractedData = await extractCVWithGeminiSafe(cvText)

    const content = {
      headline: extractedData.title,
      summary: extractedData.bio,
      experience: extractedData.experience,
      education: extractedData.education,
      projects: extractedData.projects ?? [],
      ...(extractedData.tagline ? { hero: { tagline: extractedData.tagline } } : {}),
    }
    // JSON round-trip strips typed interfaces → plain object compatible with Prisma InputJsonValue
    const contentJson = JSON.parse(JSON.stringify(content)) as Prisma.InputJsonValue

    // Build optional scalar fields — only include if present in extracted data
    const optionalFields = {
      ...(extractedData.location ? { location: extractedData.location } : {}),
      ...(extractedData.email    ? { email: extractedData.email }       : {}),
      ...(extractedData.website  ? { website: extractedData.website }   : {}),
      ...(() => {
        const links = cleanNullStrings({
          ...(extractedData.linkedin ? { linkedin: extractedData.linkedin } : {}),
          ...(extractedData.github   ? { github: extractedData.github }     : {}),
        })
        return Object.keys(links).length > 0 ? { socialLinks: links } : {}
      })(),
    }

    let portfolio

    if (existingPortfolio) {
      // ── Wizard flow: Business + empty Portfolio already created by /api/portfolio/create ──
      // Update only the AI-extracted fields; preserve what the user set in the wizard
      // (name, profession, template).
      portfolio = await prisma.portfolio.update({
        where: { businessId },
        data: {
          bio: extractedData.bio,
          skills: extractedData.skills,
          content: contentJson,
          ...optionalFields,
        },
      })
    } else {
      // ── Standalone CV upload: no Portfolio yet — create from scratch ──
      portfolio = await prisma.portfolio.create({
        data: {
          businessId,
          name: extractedData.fullName,
          profession: extractedData.title,
          bio: extractedData.bio,
          skills: extractedData.skills,
          content: contentJson,
          template: 'modern',
          ...optionalFields,
        },
      })

      await prisma.business.update({
        where: { id: businessId },
        data: { type: 'PORTFOLIO' },
      })
    }

    return NextResponse.json({
      success: true,
      portfolioId: portfolio.id,
      username: business.username,
      extractedData,
      url: `${business.username}.mivia.es`,
    })
  } catch (error) {
    console.error('[portfolio/upload-cv]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  } finally {
    if (tmpPath) {
      await unlink(tmpPath).catch(() => null)
    }
  }
}
