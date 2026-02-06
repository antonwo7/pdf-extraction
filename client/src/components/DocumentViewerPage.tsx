'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PdfJsViewer from '@/components/PdfJsViewer'
import { useDocumentView } from '@/hooks/useDocumentView'
import type { DocumentFieldView } from '@/types/document'
import { updateDocumentField } from '@/api/services/documentsService'

interface Props {
  documentId: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function DocumentViewerPage({ documentId }: Props) {
  const { data, isLoading, error } = useDocumentView(documentId)

  const [fields, setFields] = useState<DocumentFieldView[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  // Редактирование
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [savingFieldId, setSavingFieldId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (data?.fields) {
      setFields(data.fields)
    }
  }, [data?.fields])

  const selectedField = useMemo(
    () => fields.find((f) => f.name === selectedFieldId) ?? null,
    [fields, selectedFieldId],
  )

  const searchTerm: string | null = useMemo(() => {
    if (!selectedField) return null
    return (
      selectedField.sourceText ||
      selectedField.source_sentence ||
      selectedField.value ||
      null
    )
  }, [selectedField])

  const pdfUrl =
    API_URL && documentId
      ? `${API_URL}/documents/${documentId}/searchable-pdf`
      : ''

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">
        Loading document…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-2">
        <p className="text-sm font-semibold text-red-600">
          Failed to load document
        </p>
        {error && (
          <p className="max-w-md text-center text-xs text-slate-500">
            {String(error)}
          </p>
        )}
      </div>
    )
  }

  const handleStartEdit = (field: DocumentFieldView) => {
    setEditingFieldId(field.name)
    setEditingValue(field.value ?? '')
    setSaveError(null)
  }

  const handleCancelEdit = () => {
    setEditingFieldId(null)
    setEditingValue('')
    setSaveError(null)
  }

  const handleSave = async (field: DocumentFieldView) => {
    try {
      setSavingFieldId(field.name)
      setSaveError(null)

      await updateDocumentField(documentId, field.name, editingValue)

      setFields((prev) =>
        prev.map((f) =>
          f.name === field.name
            ? {
                ...f,
                value: editingValue,
              }
            : f,
        ),
      )

      setEditingFieldId(null)
      setEditingValue('')
    } catch (e: any) {
      console.error('Failed to update field', e)
      setSaveError(
        e?.response?.data?.message ||
          e?.message ||
          'Не удалось сохранить значение поля',
      )
    } finally {
      setSavingFieldId(null)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Верхнее меню — всегда прибито сверху */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/documents"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <span className="text-lg leading-none">←</span>
            <span>Back to monitoring</span>
          </Link>

          <div className="h-4 w-px bg-slate-300" />

          <div className="flex flex-col">
            <span className="max-w-xl truncate text-sm font-semibold text-slate-800">
              {data.fileName}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              Document ID: {data.id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            Status:{' '}
            <span className="font-medium text-slate-700">
              {data.status}
            </span>
          </span>
          {data.documentType && (
            <span>
              Type:{' '}
              <span className="font-medium text-slate-700">
                {data.documentType}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Основной макет заполняет оставшееся место и сам управляет скроллом */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF слева — свой скролл */}
        <div className="flex-1 overflow-auto border-r border-slate-200 bg-slate-50">
          <div className="h-full">
            <PdfJsViewer
              pdfUrl={pdfUrl}
              searchTerm={searchTerm}
              title={data.fileName}
            />
          </div>
        </div>

        {/* Поля справа — свой скролл */}
        <div className="flex min-h-0 w-1/3 flex-col border-l border-slate-200 bg-slate-50">
          {/* Заголовок блока полей — прибит к верху правой колонки */}
          <div className="flex-shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Extracted fields
            </h2>
            <p className="text-[11px] text-slate-500">
              Click a field to highlight it in the PDF. Edit values and save.
            </p>
          </div>

          {/* Ошибка сохранения — тоже сверху, не скроллится */}
          {saveError && (
            <div className="flex-shrink-0 mx-4 mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {saveError}
            </div>
          )}

          {/* Список полей — независимый скролл */}
          <div className="flex-1 overflow-auto px-3 py-3">
            <ul className="space-y-2">
              {fields.map((field) => {
                const isSelected = selectedFieldId === field.name
                const isEditing = editingFieldId === field.name
                const isSaving = savingFieldId === field.name

                return (
                  <li
                    key={field.name}
                    className={`rounded-lg border px-3 py-2 text-xs shadow-sm transition-colors ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Клик по этой части только выбирает поле для подсветки */}
                      <button
                        type="button"
                        className="flex flex-1 flex-col items-start text-left"
                        onClick={() =>
                          setSelectedFieldId(
                            isSelected ? null : field.name,
                          )
                        }
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          {field.label}
                        </span>
                        <span className="mt-0.5 text-[10px] text-slate-400">
                          {field.name}
                        </span>
                      </button>

                      <div className="flex flex-shrink-0 items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSave(field)}
                              disabled={isSaving}
                              className="rounded bg-emerald-500 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                            >
                              {isSaving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="rounded border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(field)}
                            className="rounded border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
                          value={editingValue}
                          onChange={(e) =>
                            setEditingValue(e.target.value)
                          }
                        />
                      ) : field.value ? (
                        <div className="break-words text-sm">
                          {field.value}
                        </div>
                      ) : (
                        <span className="italic text-slate-400">
                          No value
                        </span>
                      )}
                    </div>

                    {field.source_sentence && !isEditing && (
                      <div className="mt-1 border-t border-dashed border-slate-200 pt-1 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-600">
                          Source:
                        </span>{' '}
                        {field.source_sentence}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
