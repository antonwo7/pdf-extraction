import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/domains/user/services/user.service'
import { RegistrationDto } from './dto/registration.dto'
import { LoginDto } from './dto/login.dto'
import { verify } from 'argon2'
import { Response } from 'express'
import { nanoid } from 'nanoid'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 24
	REFRESH_TOKEN_NAME = 'refreshToken'

	constructor(
		private jwt: JwtService,
		private userService: UserService,
		private configService: ConfigService
	) {}

	async login(dto: LoginDto) {
		const user = await this.validateUser(dto)
		if (!user) {
			throw new UnauthorizedException('User not found')
		}

		const { password, ...cleanUser } = user

		const tokens = this.issueTokens(cleanUser.id)

		return {
			user: cleanUser,
			...tokens
		}
	}

	async validateLogin(dto: LoginDto) {
		const user = await this.validateUser(dto)
		const { password, ...cleanUser } = user

		return {
			user: cleanUser
		}
	}

	async register(dto: RegistrationDto) {
		const oldUser = await this.userService.getByEmail(dto.email)
		if (oldUser) {
			throw new BadRequestException('User already exists')
		}

		const user = await this.userService.create(dto)

		const { password, ...cleanUser } = user

		const tokens = this.issueTokens(cleanUser.id)

		return {
			cleanUser,
			...tokens
		}
	}

	private issueTokens(userId: number) {
		const data = { id: userId }
		const accessToken = this.jwt.sign(data, {
			expiresIn: '24h'
		})
		const refreshToken = this.jwt.sign(data, {
			expiresIn: '24h'
		})

		return { accessToken, refreshToken }
	}

	async validateUser(dto: LoginDto) {
		const user = await this.userService.getByEmail(dto.email)
		if (!user) {
			throw new UnauthorizedException('User not found')
		}

		const isValid = await verify(user.password, dto.password)
		if (!isValid) {
			throw new UnauthorizedException('Invalid password')
		}

		return user
	}

	addResreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: 'localhost',
			expires: expiresIn,
			secure: true,
			sameSite: 'none'
		})
	}

	removeResreshTokenToResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: 'localhost',
			expires: new Date(0),
			secure: true,
			sameSite: 'none'
		})
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken)
		if (!result) {
			throw new UnauthorizedException('Invalid refresh token')
		}

		const user = await this.userService.getById(result.id)
		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	async getUserFromAuthenticationToken(token: string) {
		const payload: any = this.jwt.verify(token, {
			secret: this.configService.get('JWT_SECRET')
		})

		const userId = payload.id
		if (!userId) return null

		return this.userService.getById(userId)
	}
}
