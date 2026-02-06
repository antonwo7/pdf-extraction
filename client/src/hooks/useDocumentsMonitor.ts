'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'
import { listDocuments } from '@/api/services/documentsService'
import {
  DocumentStatus,
  DocumentListItem,
  ListDocumentsResponse,
  DocumentProcessingStep
} from '@/types/document'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type WsDocumentPayload = {
  id: string
  fileName: string
  status: DocumentStatus
  currentStep: DocumentProcessingStep | null
  errorMessage?: string | null
  createdAt: string
  processedAt: string | null
}

export function useDocumentsMonitor(status?: DocumentStatus) {
  const queryClient = useQueryClient()
  const queryKey = ['documents', { status }]

  const query = useQuery({
    queryKey,
    queryFn: () =>
      listDocuments({
        status,
        page: 1,
        pageSize: 50,
      }),
    staleTime: 5_000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!API_URL) {
      console.warn('NEXT_PUBLIC_API_URL is not defined')
      return
    }

    // подключаемся к namespace `/documents`
    const socket: Socket = io(`${API_URL}/documents`, {
      transports: ['websocket'],
    })

    // Для отладки можно оставить
    socket.on('connect', () => {
      console.log('[WS] connected to /documents')
    })
    socket.on('disconnect', () => {
      console.log('[WS] disconnected from /documents')
    })

    const handler = (payload: WsDocumentPayload) => {
      queryClient.setQueryData<ListDocumentsResponse | undefined>(
        queryKey,
        (current) => {
          if (!current) return current

          const matchesFilter = !status || status === payload.status
          const existingIndex = current.items.findIndex(
            (d) => d.id === payload.id,
          )

          let items = [...current.items]

          if (existingIndex >= 0) {
            const old = items[existingIndex]

            if (!matchesFilter) {
              // ушёл из фильтра (например, PENDING -> PROCESSED)
              items.splice(existingIndex, 1)
            } else {
              const updated: DocumentListItem = {
                ...old,
                status: payload.status,
                currentStep: payload.currentStep ?? null,
                errorMessage: payload.errorMessage ?? null,
                processedAt: payload.processedAt
              }

              items[existingIndex] = updated
            }
          } else if (matchesFilter) {
            const newItem: DocumentListItem = {
              id: payload.id,
              fileName: payload.fileName,
              status: payload.status,
              currentStep: payload.currentStep ?? null,
              errorMessage: payload.errorMessage ?? null,
              createdAt: payload.createdAt,
              processedAt: payload.processedAt
            }

            items = [newItem, ...items]
          }

          return {
            ...current,
            items,
          }
        },
      )
    }


    socket.on('document-status-changed', handler)

    return () => {
      socket.off('document-status-changed', handler)
      socket.disconnect()
    }
  }, [API_URL, status, queryKey, queryClient])

  return query
}
