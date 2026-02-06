import { Body, Controller, Get, Post } from '@nestjs/common'
import { UserService } from './services/user.service'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { Role } from '@prisma/client'
import { UserSettingService } from './services/user-setting.service'
import { UpdateUserSettingDto } from './dto/update-user-setting.dto'

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly userSettingService: UserSettingService
	) {}

	@Get()
	@Auth(Role.client, Role.admin)
	async profile(@CurrentUser('id') id: number) {
		return this.userService.getById(id)
	}

	@Get('/settings')
	@Auth(Role.client, Role.admin)
	async GetAllUserSettings(@CurrentUser('id') userId: number) {
		return this.userSettingService.getAll(userId)
	}

	@Post('/settings')
	@Auth(Role.client, Role.admin)
	async UpdateUserSettings(
		@Body() dto: UpdateUserSettingDto,
		@CurrentUser('id') userId: number
	) {
		return this.userSettingService.update(userId, dto)
	}
}
