import { DocumentStatus } from "@prisma/client"
import { Type } from "class-transformer"
import { IsEnum, IsInt, IsOptional, Min } from "class-validator"

/**
 * Query DTO for listing documents by status with pagination.
 */
export class ListDocumentsQueryDto {
  @IsOptional()
  @IsEnum(DocumentStatus)
  status: DocumentStatus

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 50
}