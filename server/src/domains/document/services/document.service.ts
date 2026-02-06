import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DocumentRepository } from '../repositories/document.repository'
import { DocumentFieldView, ProcessSharepointFileInput } from '../types/document.types'
import { ShareService } from 'src/common/services/share.service'
import { OpeAIService } from 'src/common/services/openai.service'
import { LoggerService } from 'src/common/services/logger.service'
import { Document, DocumentProcessingStep, DocumentStatus } from '@prisma/client'
import { OcrJobsClientService } from 'src/common/services/ocr-jobs-client.service'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import factura from 'data/factura'
import dni from 'data/dni'
import nomina from 'data/nomina'
import dec303 from 'data/dec303'
import escrituraHipoteca from 'data/escritura'
import dec390 from 'data/dec390'
import denuncia from 'data/denuncia'
import { TFieldData } from 'src/types'

export const dataMap = {
  escritura: escrituraHipoteca,
  factura: factura,
  dni: dni,
  nomina: nomina,
  dec303: dec303,
  dec390: dec390,
  denuncia: denuncia
}


@Injectable()
export class DocumentService {
  private spDownloadServiceURL: string
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly shareService: ShareService,
    private readonly ocrJobsClient: OcrJobsClientService,
    private readonly openAiService: OpeAIService,
    private readonly logger: LoggerService,
    private readonly http: HttpService,
    private config: ConfigService
  ) {
    this.spDownloadServiceURL = this.config.get<string>('SHAREPOINT_DOWNLOAD_URL')!
  }

  async processSharepointFile(input: ProcessSharepointFileInput): Promise<Document> {
    const {
      sharepointDriveId,
      sharepointItemId,
      sharepointSiteId,
      sharepointWebUrl,
      fileName,
      fileSize,
      contentType,
      documentType,
    } = input

    this.logger.info(
      `Starting processing for SharePoint file: driveId=${sharepointDriveId}, itemId=${sharepointItemId}, fileName=${fileName}`,
    )

    // 1. Upsert документа в БД и статус IN_PROGRESS
    const document = await this.documentRepository.upsertStartProcessing({
      sharepointDriveId,
      sharepointItemId,
      sharepointSiteId,
      sharepointWebUrl,
      fileName,
      fileSize,
      contentType,
      documentType,
    })

    // 2. Обновляем статус в SharePoint: "In progress"
    try {
      await this.documentRepository.updateStatus({
        sharepointItemId,
        currentStep: DocumentProcessingStep.OCR,
      })

      await this.shareService.updateProcessingStatus(
        sharepointDriveId,
        sharepointItemId,
        'In progress',
      )
    } catch (err) {
      this.logger.error(
        `Failed to update SharePoint status to "In progress" for itemId=${sharepointItemId}`,
        err,
      )
      // не фейлим весь пайплайн
    }

    try {
      // 3. Создаём OCR-job в OKR-сервисе
      const job = await this.ocrJobsClient.createJobForSharepointFile({
        externalFileId: document.id,
        sharepointDriveId,
        sharepointItemId,
        generateSearchablePdf: true
      })

      this.logger.info(
        `OCR job created in OKR-service: jobId=${job.id}, totalFiles=${job.totalFiles}`,
      )

      // 4. Ждём результата по одному файлу
      const jobFileResult = await this.ocrJobsClient.waitForSingleFileResult(job.id, {
        sharepointDriveId,
        sharepointItemId,
      })

      const rawText = jobFileResult.text ?? ''
      if (!rawText) {
        throw new Error(
          `Empty OCR text received from OKR-service for itemId=${sharepointItemId}`,
        )
      }

      await this.documentRepository.update(document.id, {
        searchableDriveId: jobFileResult.searchablePdf?.driveId ?? null,
        searchableItemId: jobFileResult.searchablePdf?.itemId ?? null,
        ocrJobId: job.id
      })

      await this.documentRepository.updateStatus({
        sharepointItemId,
        currentStep: DocumentProcessingStep.AI_EXTRACTION,
      })

      this.logger.info(
        `OCR text received from OKR-service for itemId=${sharepointItemId}, length=${rawText.length}`,
      )

      const finalDocumentType = await this.openAiService.getFileType(rawText)
      if (!finalDocumentType) {
        throw new Error(
          `Recieved empty document type`,
        )
      }

      await this.documentRepository.update(document.id, {
        documentType: finalDocumentType,
      })

      this.logger.info(
        `Recieved document type=${finalDocumentType} successfully`,
      )

      // 5. AI-анализ: text -> structured data
      const data = await this.openAiService.analizeText(finalDocumentType, rawText)

      this.logger.info(
        `Recieved document structured data successfully`,
      )

      await this.documentRepository.updateStatus({
        sharepointItemId,
        currentStep: DocumentProcessingStep.SAVING_RESULTS,
      })

      await this.documentRepository.updateStatus({
        sharepointItemId,
        currentStep: DocumentProcessingStep.SAVING_RESULTS,
      })

      // 6. Сохраняем в БД как PROCESSED
      const updated = await this.documentRepository.markProcessed({
        sharepointItemId,
        data,
        rawText,
      })

      // 7. Обновляем статус в SharePoint: "Processed"
      try {
        await this.shareService.updateProcessingStatus(
          sharepointDriveId,
          sharepointItemId,
          'Processed',
        )

        await this.documentRepository.updateStatus({
          sharepointItemId,
          currentStep: null,
        })
      } catch (err) {
        this.logger.error(
          `Failed to update SharePoint status to "Processed" for itemId=${sharepointItemId}`,
          err,
        )
      }

      this.logger.info(
        `Successfully processed itemId=${sharepointItemId}, documentId=${updated.id}`,
      )

      return updated
    } catch (err) {
      this.logger.error(
        `Error while processing SharePoint file itemId=${sharepointItemId}`,
        err,
      )

      // 8. Отмечаем документ как FAILED
      await this.documentRepository.markFailed({
        sharepointItemId,
        errorMessage: (err as Error).message ?? 'Unknown error',
      })

      // 9. Обновляем статус в SharePoint: "Failed"
      try {
        await this.shareService.updateProcessingStatus(
          sharepointDriveId,
          sharepointItemId,
          'Failed',
        )
      } catch (updateErr) {
        this.logger.error(
          `Failed to update SharePoint status to "Failed" for itemId=${sharepointItemId}`,
          updateErr,
        )
      }

      throw err
    }
  }

  // ─────────────────────────────────────────────
  // Query / helper methods for controllers, admin panel, exports, etc.
  // ─────────────────────────────────────────────

  /**
   * Get document by internal id.
   */
  async getDocumentById(id: string): Promise<Document | null> {
    return this.documentRepository.findById(id)
  }

  /**
   * Get document by SharePoint item id.
   */
  async getDocumentBySharepointItemId(
    sharepointItemId: string,
  ): Promise<Document | null> {
    return this.documentRepository.findBySharepointItemId(sharepointItemId)
  }

  /**
   * List documents by status with pagination.
   * Useful for admin pages or monitoring.
   */
  async getAll(params: {
    status: DocumentStatus
    page?: number
    pageSize?: number
  }): Promise<{ items: Document[]; total: number }> {
    const { status, page = 1, pageSize = 50 } = params
    const skip = (page - 1) * pageSize

    const [items, total] = await Promise.all([
      this.documentRepository.findByStatus({ status, skip, take: pageSize }),
      this.documentRepository.countByStatus(status),
    ])

    return { items, total }
  }

  /**
   * Get documents for export (e.g. to Excel) with optional filters.
   */
  async getDocumentsForExport(params: {
    status?: DocumentStatus
    processedFrom?: Date
    processedTo?: Date
  }): Promise<Document[]> {
    return this.documentRepository.findForExport(params)
  }

  /**
   * Force re-processing of a document by SharePoint item id.
   * Useful if you want to re-run OCR/AI after fixing a bug.
   */
  async reprocess(sharepointItemId: string): Promise<Document> {
    const doc = await this.documentRepository.findBySharepointItemId(
      sharepointItemId,
    )
    if (!doc) {
      throw new Error(
        `Document with sharepointItemId=${sharepointItemId} not found`,
      )
    }

    // Build minimal input from stored data
    const input: ProcessSharepointFileInput = {
      sharepointDriveId: doc.sharepointDriveId,
      sharepointItemId: doc.sharepointItemId,
      sharepointSiteId: doc.sharepointSiteId,
      sharepointWebUrl: doc.sharepointWebUrl,
      fileName: doc.fileName,
      fileSize: doc.fileSize ?? undefined,
      contentType: doc.contentType ?? undefined,
      documentType: doc.documentType ?? undefined,
    }

    return this.processSharepointFile(input)
  }

  // document.service.ts

  async handleDriveUpdated(driveId: string): Promise<void> {
    this.logger.info(`handleDriveUpdated: driveId=${driveId}`)

    // 1. Получаем файлы из input-папки (ты уже это умеешь делать через getFiles()).
    const files = await this.shareService.getFiles()

    this.logger.info(`Found ${files.length} files in input folder from SharePoint`)

    for (const file of files) {
      if (!file.file) continue // пропускаем папки и спец-элементы

      const itemId = file.id
      const name = file.name
      const parentRef = file.parentReference

      // 2. Проверяем, есть ли уже запись в БД по этому itemId
      const existing = await this.documentRepository.findBySharepointItemId(itemId)
      if (existing) {
        continue
      }

      this.logger.info(
        `Found NEW file in input folder: itemId=${itemId}, name=${name}`,
      )

      // 3. Запускаем стандартную обработку одного файла
      await this.processSharepointFile({
        sharepointDriveId: parentRef.driveId ?? driveId,
        sharepointItemId: itemId,
        sharepointSiteId: undefined,
        sharepointWebUrl: file.webUrl,
        fileName: name,
        fileSize: file.size,
        contentType: file.file?.mimeType ?? 'application/pdf',
        documentType: undefined,
      })
    }
  }

  async getSearchablePdfMeta(documentId: string) {
    this.logger.info(
      `Getting searchable Pdf Meta for document documentId=${documentId}`,
    )

    const doc = await this.documentRepository.findById(documentId)
    if (!doc) {
      throw new NotFoundException(`Document ${documentId} not found`)
    }

    if (!doc.searchableDriveId || !doc.searchableItemId) {
      throw new BadRequestException(
        'Searchable PDF is not available for this document yet',
      )
    }

    return {
      driveId: doc.searchableDriveId,
      itemId: doc.searchableItemId,
    }
  }

  async getFileByItemId(driveId: string, itemId: string) {
    const url = this.spDownloadServiceURL

    this.logger.info(`Getting file by itemId: driveId=${driveId}, itemId=${itemId}, url=${url}`)

    const response = await firstValueFrom(
      this.http.get<ArrayBuffer>(url, {
        params: {
          driveId,
          itemId,
        },
        responseType: 'arraybuffer',
        // заголовки нам как раз и нужны
        validateStatus: () => true, // сами проверим статус
      }),
    )

    // if (okrResponse.status >= 400) {
    //   // можно логировать подробнее
    //   // но для начала просто пробросим ошибку
    //   res.status(okrResponse.status).send(okrResponse.data)
    //   return
    // }

    // 3) Проксируем заголовки, которые важны
    const contentType = response.headers['content-type'] as string
    const fileName = response.headers['file-name'] as string
    const contentDisposition = response.headers['content-disposition'] as string

    // 4) Проксируем тело
    const buffer = Buffer.from(response.data as any)

    return {contentType, fileName, buffer, contentDisposition}
  }

  /**
   * Приводим сохранённый в document.data JSON к виду, удобному для фронта.
   * Координаты и страницы НЕ используем — слева показывается searchable PDF,
   * справа — список полей.
   */
  async getDocumentView(id: string) {
    const doc = await this.documentRepository.findById(id)
    if (!doc) {
      throw new NotFoundException(`Document ${id} not found`)
    }

    if (!doc.data || typeof doc.data !== 'object') {
      throw new NotFoundException(`Document (${id}) exported data is not valid`)
    }

    const documentType = doc.documentType
    if (!documentType) {
      throw new NotFoundException(`Document ${id} has empty type`)
    }

    const fieldData: TFieldData = dataMap[documentType]?.fields ?? null
    if (!fieldData) {
      throw new NotFoundException(`Field data with document type ${documentType} not found`)
    }

    const rawData: any = doc.data ?? {}

    const fields: DocumentFieldView[] = []

    Object.entries<any>(rawData).forEach(([name, data]) => {
      if (!data || typeof data !== 'object') return;

      const rawValue = data.value
      const valueStr =
        rawValue === undefined || rawValue === null
          ? ''
          : String(rawValue)

      const sourceText =
        typeof data.sourceText === 'string'
          ? data.sourceText
          : ''

      const sourceSentence =
        typeof data.source_sentence === 'string'
          ? data.source_sentence
          : ''

      fields.push({
        name,
        label: fieldData[name].title ?? name,
        value: valueStr,
        sourceText,
        source_sentence: sourceSentence,
      })
    })

    return {
      id: doc.id,
      fileName: doc.fileName,
      createdAt: doc.createdAt,
      processedAt: doc.processedAt,
      status: doc.status,
      documentType: doc.documentType,
      fields,
    }
  }

  /**
   * Обновить value одного поля документа в JSONB (doc.data[fieldName].value).
   * Остальные ключи (sourceText, source_sentence и т.п.) не трогаем.
   */
  async updateDocumentFieldValue(
    documentId: string,
    fieldName: string,
    value: string,
  ): Promise<Document> {
    const doc = await this.documentRepository.findById(documentId)

    if (!doc) {
      throw new NotFoundException(`Document ${documentId} not found`)
    }

    const data = (doc.data || {}) as any

    const currentField = data[fieldName] ?? {}
    const updatedField = {
      ...currentField,
      value,
    }

    const updatedData = {
      ...data,
      [fieldName]: updatedField,
    }

    // используем уже существующий репозиторийный update,
    // чтобы сработал WebSocket notifyChanged
    const updated = await this.documentRepository.update(documentId, {
      data: updatedData as any,
    })

    return updated
  }
}
