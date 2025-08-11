'use client'
import React, { useMemo } from 'react'
import { Calendar, Download, FileText, Link as LinkIcon } from 'lucide-react'
import Badge from './Badge'
import { CommissionDoc } from '@/lib/types'
import { fmtDate, escapeRegExp } from '@/lib/utils'

function highlight(text: string, terms: string[]) {
  if (!terms.length || !text) return text
  const pattern = new RegExp(`(${terms.map(t => escapeRegExp(t)).join('|')})`, 'ig')
  const parts = text.split(pattern)
  return (
    <>
      {parts.map((p, i) =>
        terms.some(t => new RegExp(`^${escapeRegExp(t)}$`, 'i').test(p)) ? (
          <mark key={i} className="rounded px-1">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  )
}

export default function ResultCard({ d, terms }: { d: CommissionDoc; terms: string[] }) {
  const snippet = useMemo(() => {
    if (!d.body) return null
    const lower = d.body.toLowerCase()
    let best = 0, at = 0
    terms.forEach(t => {
      const i = lower.indexOf(t.toLowerCase())
      if (i >= 0 && t.length > best) { best = t.length; at = i }
    })
    const start = Math.max(0, at - 60)
    const end = Math.min(d.body.length, at + 120)
    const slice = d.body.slice(start, end)
    return (start > 0 ? '…' : '') + slice + (end < d.body.length ? '…' : '')
  }, [d.body, terms])

  return (
    <div className="rounded-2xl border border-slate-200 p-4 hover:shadow-sm transition-shadow bg-white">
      <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
        <div className="flex-1 min-w-0">
          <a href={d.url} target="_blank" rel="noreferrer" className="group">
            <h3 className="text-lg font-semibold leading-tight group-hover:underline flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-400" /> {d.title}
            </h3>
          </a>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {fmtDate(d.date)}</span>
            <Badge>{d.type}</Badge>
            {d.meeting && <Badge subtle>{d.meeting}</Badge>}
            {d.pdfUrl ? (
              <a href={d.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline"><Download className="h-4 w-4" /> PDF</a>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400"><Download className="h-4 w-4" /> No PDF</span>
            )}
            <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700"><LinkIcon className="h-4 w-4" /> Source</a>
          </div>
          {snippet && (
            <p className="mt-2 text-[15px] text-slate-700 line-clamp-3">{highlight(snippet, terms)}</p>
          )}
        </div>
      </div>
    </div>
  )
}