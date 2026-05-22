export async function extractTextFromPDF(filePath: string): Promise<string> {
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
