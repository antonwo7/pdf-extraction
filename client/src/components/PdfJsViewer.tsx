'use client'

import { useEffect, useRef, useState } from 'react'

type PdfJsViewerProps = {
  pdfUrl: string
  searchTerm: string | null
  title: string
}

const SCALE = 1.5

// Нормализация строки для сравнения
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD') // убираем диакритику (á -> a, ñ -> n)
    .replace(/\u00a0/g, ' ') // неразрывные пробелы -> обычные
    .replace(/[\r\n\t]+/g, ' ') // переносы строк/табы -> пробел
    .replace(/\s+/g, ' ') // несколько пробелов -> один
    .trim()

// Только цифры (для сумм, дат и т.п.)
const normalizeNumeric = (s: string) => s.replace(/\D+/g, '')

export default function PdfJsViewer({
  pdfUrl,
  searchTerm,
  title,
}: PdfJsViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [pdfDoc, setPdfDoc] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Загрузка и рендер PDF (canvas + слой для подсветки)
  useEffect(() => {
    if (!pdfUrl) return
    if (typeof window === 'undefined') return

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const pdfjs: any = await import('pdfjs-dist')

        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.mjs',
            import.meta.url,
          ).toString()
        }

        const loadingTask = pdfjs.getDocument(pdfUrl)
        const doc = await loadingTask.promise
        if (cancelled) return

        setPdfDoc(doc)

        const container = containerRef.current
        if (!container) return
        container.innerHTML = ''

        for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
          // eslint-disable-next-line no-await-in-loop
          const page = await doc.getPage(pageNum)
          const viewport = page.getViewport({ scale: SCALE })

          const pageWrapper = document.createElement('div')
          pageWrapper.style.position = 'relative'
          pageWrapper.style.display = 'inline-block'
          pageWrapper.style.marginBottom = '12px'
          pageWrapper.dataset.pageNumber = String(pageNum)

          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) continue

          canvas.height = viewport.height
          canvas.width = viewport.width
          canvas.style.display = 'block'
          canvas.style.background = '#ffffff'

          // Слой подсветки
          const highlightLayer = document.createElement('div')
          highlightLayer.className = 'pdf-highlight-layer'
          highlightLayer.style.position = 'absolute'
          highlightLayer.style.left = '0'
          highlightLayer.style.top = '0'
          highlightLayer.style.width = `${viewport.width}px`
          highlightLayer.style.height = `${viewport.height}px`
          highlightLayer.style.pointerEvents = 'none'

          pageWrapper.appendChild(canvas)
          pageWrapper.appendChild(highlightLayer)
          container.appendChild(pageWrapper)

          await page.render(
            {
              canvasContext: context,
              viewport,
            } as any,
          ).promise
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error('Failed to load PDF', e)
          setError('Failed to load PDF')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pdfUrl])

  // 2. Поиск, подсветка и скролл
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!containerRef.current) return
    if (!pdfDoc) return

    const container = containerRef.current

    // Удаляем старые подсветки
    const prevHighlights = container.querySelectorAll('.pdf-highlight-box')
    prevHighlights.forEach((el) => el.remove())

    if (!searchTerm || !searchTerm.trim()) return

    // Поддержка нескольких значений через "|"
    const rawTokens = searchTerm
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)

    if (!rawTokens.length) return

    const tokens = rawTokens.map((raw) => ({
      raw,
      norm: normalize(raw),
      digits: normalizeNumeric(raw),
    }))

    let cancelled = false
    let scrolled = false

    ;(async () => {
      try {
        const pdfjs: any = await import('pdfjs-dist')

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          // eslint-disable-next-line no-await-in-loop
          const page = await pdfDoc.getPage(pageNum)
          const viewport = page.getViewport({ scale: SCALE })
          // eslint-disable-next-line no-await-in-loop
          const textContent = await page.getTextContent()

          if (cancelled) return

          const items = textContent.items as any[]

          const pageWrapper = container.querySelector(
            `div[data-page-number="${pageNum}"]`,
          ) as HTMLDivElement | null
          const highlightLayer = pageWrapper?.querySelector(
            '.pdf-highlight-layer',
          ) as HTMLDivElement | null

          if (!pageWrapper || !highlightLayer) continue

          for (const item of items) {
            if (!item || typeof item.str !== 'string') continue

            const raw = item.str as string
            const itemNorm = normalize(raw)
            const itemDigits = normalizeNumeric(raw)

            for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
              const { norm: termNorm, digits: termDigits } = tokens[tokenIndex]

              let matched = false

              if (termNorm && itemNorm) {
                // прямое включение: item содержит весь term
                const directMatch = itemNorm.includes(termNorm)

                // обратное: term (фраза) содержит item (кусок строки)
                const reverseMatch =
                  termNorm.length > 0 &&
                  itemNorm.length >= 4 && // чуть снизим порог, чтобы ловить более короткие куски
                  termNorm.includes(itemNorm)

                matched = directMatch || reverseMatch
              }

              // fallback по цифрам (суммы, даты и т.п.)
              if (!matched && termDigits && termDigits.length >= 3) {
                if (itemDigits && itemDigits.includes(termDigits)) {
                  matched = true
                }
              }

              if (!matched) continue

              // ---- КОРРЕКТНЫЙ РАСЧЁТ ПРЯМОУГОЛЬНИКА ----
              // Переносим текстовую матрицу в координаты viewport
              const textMatrix = item.transform // [a, b, c, d, e, f]
              const m = pdfjs.Util.transform(viewport.transform, textMatrix)

              const x = m[4]
              const y = m[5]

              // Высота шрифта в пикселях
              const fontHeight = Math.sqrt(m[2] * m[2] + m[3] * m[3]) || 10

              // Ширина слова/фрагмента в пикселях
              const width = (item.width || raw.length * 4) * viewport.scale

              // В PDF Y снизу вверх, а в DOM сверху вниз:
              const left = x
              const top = viewport.height - (viewport.height - y)

              const finalWidth = Math.max(width, 8)
              const finalHeight = Math.max(fontHeight * 1.2, 6)

              const highlightDiv = document.createElement('div')
              highlightDiv.className = 'pdf-highlight-box'
              highlightDiv.style.position = 'absolute'
              highlightDiv.style.left = `${left}px`
              highlightDiv.style.top = `${top - finalHeight}px` // поднимаем, чтобы прямоугольник лег на строку
              highlightDiv.style.width = `${finalWidth}px`
              highlightDiv.style.height = `${finalHeight}px`
              highlightDiv.style.background = 'rgba(250, 204, 21, 0.35)'
              highlightDiv.style.outline = '1px solid rgba(234, 179, 8, 0.9)'
              highlightDiv.style.borderRadius = '2px'
              highlightDiv.style.pointerEvents = 'none'

              highlightLayer.appendChild(highlightDiv)

              // Скроллим к ПЕРВОМУ попаданию ПЕРВОГО токена
              if (!scrolled && tokenIndex === 0) {
                highlightDiv.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                })
                scrolled = true
              }
            }
          }
        }
      } catch (e) {
        console.error('Error while searching in PDF', e)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pdfDoc, searchTerm])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Document preview
        </h2>
        <span className="max-w-[60%] truncate text-[11px] text-slate-400">
          {title}
        </span>
      </div>

      <div className="relative flex-1 overflow-auto bg-slate-100">
        {loading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-100/80">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
            <div className="text-xs text-slate-600">
              Loading PDF pages…
            </div>
          </div>
        )}

        {error && (
          <div className="border-b border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div
          ref={containerRef}
          className="flex flex-col items-center justify-start p-4"
        />
      </div>
    </div>
  )
}
