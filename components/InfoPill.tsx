import React from 'react'
export default function InfoPill({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-slate-600">
      {icon} {children}
    </span>
  )
}