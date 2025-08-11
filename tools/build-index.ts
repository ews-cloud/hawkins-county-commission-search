/*
 * Crawl Hawkins County Clerk commission information: collect PDF & HTML items,
 * infer type (Agenda/Minutes/Resolution), extract text from PDFs, derive dates.
 * Writes search index to public/index.json
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import got from 'got'
import * as cheerio from 'cheerio'
// @ts-ignore – types are optional for pdf-parse
import pdfParse from 'pdf-parse'

import type { CommissionDoc, DocType } from '@/lib/types'

const ROOT = 'https://www.hawkinscountyclerk.com/commission-information/'

function sha1(s: string) { return crypto.createHash('sha1').update(s).digest('hex') }
function guessTypeFromUrl(url: string): DocType | undefined {
  const u = url.toLowerCase()
  if (u.includes('agenda')) return 'Agenda'
  if (u.includes('minute')) return 'Minutes'
  if (u.includes('resolution')) return 'Resolution'
  return undefined
}
function guessDateFromString(s: string): string | undefined {
  const m = s.match(/(20\d{2})[\/-](\d{1,2})[\/-](\d{1,2})/) || s.match(/(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2})/)
  if (!m) return undefined
  let y: number, mo: number, d: number
  if (m[3] && m[3].length === 4) { // mm/dd/YYYY
    y = Number(m[3]); mo = Number(m[1]); d = Number(m[2])
  } else { // YYYY-mm-dd
    y = Number(m[1]); mo = Number(m[2]); d = Number(m[3])
  }
  const iso = new Date(Date.UTC(y, mo-1, d)).toISOString().slice(0,10)
  return iso
}

async function main() {
  const html = await got(ROOT, { timeout: 30000 }).text()
  const $ = cheerio.load(html)
  const links = new Set<string>()

  $('a').each((_, el) => {
    const href = $(el).attr('href')?.trim() || ''
    if (!href) return
    const url = href.startsWith('http') ? href : new URL(href, ROOT).toString()
    if (!url.includes('hawkinscountyclerk.com')) return
    if (url.includes('/commission-information/')) links.add(url)
    if (url.match(/\.(pdf)$/i)) links.add(url)
  })

  // Follow section pages to gather PDFs
  for (const pageUrl of Array.from(links)) {
    if (pageUrl.endsWith('.pdf')) continue
    try {
      const p = await got(pageUrl).text()
      const $$ = cheerio.load(p)
      $$('a[href$=".pdf"]').each((_, a) => {
        const href = $$(a).attr('href')
        if (href) {
          const abs = href.startsWith('http') ? href : new URL(href, pageUrl).toString()
          links.add(abs)
        }
      })
    } catch {}
  }

  const out: CommissionDoc[] = []
  for (const url of Array.from(links)) {
    if (!url.endsWith('.pdf')) continue
    try {
      const buf = await got(url, { timeout: 60000 }).buffer()
      const parsed = await pdfParse(buf)
      const text = (parsed.text || '').replace(/\s+/g, ' ').trim()
      const titleGuess = (new URL(url).pathname.split('/').pop() || 'Commission Document').replace(/[-_]/g, ' ')
      const date = guessDateFromString(url) || guessDateFromString(text) || new Date().toISOString().slice(0,10)
      const type = guessTypeFromUrl(url) || (text.toLowerCase().includes('resolution') ? 'Resolution' : text.toLowerCase().includes('minutes') ? 'Minutes' : text.toLowerCase().includes('agenda') ? 'Agenda' : 'Agenda')

      out.push({
        id: sha1(url),
        title: titleGuess,
        date,
        year: new Date(date).getFullYear(),
        type,
        meeting: /regular|special/i.test(text) ? (text.match(/(Regular Session|Special Called)/i)?.[0] || undefined) : undefined,
        url, // direct PDF as source too
        pdfUrl: url,
        body: text,
      })
    } catch (e:any) {
      console.error('Skip', url, e.message)
    }
  }

  out.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const file = path.join(process.cwd(), 'public', 'index.json')
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(out, null, 2))
  console.log(`Wrote ${out.length} records → public/index.json`)
}

main().catch(err => { console.error(err); process.exit(1) })