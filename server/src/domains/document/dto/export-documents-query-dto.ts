import { DocumentStatus } from "@prisma/client"
import { IsOptional, IsEnum, IsDateString } from "class-validator"

/**
 * Query DTO for exporting documents with optional filters.
 */
export class ExportDocumentsQueryDto {
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus

  @IsOptional()
  @IsDateString()
  processedFrom?: string

  @IsOptional()
  @IsDateString()
  processedTo?: string
}