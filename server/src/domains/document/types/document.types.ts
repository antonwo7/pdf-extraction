import { DocumentStatus } from '@prisma/client'

/**
 * Payload used to start processing when webhook from SharePoint arrives.
 * You can adapt it to the exact shape you receive from Graph/webhook handler.
 */
export interface ProcessSharepointFileInput {
  sharepointDriveId: string
  sharepointItemId: string
  sharepointSiteId?: string | null
  sharepointWebUrl?: string | null

  fileName: string
  fileSize?: number | null
  contentType?: string | null

  /// Logical document type (what client selected or what you inferred)
  documentType?: string | null
}

export interface DocumentFieldView {
  name: string
  label: string
  value: any
  sourceText?: string | null
  source_sentence?: string | null
}