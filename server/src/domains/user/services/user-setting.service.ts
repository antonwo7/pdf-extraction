import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/common/services/prisma.service'
import { UserSettingName } from '@prisma/client'
import { UpdateUserSettingDto } from '../dto/update-user-setting.dto'
import { LoggerService } from 'src/common/services/logger.service'
import { ErrorService } from 'src/common/services/error.service'

@Injectable()
export class UserSettingService {
	constructor(private prisma: PrismaService, 
		private readonly logger: LoggerService,
		private readonly errorService: ErrorService
	) {}

	async getAll(userId: number) {
		try {
			this.logger.info(`Fetching user settings...`)

			const settings = await this.prisma.userSetting.findMany({
				where: {
					userId
				},
				select: {
					id: true,
					name: true,
					value: true
				}
			})

			const settingObj = settings.reduce((acc, cur) => {
				acc[cur.name] = cur.value
				return acc
			}, {})

			if (
				!settingObj ||
				!settingObj['inputFolderId'] ||
				!settingObj['outputFolderId']
			) {
				throw new HttpException(
					'User settings are not valid',
					HttpStatus.INTERNAL_SERVER_ERROR
				)
			}

			return settingObj

		} catch (e) {
			this.errorService.handleError(e, `Could not fetch user settings`)
		}
	}

	async getByName(userId: number, name: string) {
		const settings = await this.prisma.userSetting.findMany({
			where: {
				userId,
				name: name as UserSettingName
			}
		})

		if (!settings || !settings.length) return null
		return settings[0]
	}

	async update(userId: number, dto: UpdateUserSettingDto) {
		for (let key in dto) {
			await this.prisma.userSetting.updateMany({
				data: {
					value: dto[key]
				},
				where: {
					userId,
					name: key as UserSettingName
				}
			})
		}
	}
}
