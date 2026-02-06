'use client'

import Link from 'next/link'
import { DocumentStatusBadge } from './DocumentStatusBadge'
import { useDocumentsMonitor } from '@/hooks/useDocumentsMonitor'
import { DocumentStatus, DocumentListItem } from '@/types/document'

interface DocumentsMonitorTableProps {
  statusFilter?: DocumentStatus
}

/**
 * High-level table component that displays document processing state.
 */
export function DocumentsMonitorTable({ statusFilter }: DocumentsMonitorTableProps) {
  const { data, isLoading } = useDocumentsMonitor(statusFilter)

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-500">
        Loading documents...
      </div>
    )
  }

  const items = data?.items ?? []

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-500">
        No documents found.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-sm" style={{width: '100%'}}>
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 p-4">
            <Th>File name</Th>
            <Th>Status</Th>
            <Th>Created at</Th>
            <Th>Completed at</Th>
            {/* <Th>Error</Th> */}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-6 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  )
}

function Td({ className, children }: { className?: string, children: React.ReactNode }) {
  return <td className={`px-4 py-3 align-middle text-sm text-slate-800 ${className}`}>{children}</td>
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

function DocumentRow({ doc }: { doc: DocumentListItem }) {
  const baseRowClass = 'transition-colors hover:bg-slate-50'
  const failedClass = doc.status === 'FAILED' ? 'bg-red-50' : ''

  return (
    <tr className={`${baseRowClass} ${failedClass}`}>
      <Td>
        <Link
          href={`/documents/${doc.id}`}
          className="max-w-xs truncate font-medium text-slate-900 hover:text-blue-600"
          title={doc.fileName}
        >
          {doc.fileName}
        </Link>
      </Td>
      <Td>
        <DocumentStatusBadge status={doc.status} currentStep={doc.currentStep} />
      </Td>
      <Td className="whitespace-nowrap text-slate-600">{formatDate(doc.createdAt)}</Td>
      <Td className="whitespace-nowrap text-slate-600">{formatDate(doc.processedAt)}</Td>
      {/* <Td>
        {doc.status === 'FAILED' && doc.errorMessage && (
          <span
            className="line-clamp-2 max-w-xs text-xs text-red-700"
            title={doc.errorMessage}
          >
            {doc.errorMessage}
          </span>
        )}
      </Td> */}
    </tr>
  )
}
