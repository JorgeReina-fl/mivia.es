import pLimit from 'p-limit'
import { extractCVWithGemini as originalExtract } from './gemini-cv-extractor'

// Max 5 parallel Gemini calls
const limit = pLimit(5)

export async function extractCVWithGeminiSafe(text: string) {
  return limit(async () => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 8000)
    )
    const extraction = originalExtract(text)
    return Promise.race([extraction, timeout])
  })
}
