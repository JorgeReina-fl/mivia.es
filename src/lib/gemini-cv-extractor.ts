import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface CVExperience {
  company: string
  role: string
  period: string
  description: string
}

export interface CVEducation {
  institution: string
  degree: string
  year: string
}

export interface CVProject {
  title: string
  description: string
  tags?: string[]
  url?: string
  year?: string
}

export interface CVExtractedData {
  fullName: string
  title: string
  tagline: string
  bio: string
  location: string
  email: string | null
  phone: string | null
  website: string | null
  linkedin: string | null
  github: string | null
  skills: string[]
  experience: CVExperience[]
  education: CVEducation[]
  projects: CVProject[]
}

const cvSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    fullName: { type: SchemaType.STRING },
    title: { type: SchemaType.STRING },
    tagline: { type: SchemaType.STRING },
    bio: { type: SchemaType.STRING },
    location: { type: SchemaType.STRING },
    email: { type: SchemaType.STRING },
    phone: { type: SchemaType.STRING },
    website: { type: SchemaType.STRING },
    linkedin: { type: SchemaType.STRING },
    github: { type: SchemaType.STRING },
    skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          company: { type: SchemaType.STRING },
          role: { type: SchemaType.STRING },
          period: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
        },
        required: ['company', 'role', 'period', 'description'],
      },
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          institution: { type: SchemaType.STRING },
          degree: { type: SchemaType.STRING },
          year: { type: SchemaType.STRING },
        },
        required: ['institution', 'degree', 'year'],
      },
    },
    projects: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          url: { type: SchemaType.STRING },
          year: { type: SchemaType.STRING },
        },
        required: ['title', 'description'],
      },
    },
  },
  required: ['fullName', 'title', 'tagline', 'bio', 'location', 'skills', 'experience', 'education', 'projects'],
}

export async function extractCVWithGemini(cvText: string): Promise<CVExtractedData> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: cvSchema,
      temperature: 0.1,
      maxOutputTokens: 4096,
    },
  })

  const prompt = `Analiza este CV y extrae la información estructurada en JSON.

INSTRUCCIONES:

- fullName: nombre completo de la persona tal como aparece en el CV (ej: "Jorge Luis Reina Guaman"). Usa siempre el nombre completo, no abrevies.
- title: rol profesional principal. Si el CV menciona múltiples roles o títulos, elige el más senior o más reciente. Ej: "Desarrollador Full Stack Senior", "Diseñadora UX/UI".
- tagline: frase profesional breve e impactante de máximo 10 palabras que capture la propuesta de valor única de la persona. Ej: "Transformo ideas en productos digitales escalables y rentables".
- bio: párrafo rico de 4-5 frases en primera persona que resuma quién es, su especialidad, tecnologías clave, tipo de proyectos en los que ha trabajado y propuesta de valor diferencial. Debe ser convincente para un cliente potencial.
- location: ciudad o región donde reside (ej: "Madrid", "Barcelona, España"). Cadena vacía si no aparece.
- email: email de contacto o null si no aparece.
- phone: teléfono de contacto o null si no aparece.
- website: URL de portfolio o web personal o null si no aparece.
- linkedin: URL o usuario de LinkedIn o null si no aparece.
- github: URL o usuario de GitHub o null si no aparece.
- skills: array de todas las habilidades técnicas y blandas relevantes (sin límite, incluye todas las mencionadas).
- experience: array de experiencias laborales ordenadas de más reciente a más antigua. Incluye freelance, proyectos para clientes y empleos.
- education: array de formación académica, cursos relevantes y certificaciones.
- projects: IMPORTANTE — extrae TODOS los proyectos mencionados en el CV, especialmente en secciones como "Proyectos destacados", "Portfolio", "Proyectos personales" o similares. Cada proyecto debe tener title y description. Incluye en tags las tecnologías usadas. Incluye url y year si están presentes. No omitas ningún proyecto.

Si algún campo no está presente en el CV, usa cadena vacía, array vacío o null según corresponda.

CV:
${cvText}`

  const result = await model.generateContent(prompt)
  return JSON.parse(result.response.text()) as CVExtractedData
}
