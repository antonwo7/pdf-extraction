import { Module } from '@nestjs/common'
import { UserService } from './services/user.service'
import { UserController } from './user.controller'
import { PrismaService } from 'src/common/services/prisma.service'
import { UserSettingService } from './services/user-setting.service'
import { LoggerService } from 'src/common/services/logger.service'
import { ErrorService } from 'src/common/services/error.service'

@Module({
	exports: [UserService, UserSettingService],
	controllers: [UserController],
	providers: [UserService, UserSettingService, PrismaService, LoggerService, ErrorService],
	imports: []
})
export class UserModule {}
