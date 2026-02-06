'use client'

import { useDocumentView } from '@/hooks/useDocumentView'
import Link from 'next/link'
import { DocumentViewer } from './DocumentViewer'

interface Props {
  documentId: string
}

/**
 * Client component that fetches document view and renders the viewer layout.
 */
export function DocumentDetailsClient({ documentId }: Props) {
  const { data, isLoading, error } = useDocumentView(documentId)

  if (isLoading && !data) {
    return (
      <main className="min-h-screen px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-slate-500">Loading document...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen px-6 py-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <Link
            href="/documents/monitor"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to monitor
          </Link>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Failed to load document
          </div>
        </div>
      </main>
    )
  }

  if (!data) {
    return null
  }

  const pdfUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents/${documentId}/searchable-pdf`

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/documents/monitor"
              className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to monitor
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">
              {data.fileName}
            </h1>
            <p className="text-xs text-slate-500">
              Created: {new Date(data.createdAt).toLocaleString()}
              {data.processedAt && (
                <> · Completed: {new Date(data.processedAt).toLocaleString()}</>
              )}
            </p>
          </div>

          <div className="shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-blue-500 hover:text-blue-700"
            >
              Open searchable PDF
            </a>
          </div>
        </div>

        <section className="flex min-h-[500px] flex-1 gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <DocumentViewer document={data} searchablePdfUrl={pdfUrl} />
        </section>
      </div>
    </main>
  )
}
