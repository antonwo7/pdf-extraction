import { IsString } from "class-validator";

/**
 * Params DTO for accessing a document by SharePoint item id.
 */
export class SharepointItemIdParamDto {
  @IsString()
  sharepointItemId: string
}