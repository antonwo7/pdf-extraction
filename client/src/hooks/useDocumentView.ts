'use client'

import { useEffect, useState } from 'react'
import type { DocumentView } from '@/types/document'
import { fetchDocumentView } from '@/api/services/documentsService'

interface UseDocumentViewResult {
  data: DocumentView | null
  isLoading: boolean
  error: string | null
}

// Minimal custom hook (без React Query, просто useState/useEffect)
export function useDocumentView(id: string): UseDocumentViewResult {
  const [data, setData] = useState<DocumentView | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const doc = await fetchDocumentView(id)
        if (!cancelled) {
          setData(doc)
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to load document')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, isLoading: loading, error }
}
