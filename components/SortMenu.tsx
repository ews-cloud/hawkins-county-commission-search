'use client'
import React, { useState } from 'react'
import { ChevronDown, Filter, Settings, SortAsc, SortDesc } from 'lucide-react'

type SortKey = 'relevance' | 'newest' | 'oldest' | 'title'

export default function SortMenu({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false)
  const options: { key: SortKey; label: string; icon: React.ReactNode }[] = [
    { key: 'relevance', label: 'Relevance', icon: <Settings className="h-4 w-4" /> },
    { key: 'newest', label: 'Newest', icon: <SortDesc className="h-4 w-4" /> },
    { key: 'oldest', label: 'Oldest', icon: <SortAsc className="h-4 w-4" /> },
    { key: 'title', label: 'Title A→Z', icon: <Filter className="h-4 w-4" /> },
  ]
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 shadow-sm hover:bg-slate-50">
        <Settings className="h-4 w-4" /> Sort: <span className="font-medium">{options.find(o => o.key === value)?.label}</span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-50">
          {options.map(o => (
            <button key={o.key} onClick={() => { onChange(o.key); setOpen(false) }} className={`w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 ${value === o.key ? 'bg-slate-50' : ''}`}>
              <div className="flex items-center gap-2">{o.icon}<span>{o.label}</span></div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}