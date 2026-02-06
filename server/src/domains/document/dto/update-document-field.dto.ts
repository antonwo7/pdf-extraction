import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateDocumentFieldDto {
  @IsString()
  @IsNotEmpty()
  fieldName: string

  @IsString()
  value: string
}
