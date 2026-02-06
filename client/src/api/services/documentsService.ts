import { DocumentView, ListDocumentsParams, ListDocumentsResponse } from "@/types/document"
import { httpClient } from "../httpClient"

export async function listDocuments(params: ListDocumentsParams): Promise<ListDocumentsResponse> {
  const res = await httpClient.get<ListDocumentsResponse>('/documents', {
    params: {
      status: params.status,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50,
    },
  })

  return res.data
}

// Simple fetch service for getting document data
export async function fetchDocumentView(id: string): Promise<DocumentView> {
  const res = await httpClient.get<DocumentView>(`/documents/${id}/view`, {})
  return res.data
}

export async function updateDocumentField(
  id: string,
  fieldName: string,
  value: string,
): Promise<void> {
  await httpClient.patch(`/documents/${id}/field`, {
    fieldName,
    value,
  })
}