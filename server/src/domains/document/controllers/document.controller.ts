import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  HttpException,
  HttpStatus,
  Res,
  Patch,
  Body,
} from '@nestjs/common'
import { DocumentService } from '../services/document.service'
import { ListDocumentsQueryDto } from '../dto/list-documents-query.dto'
import { DocumentIdParamDto } from '../dto/document-id-param.dto'
import { ExportDocumentsQueryDto } from '../dto/export-documents-query-dto'
import { SharepointItemIdParamDto } from '../dto/sharepoint-itemid-param.dto'
import { Response } from 'express'
import { UpdateDocumentFieldDto } from '../dto/update-document-field.dto'

/**
 * Controller for working with Document entities.
 * Provides read endpoints and a reprocess endpoint.
 */
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  /**
   * Get a single document by internal id (UUID).
   */
  @Get(':id')
  async getById(@Param() params: DocumentIdParamDto) {
    const doc = await this.documentService.getDocumentById(params.id)
    if (!doc) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND)
    }
    return doc
  }

  /**
   * Rich view of a document for the front-end viewer.
   * Returns metadata + extracted fields + page previews.
   *
   * GET /documents/:id/view
   */
  @Get(':id/view')
  async getView(@Param() params: DocumentIdParamDto) {
    return this.documentService.getDocumentView(params.id)
  }

  /**
   * Get a single document by SharePoint item id.
   * This is useful when you only know SharePoint identifiers.
   */
  @Get('sharepoint/:sharepointItemId')
  async getBySharepointItemId(@Param() params: SharepointItemIdParamDto) {
    const doc = await this.documentService.getDocumentBySharepointItemId(
      params.sharepointItemId,
    )
    if (!doc) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND)
    }
    return doc
  }

  /**
   * List documents by status with pagination.
   * Example: GET /documents?status=PROCESSED&page=1&pageSize=50
   */
  @Get()
  async getAll(@Query() query: ListDocumentsQueryDto) {
    const { status, page = 1, pageSize = 50 } = query
    const { items, total } = await this.documentService.getAll({
      status,
      page: +page,
      pageSize: +pageSize,
    })

    return {
      items,
      total,
      page,
      pageSize,
    }
  }

  /**
   * Get documents for export (e.g. to Excel) with optional filters:
   * - status (PENDING / IN_PROGRESS / PROCESSED / FAILED)
   * - processedFrom / processedTo (ISO date strings)
   *
   * Example:
   * GET /documents/export?status=PROCESSED&processedFrom=2025-01-01&processedTo=2025-01-31
   */
  @Get('export')
  async getForExport(@Query() query: ExportDocumentsQueryDto) {
    const { status, processedFrom, processedTo } = query

    const fromDate = processedFrom ? new Date(processedFrom) : undefined
    const toDate = processedTo ? new Date(processedTo) : undefined

    const docs = await this.documentService.getDocumentsForExport({
      status,
      processedFrom: fromDate,
      processedTo: toDate,
    })

    // Here we just return raw data.
    // You can plug this into your Excel generation service elsewhere.
    return {
      items: docs,
      count: docs.length,
    }
  }

  /**
   * Force re-processing of a document by SharePoint item id.
   * Useful for admin / support when you want to re-run OCR + AI after a fix.
   *
   * Example: POST /documents/0123456789ABCDEF/reprocess
   */
  @Post(':sharepointItemId/reprocess')
  async reprocess(@Param() params: SharepointItemIdParamDto) {
    const doc = await this.documentService.reprocess(params.sharepointItemId)
    return doc
  }

  @Get(':id/searchable-pdf')
  async getSearchablePdf(
    @Param() params: DocumentIdParamDto,
    @Res() res: Response,
  ) {
    const { id } = params

    const { driveId, itemId } = await this.documentService.getSearchablePdfMeta(id)

    console.log('driveId, itemId: ', driveId, itemId)

    const {contentType, fileName, buffer, contentDisposition} = await this.documentService.getFileByItemId(driveId, itemId)
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('File-Name', fileName)
    res.setHeader('Content-Disposition', contentDisposition)
    
    return res.send(buffer)
  }

  @Patch(':id/field')
  async updateDocumentField(
    @Param() params: DocumentIdParamDto,
    @Body() body: UpdateDocumentFieldDto,
  ) {
    const { id } = params
    const { fieldName, value } = body

    await this.documentService.updateDocumentFieldValue(id, fieldName, value)

    return { success: true }
  }
}
