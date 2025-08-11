export type DocType = 'Agenda' | 'Minutes' | 'Resolution'
export type CommissionDoc = {
  id: string
  title: string
  date: string // ISO
  year: number
  type: DocType
  meeting?: string
  url: string
  pdfUrl?: string
  body?: string
}