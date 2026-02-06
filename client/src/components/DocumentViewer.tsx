'use client'

import type { DocumentFieldView, DocumentView } from '@/types/document'
import { useMemo, useState } from 'react'

interface DocumentViewerProps {
  document: DocumentView
}

type FieldStatus = 'unreviewed' | 'valid' | 'invalid'

/**
 * Split view: left - page image with overlays, right - fields list.
 * Clicking a field will:
 *  - change current page (if field has page)
 *  - highlight the corresponding bbox on the page
 * User can also mark each field as valid / invalid for manual validation.
 */
export function DocumentViewer({ document }: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(
    document.pages[0]?.page ?? 1
  )

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  // локальный статус валидации полей
  const [fieldStatus, setFieldStatus] = useState<Record<string, FieldStatus>>(
    () => {
      const initial: Record<string, FieldStatus> = {}
      for (const field of document.fields) {
        initial[field.id] = 'unreviewed'
      }
      return initial
    }
  )

  const currentPageImage = useMemo(
    () => document.pages.find((p) => p.page === currentPage) ?? document.pages[0],
    [document.pages, currentPage]
  )

  const fieldsForPage = useMemo(
    () =>
      document.fields.filter(
        (field) => field.page === currentPage && field.bbox
      ),
    [document.fields, currentPage]
  )

  const handleFieldClick = (field: DocumentFieldView) => {
    if (field.page) {
      setCurrentPage(field.page)
    }
    setSelectedFieldId(field.id)
  }

  const setStatus = (fieldId: string, status: FieldStatus) => {
    setFieldStatus((prev) => {
      const current = prev[fieldId] ?? 'unreviewed'
      const next = current === status ? 'unreviewed' : status // повторный клик снимает пометку
      return {
        ...prev,
        [fieldId]: next
      }
    })
  }

  const totalFields = document.fields.length
  const reviewedCount = useMemo(
    () =>
      document.fields.filter(
        (f) => fieldStatus[f.id] && fieldStatus[f.id] !== 'unreviewed'
      ).length,
    [document.fields, fieldStatus]
  )

  return (
    <div className="flex w-full gap-4">
      {/* LEFT: page viewer */}
      <div className="flex-1 space-y-3">
        {/* page selector (small pills) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {document.pages.map((page) => (
              <button
                key={page.page}
                type="button"
                onClick={() => setCurrentPage(page.page)}
                className={[
                  'inline-flex h-8 items-center justify-center rounded-full border px-3 text-xs font-medium transition',
                  page.page === currentPage
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                ].join(' ')}
              >
                Page {page.page}
              </button>
            ))}
          </div>

          {/* прогресс по валидации */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>
              Reviewed: {reviewedCount}/{totalFields}
            </span>
          </div>
        </div>

        {/* main page image with overlays */}
        <div className="relative max-h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-slate-50">
          {currentPageImage ? (
            <div className="relative inline-block">
              {/* Page image */}
              <img
                src={currentPageImage.imageUrl}
                alt={`Page ${currentPageImage.page}`}
                className="block max-h-[70vh] w-auto rounded-lg"
              />

              {/* Overlays */}
              {fieldsForPage.map((field) => {
                if (!field.bbox) return null

                const isSelected = field.id === selectedFieldId

                return (
                  <div
                    key={field.id}
                    className={[
                      'pointer-events-none absolute rounded-md border-2',
                      isSelected
                        ? 'border-blue-500 bg-blue-200/20'
                        : 'border-amber-400 bg-amber-200/10'
                    ].join(' ')}
                    style={{
                      left: `${field.bbox.x * 100}%`,
                      top: `${field.bbox.y * 100}%`,
                      width: `${field.bbox.width * 100}%`,
                      height: `${field.bbox.height * 100}%`
                    }}
                  />
                )
              })}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              No page images available.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: fields list */}
      <div className="flex w-[340px] flex-col rounded-lg border border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Extracted fields
          </h2>
          <span className="text-xs text-slate-500">
            {document.fields.length}
          </span>
        </div>

        <div className="flex-1 space-y-1 overflow-auto p-2">
          {document.fields.map((field) => {
            const isSelected = field.id === selectedFieldId
            const hasLocation = field.page != null && field.bbox
            const status = fieldStatus[field.id] ?? 'unreviewed'

            const statusColors =
              status === 'valid'
                ? 'border border-emerald-300 bg-emerald-50'
                : status === 'invalid'
                ? 'border border-rose-300 bg-rose-50'
                : ''

            return (
              <button
                key={field.id}
                type="button"
                onClick={() => handleFieldClick(field)}
                className={[
                  'flex w-full flex-col rounded-md px-2 py-1.5 text-left text-xs transition',
                  isSelected
                    ? 'bg-blue-50 text-blue-900 ring-1 ring-blue-400'
                    : 'hover:bg-slate-100',
                  statusColors
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-800">
                      {field.label || field.name}
                    </span>
                    {typeof field.confidence === 'number' && (
                      <span className="text-[10px] text-slate-400">
                        Confidence: {Math.round(field.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {hasLocation && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        p.{field.page}
                      </span>
                    )}

                    {/* Кнопки валидации */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setStatus(field.id, 'valid')
                        }}
                        className={[
                          'inline-flex items-center justify-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold',
                          status === 'valid'
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-emerald-400 text-emerald-700 hover:bg-emerald-50'
                        ].join(' ')}
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setStatus(field.id, 'invalid')
                        }}
                        className={[
                          'inline-flex items-center justify-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold',
                          status === 'invalid'
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : 'border-rose-400 text-rose-700 hover:bg-rose-50'
                        ].join(' ')}
                      >
                        ✗
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-0.5 line-clamp-2 text-[11px] text-slate-600">
                  {field.value ?? (
                    <span className="italic text-slate-400">No value</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Нижняя панель — суммарный статус */}
        <div className="border-t border-slate-200 px-3 py-2 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span>
              Valid:{' '}
              {
                document.fields.filter(
                  (f) => fieldStatus[f.id] === 'valid'
                ).length
              }
            </span>
            <span>
              Invalid:{' '}
              {
                document.fields.filter(
                  (f) => fieldStatus[f.id] === 'invalid'
                ).length
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
