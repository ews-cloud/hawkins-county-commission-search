import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hawkins County Commission Search',
  description: 'Search agendas, minutes, and resolutions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}