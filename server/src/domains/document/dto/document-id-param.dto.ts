import { IsString } from "class-validator";

/**
 * Params DTO for getting a document by internal id.
 */
export class DocumentIdParamDto {
  @IsString()
  id: string
}