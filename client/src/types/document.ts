export type DocumentStatus = 'PENDING' | 'IN_PROGRESS' | 'PROCESSED' | 'FAILED'

export type DocumentProcessingStep =
  | 'DOWNLOADING'
  | 'OCR'
  | 'AI_EXTRACTION'
  | 'SAVING_RESULTS'

export interface DocumentListItem {
  id: string
  fileName: string
  status: DocumentStatus
  currentStep?: DocumentProcessingStep | null
  progress?: number | null
  errorMessage?: string | null
  createdAt: string
  processedAt?: string | null
}

export interface ListDocumentsResponse {
  items: DocumentListItem[]
  total: number
  page: number
  pageSize: number
}

export interface ListDocumentsParams {
  status?: DocumentStatus
  page?: number
  pageSize?: number
}

export interface DocumentPageImage {
  page: number
  imageUrl: string
}

export interface DocumentFieldView {
  name: string
  label: string
  value: any
  sourceText?: string | null
  source_sentence?: string | null
}

export interface DocumentView {
  id: string
  fileName: string
  createdAt: string
  processedAt: string | null
  status: string
  documentType: string | null
  fields: DocumentFieldView[]
}