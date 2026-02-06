import { Injectable } from '@nestjs/common'
import {
  Document,
  DocumentProcessingStep,
  DocumentStatus,
  Prisma,
} from '@prisma/client'
import { PrismaService } from 'src/common/services/prisma.service'
import { DocumentGateway } from '../gateways/document.gateway'

/**
 * Repository for Document model.
 * Encapsulates all DB operations related to documents and their processing status.
 */
@Injectable()
export class DocumentRepository {
  constructor(
    private readonly prisma: PrismaService, 
    private readonly documentGateway: DocumentGateway
  ) {}

  /**
   * Create a new record in PENDING status.
   * Can be used if you want to register a file before processing starts.
   */
  async createPending(input: {
    sharepointDriveId: string
    sharepointItemId: string
    sharepointSiteId?: string | null
    sharepointWebUrl?: string | null
    fileName: string
    fileSize?: number | null
    contentType?: string | null
    documentType?: string | null
  }): Promise<Document> {
    return this.prisma.document.create({
      data: {
        ...input,
        status: DocumentStatus.PENDING,
      },
    })
  }

  /**
   * Upsert record and set status to IN_PROGRESS.
   * This is convenient to call at the very beginning of webhook processing.
   */
  async upsertStartProcessing(input: {
    sharepointDriveId: string
    sharepointItemId: string
    sharepointSiteId?: string | null
    sharepointWebUrl?: string | null
    fileName: string
    fileSize?: number | null
    contentType?: string | null
    documentType?: string | null
  }): Promise<Document> {
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

    const doc = await this.prisma.document.upsert({
      where: { sharepointItemId },
      create: {
        sharepointDriveId,
        sharepointItemId,
        sharepointSiteId,
        sharepointWebUrl,
        fileName,
        fileSize: fileSize ?? null,
        contentType: contentType ?? null,
        documentType: documentType ?? null,
        status: DocumentStatus.IN_PROGRESS,
        currentStep: DocumentProcessingStep.DOWNLOADING,
      },
      update: {
        sharepointDriveId,
        sharepointSiteId,
        sharepointWebUrl,
        fileName,
        fileSize: fileSize ?? null,
        contentType: contentType ?? null,
        documentType: documentType ?? null,
        status: DocumentStatus.IN_PROGRESS,
        currentStep: DocumentProcessingStep.DOWNLOADING,
      },
    })

    return this.notifyChanged(doc)
  }

  /**
   * Mark document as PROCESSED and store extracted data & raw text.
   */
  async markProcessed(params: {
    sharepointItemId: string
    data: Prisma.InputJsonValue | null
    rawText?: string | null
  }): Promise<Document> {
    const { sharepointItemId, data, rawText } = params

    const doc = await this.prisma.document.update({
      where: { sharepointItemId },
      data: {
        status: DocumentStatus.PROCESSED,
        data,
        rawText: rawText ?? null,
        processedAt: new Date(),
        errorMessage: null,
        currentStep: null,
      },
    })

    return this.notifyChanged(doc)
  }

  /**
   * Mark document as FAILED with an error message.
   */
  async markFailed(params: {
    sharepointItemId: string
    errorMessage: string
  }): Promise<Document> {
    const { sharepointItemId, errorMessage } = params

    const doc = await this.prisma.document.update({
      where: { sharepointItemId },
      data: {
        status: DocumentStatus.FAILED,
        errorMessage,
        currentStep: null,
      },
    })

    return this.notifyChanged(doc)
  }

  /**
   * Update processing status manually (useful for custom flows).
   */
  async update(id: string, dto: Partial<Document>): Promise<Document> {
    const doc = await this.prisma.document.update({
      where: { id },
      data: dto,
    })

    return this.notifyChanged(doc)
  }

  /**
   * Update processing status manually (useful for custom flows).
   */
  async updateStatus(params: {
    sharepointItemId: string
    status?: DocumentStatus
    currentStep?: DocumentProcessingStep | null
    progress?: number | null
    errorMessage?: string | null
  }): Promise<Document> {
    const { sharepointItemId, ...rest } = params

    const doc = await this.prisma.document.update({
      where: { sharepointItemId },
      data: rest,
    })

    return this.notifyChanged(doc)
  }

  /**
   * Find a document by internal id.
   */
  async findById(id: string): Promise<Document | null> {
    return this.prisma.document.findUnique({
      where: { id },
    })
  }

  /**
   * Find a document by SharePoint item id.
   */
  async findBySharepointItemId(
    sharepointItemId: string,
  ): Promise<Document | null> {
    return this.prisma.document.findUnique({
      where: { sharepointItemId },
    })
  }

  /**
   * Find all documents by status with optional pagination.
   * Useful for admin pages or monitoring.
   */
  async findByStatus(params: {
    status: DocumentStatus
    skip?: number
    take?: number
  }): Promise<Document[]> {
    const { status, skip = 0, take = 50 } = params

    return this.prisma.document.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    })
  }

  /**
   * Find documents for export (e.g. to Excel) with flexible filters:
   * - by status
   * - by date range
   */
  async findForExport(params: {
    status?: DocumentStatus
    processedFrom?: Date
    processedTo?: Date
  }): Promise<Document[]> {
    const { status, processedFrom, processedTo } = params

    const where: Prisma.DocumentWhereInput = {}

    if (status) {
      where.status = status
    }

    if (processedFrom || processedTo) {
      where.processedAt = {}
      if (processedFrom) {
        where.processedAt.gte = processedFrom
      }
      if (processedTo) {
        where.processedAt.lte = processedTo
      }
    }

    return this.prisma.document.findMany({
      where,
      orderBy: { processedAt: 'asc' },
    })
  }

  /**
   * Count documents by status.
   * Helpful for dashboards and monitoring.
   */
  async countByStatus(status: DocumentStatus): Promise<number> {
    return this.prisma.document.count({
      where: { status },
    })
  }

  /**
   * Delete a document by SharePoint item id.
   * Use with care - usually we want to keep history.
   */
  async deleteBySharepointItemId(
    sharepointItemId: string,
  ): Promise<Document> {
    return this.prisma.document.delete({
      where: { sharepointItemId },
    })
  }

  /**
   * Hard delete by internal id.
   */
  async deleteById(id: string): Promise<Document> {
    return this.prisma.document.delete({
      where: { id },
    })
  }

  /**
   * Generic search with flexible where/order/limit.
   * Use this as a low-level escape hatch if needed.
   */
  async findMany(args: Prisma.DocumentFindManyArgs): Promise<Document[]> {
    return this.prisma.document.findMany(args)
  }

  private notifyChanged(doc: Document): Document {
    this.documentGateway.broadcastDocumentChanged(doc)
    return doc
  }
}
