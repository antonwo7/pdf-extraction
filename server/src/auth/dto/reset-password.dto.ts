import { IsString, MinLength } from 'class-validator'

export class ResetPasswordDto {
	@IsString()
	resetToken: string

	@MinLength(6, {
		message: 'Password must be at least 6 chars long'
	})
	@IsString()
	password: string
}
