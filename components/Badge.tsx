import React from 'react'
export default function Badge({ children, subtle }: { children: React.ReactNode; subtle?: boolean}) {
  return (
    <span className={
      'inline-flex items-center rounded-full text-xs px-2 py-0.5 border ' +
      (subtle ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-indigo-50 border-indigo-200 text-indigo-700')
    }>
      {children}
    </span>
  )
}