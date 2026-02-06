import { IsOptional, IsString } from 'class-validator'

export class StartProcessDto {
	@IsOptional()
	@IsString()
	documentType?: string
}
