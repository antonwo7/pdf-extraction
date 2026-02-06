import './globals.css'
import type { Metadata } from 'next'
import { ReactQueryProvider } from './ReactQueryProvider'

export const metadata: Metadata = {
  title: 'Extraction Monitor',
  description: 'Live monitoring of document processing for Extraction service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
