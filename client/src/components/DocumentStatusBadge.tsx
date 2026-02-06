'use client'

import type { DocumentStatus, DocumentProcessingStep } from '@/shared/api/documentsService'

interface Props {
  status: DocumentStatus
  currentStep?: DocumentProcessingStep | null
}

/**
 * Small status component with a colored dot and human readable status text.
 */
export function DocumentStatusBadge({ status, currentStep }: Props) {
  const statusText: Record<DocumentStatus, string> = {
    PENDING: 'Queued',
    IN_PROGRESS: 'Processing',
    PROCESSED: 'Completed',
    FAILED: 'Failed',
  }

  const dotClass =
    status === 'PENDING'
      ? 'h-2.5 w-2.5 rounded-full bg-slate-400'
      : status === 'IN_PROGRESS'
      ? 'h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse'
      : status === 'PROCESSED'
      ? 'h-2.5 w-2.5 rounded-full bg-emerald-500'
      : 'h-2.5 w-2.5 rounded-full bg-red-500'

  const stepText =
    status === 'IN_PROGRESS' && currentStep
      ? ` · step: ${currentStep}`
      : ''

  return (
    <div className="flex items-center gap-2">
      <span className={dotClass} />
      <span className="text-sm text-slate-800">
        {statusText[status]}
        {stepText}
      </span>
    </div>
  )
}
