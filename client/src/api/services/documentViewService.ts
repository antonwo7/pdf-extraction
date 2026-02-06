import { DocumentView } from "@/types/document"
import { httpClient } from "../httpClient"


/**
 * Fetch a single document view including page images and extracted fields.
 * Backend is expected to return bbox coordinates in normalized 0..1 space.
 */
export async function getDocumentView(documentId: string): Promise<DocumentView> {
  const res = await httpClient.get<DocumentView>(`/documents/${documentId}/view`)
  return res.data
}
