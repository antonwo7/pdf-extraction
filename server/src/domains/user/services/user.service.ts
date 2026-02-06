import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/common/services/prisma.service'
import { hash } from 'argon2'
import { RegistrationDto } from 'src/auth/dto/registration.dto'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getById(id: number) {
		return this.prisma.user.findUnique({
			where: {
				id
			},
			select: {
				id: true,
				username: true,
				role: true
			}
		})
	}

	async getByEmail(email: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				email
			}
		})

		if (!user) return null
		return user
	}

	async create(dto: RegistrationDto) {
		const user = {
			...dto,
			password: await hash(dto.password)
		}

		return this.prisma.user.create({
			data: user
		})
	}
}
