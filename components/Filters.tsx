'use client'
import React, { useState } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { DocType } from '@/lib/types'

export default function Filters({ state, setState, years, types }: {
  state: any; setState: React.Dispatch<React.SetStateAction<any>>; years: number[]; types: DocType[];
}) {
  const [open, setOpen] = useState(false)
  const clear = () => setState((s: any) => ({ ...s, filters: {} }))
  const activeCount = Object.values(state.filters).filter((v: any) => v !== undefined && v !== '').length

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 shadow-sm hover:bg-slate-50">
        <SlidersHorizontal className="h-4 w-4" /> Filters {activeCount ? <span className="ml-1 rounded-full bg-slate-900 text-white text-[10px] px-1.5 py-0.5">{activeCount}</span> : null}
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[360px] rounded-2xl border border-slate-200 bg-white shadow-xl p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-sm">Refine results</div>
            <button className="text-slate-500 text-xs hover:underline" onClick={clear}><X className="h-3.5 w-3.5 inline" /> Clear</button>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Type</label>
              <div className="flex gap-2 flex-wrap">
                {types.map(t => (
                  <button key={t} onClick={() => setState((s: any) => ({ ...s, filters: { ...s.filters, type: s.filters.type === t ? undefined : t } }))} className={`px-2.5 py-1 rounded-full border ${state.filters.type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Year</label>
              <select value={state.filters.year ?? ''} onChange={(e) => setState((s: any) => ({ ...s, filters: { ...s.filters, year: e.target.value ? Number(e.target.value) : undefined } }))} className="w-full rounded-xl border border-slate-200 px-2 py-2">
                <option value="">Any year</option>
                {years.map(y => (<option value={y} key={y}>{y}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">From</label>
                <input type="date" value={state.filters.dateStart ?? ''} onChange={(e) => setState((s: any) => ({ ...s, filters: { ...s.filters, dateStart: e.target.value || undefined } }))} className="w-full rounded-xl border border-slate-200 px-2 py-2" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">To</label>
                <input type="date" value={state.filters.dateEnd ?? ''} onChange={(e) => setState((s: any) => ({ ...s, filters: { ...s.filters, dateEnd: e.target.value || undefined } }))} className="w-full rounded-xl border border-slate-200 px-2 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Title contains</label>
              <input type="text" value={state.filters.titleContains ?? ''} onChange={(e) => setState((s: any) => ({ ...s, filters: { ...s.filters, titleContains: e.target.value || undefined } }))} className="w-full rounded-xl border border-slate-200 px-2 py-2" placeholder="e.g., budget, zoning" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Meeting contains</label>
              <input type="text" value={state.filters.meetingContains ?? ''} onChange={(e) => setState((s: any) => ({ ...s, filters: { ...s.filters, meetingContains: e.target.value || undefined } }))} className="w-full rounded-xl border border-slate-200 px-2 py-2" placeholder="e.g., Regular, Special Called" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Attachment</label>
              <div className="flex gap-2">
                <button className={`px-2.5 py-1 rounded-full border ${state.filters.hasPdf === true ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'}`} onClick={() => setState((s: any) => ({ ...s, filters: { ...s.filters, hasPdf: s.filters.hasPdf === true ? undefined : true } }))}>Has PDF</button>
                <button className={`px-2.5 py-1 rounded-full border ${state.filters.hasPdf === false ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-700 border-slate-200'}`} onClick={() => setState((s: any) => ({ ...s, filters: { ...s.filters, hasPdf: s.filters.hasPdf === false ? undefined : false } }))}>No PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}