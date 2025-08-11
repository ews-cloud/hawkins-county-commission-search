'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import MiniSearch from 'minisearch'
import { motion } from 'framer-motion'
import { Landmark, Sparkles, Search, Clock, AlertTriangle, Share2, Copy } from 'lucide-react'
import Filters from './Filters'
import SortMenu from './SortMenu'
import InfoPill from './InfoPill'
import ResultCard from './ResultCard'
import type { CommissionDoc, DocType } from '@/lib/types'

const FIELD_BOOSTS: Record<keyof CommissionDoc, number> = { id:1, title:4, date:2, year:1, type:2, meeting:2, url:1, pdfUrl:1, body:1.8 }

type SortKey = 'relevance' | 'newest' | 'oldest' | 'title'

type State = {
  query: string
  filters: { type?: DocType; year?: number; dateStart?: string; dateEnd?: string; hasPdf?: boolean; meetingContains?: string; titleContains?: string }
  sort: SortKey
}

function toQuery(obj: Record<string, any>) {
  const q = new URLSearchParams()
  Object.entries(obj).forEach(([k,v]) => {
    if (v === undefined || v === null || v === '') return
    if (Array.isArray(v) && v.length === 0) return
    if (Array.isArray(v)) v.forEach(val => q.append(k, String(val)))
    else q.set(k, String(v))
  })
  return q.toString()
}

function fromQuery(): Partial<State> {
  const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const type = p.get('type') as DocType | null
  const year = p.get('year')
  const q = p.get('q') || ''
  const sort = (p.get('sort') as SortKey | null) || 'relevance'
  const start = p.get('start') ?? undefined
  const end = p.get('end') ?? undefined
  return { query: q, filters: { type: type ?? undefined, year: year ? Number(year) : undefined, dateStart: start || undefined, dateEnd: end || undefined, hasPdf: p.get('pdf') === '1' ? true : p.get('pdf') === '0' ? false : undefined, meetingContains: p.get('meet') || undefined, titleContains: p.get('title') || undefined }, sort }
}

