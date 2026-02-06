import {
	Body,
	Controller,
	HttpCode,
	Post,
	Put,
	Req,
	Res,
	UnauthorizedException,
	UploadedFiles,
	UseInterceptors,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegistrationDto } from './dto/registration.dto'
import { Response, Request } from 'express'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { FileFieldsInterceptor } from '@nestjs/platform-express'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response
	) {
		const data = await this.authService.login(dto)
		this.authService.addResreshTokenToResponse(res, data.refreshToken)
		delete data.refreshToken
		return data
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('validate')
	async validate(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response
	) {
		const data = await this.authService.validateLogin(dto)
		return data
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('register')
	async register(
		@Body(
			new ValidationPipe({
				transform: true,
				transformOptions: {
					enableImplicitConversion: true
				}
			})
		)
		dto: RegistrationDto,
		@Res({ passthrough: true }) res: Response
	) {
		const data = await this.authService.register(dto)
		this.authService.addResreshTokenToResponse(res, data.refreshToken)
		delete data.refreshToken
		return data
	}

	@HttpCode(200)
	@Post('login/access-token')
	async getNewTokens(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const refreshTokenFromCookies =
			req.cookies[this.authService.REFRESH_TOKEN_NAME]

		if (!refreshTokenFromCookies) {
			this.authService.removeResreshTokenToResponse(res)
			throw new UnauthorizedException('Refresh token not passed')
		}

		const { refreshToken, ...response } = await this.authService.getNewTokens(
			refreshTokenFromCookies
		)

		this.authService.addResreshTokenToResponse(res, refreshToken)

		return response
	}

	@HttpCode(200)
	@Post('logout')
	async logout(@Res({ passthrough: true }) res: Response) {
		this.authService.removeResreshTokenToResponse(res)
		return true
	}
}
