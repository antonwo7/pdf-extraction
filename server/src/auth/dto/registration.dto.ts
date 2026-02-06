import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegistrationDto {
	@IsString()
	username: string

	@IsEmail()
	email: string

	@MinLength(6, {
		message: 'Password must be at least 6 chars long'
	})
	@IsString()
	password: string
}