export default function SearchApp() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [docs, setDocs] = useState<CommissionDoc[] | null>(null)
  const [ready, setReady] = useState(false)
  const [mini, setMini] = useState<MiniSearch<CommissionDoc> | null>(null)
  const [state, setState] = useState<State>(() => ({ query: '', filters: {}, sort: 'relevance' }))
  const [copied, setCopied] = useState(false)

  useEffect(() => { setState(s => ({...s, ...fromQuery(), filters: {...s.filters, ...(fromQuery().filters || {})} })) }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/index', { next: { revalidate: 3600 } })
        const data: CommissionDoc[] = await r.json()
        if (!cancelled) setDocs(data)
      } finally { setReady(true) }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!docs) return
    const ms = new MiniSearch<CommissionDoc>({
      fields: ['title','body','meeting','type'],
      storeFields: ['id','title','date','year','type','meeting','url','pdfUrl','body'],
      searchOptions: { boost: FIELD_BOOSTS as any, prefix: true, fuzzy: 0.2, combineWith: 'AND' },
    })
    ms.addAll(docs)
    setMini(ms)
  }, [docs])

  useEffect(() => {
    const qp = toQuery({ q: state.query || undefined, type: state.filters.type || undefined, year: state.filters.year || undefined, start: state.filters.dateStart || undefined, end: state.filters.dateEnd || undefined, pdf: state.filters.hasPdf === undefined ? undefined : state.filters.hasPdf ? 1 : 0, meet: state.filters.meetingContains || undefined, title: state.filters.titleContains || undefined, sort: state.sort })
    const url = `${window.location.pathname}${qp ? `?${qp}` : ''}`
    window.history.replaceState({}, '', url)
  }, [state])

  const years = useMemo(() => { const ys = new Set<number>(); docs?.forEach(d => ys.add(d.year)); return Array.from(ys).sort((a,b)=>b-a) }, [docs])
  const types: DocType[] = ['Agenda','Minutes','Resolution']

  const results = useMemo(() => {
    if (!docs) return [] as CommissionDoc[]
    let base = docs.slice()
    const f = state.filters
    if (f.titleContains) base = base.filter(d => d.title.toLowerCase().includes(f.titleContains!.toLowerCase()))
    if (f.meetingContains) base = base.filter(d => (d.meeting || '').toLowerCase().includes(f.meetingContains!.toLowerCase()))
    if (f.type) base = base.filter(d => d.type === f.type)
    if (f.year) base = base.filter(d => d.year === f.year)
    if (f.hasPdf !== undefined) base = base.filter(d => f.hasPdf ? !!d.pdfUrl : !d.pdfUrl)
    if (f.dateStart) { const s = new Date(f.dateStart).getTime(); base = base.filter(d => new Date(d.date).getTime() >= s) }
    if (f.dateEnd) { const e = new Date(f.dateEnd).getTime(); base = base.filter(d => new Date(d.date).getTime() <= e) }

    let scored = base
    if (mini && state.query.trim()) {
      const hits = mini.search(state.query.trim(), { filter: (doc) => base.some(b => b.id === doc.id) })
      const byId = new Map(hits.map(h => [h.id as string, h]))
      scored = base.filter(d => byId.has(d.id)).sort((a,b) => (byId.get(b.id)!.score! - byId.get(a.id)!.score!))
      return sort(scored, state.sort)
    }
    return sort(scored, state.sort)
  }, [docs, mini, state])

  const terms = useMemo(() => state.query.trim().split(/\s+/).filter(Boolean), [state.query])
  const share = async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false), 1400) } catch {} }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Landmark className="h-6 w-6" />
          <div className="font-semibold">Hawkins County Commission Search</div>
          <span className="text-xs text-slate-500 hidden md:inline">Agendas • Minutes • Resolutions</span>
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500"><Sparkles className="h-4 w-4" />Search index updates hourly</div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-6 pb-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input ref={inputRef} value={state.query} onChange={e=>setState(s=>({...s, query: e.target.value}))} placeholder="Search agendas, minutes, resolutions… (try: solid waste budget)" className="w-full pl-10 pr-28 py-3 rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2"><kbd className="hidden md:inline px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs border">/</kbd></div>
          </div>
          <div className="flex items-center gap-2">
            <SortMenu value={state.sort} onChange={(sort)=>setState(s=>({...s, sort}))} />
            <Filters state={state} setState={setState} years={years} types={types} />
            <button onClick={share} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 shadow-sm hover:bg-slate-50">{copied ? <Copy className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} {copied ? 'Copied' : 'Share'}</button>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
          <InfoPill icon={<Clock className="h-3.5 w-3.5" />}>{ready ? `Loaded ${docs?.length ?? 0} records` : 'Loading…'}</InfoPill>
          <InfoPill icon={<AlertTriangle className="h-3.5 w-3.5" />}>Public data only; no PII</InfoPill>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        {results.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 p-8 text-center bg-white">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center"><Search className="h-6 w-6 text-slate-400" /></div>
            <h3 className="mt-3 text-lg font-semibold">{state.query ? 'No results' : 'Search the archive'}</h3>
            <p className="mt-1 text-slate-600 text-sm">Try different keywords (e.g., "budget", "zoning", "solid waste"). You can also filter by type, year, and date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {results.map((d,i)=> (
              <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.02 }}>
                <ResultCard d={d} terms={terms} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function sort(rows: CommissionDoc[], key: SortKey) {
  const byTitle = (a: CommissionDoc, b: CommissionDoc) => a.title.localeCompare(b.title)
  const byDate = (a: CommissionDoc, b: CommissionDoc) => new Date(a.date).getTime() - new Date(b.date).getTime()
  if (key === 'title') return rows.slice().sort(byTitle)
  if (key === 'newest') return rows.slice().sort((a,b) => byDate(b,a))
  if (key === 'oldest') return rows.slice().sort(byDate)
  return rows
}