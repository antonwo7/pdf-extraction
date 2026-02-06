import { IsDate, IsNumber, IsString, MinLength } from 'class-validator'

export class ResetTokenDto {
	@IsString()
	token: string

	@IsNumber()
	userId: number

	@IsDate()
	expiryDate: Date
}
