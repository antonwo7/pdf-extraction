import { Module } from '@nestjs/common'
import { ProcessController } from './process.controller'
import { ProcessService } from './process.service'
import { AIService } from '../../common/services/ai.service'
import { ShareService } from '../../common/services/share.service'
import { PrismaService } from 'src/common/services/prisma.service'
import { UserModule } from 'src/domains/user/user.module'
import { OpeAIService } from 'src/common/services/openai.service'
import { TikTokenService } from 'src/common/services/tictokenservice'
import { LoggerService } from 'src/common/services/logger.service'
import { ErrorService } from 'src/common/services/error.service'

@Module({
	imports: [UserModule],
	controllers: [ProcessController],
	providers: [
		PrismaService,
		ProcessService,
		AIService,
		ShareService,
		OpeAIService,
		TikTokenService,
		LoggerService, 
		ErrorService
	]
})
export class ProcessModule {}
