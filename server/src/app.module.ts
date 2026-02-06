import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './domains/user/user.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import * as path from 'path'
import { ProcessModule } from './domains/process/process.module'
import { WinstonModule } from 'nest-winston'
import { winstonConfig } from './common/config/winston.config'
import { DocumentModule } from './domains/document/document.module'

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: path.resolve(process.cwd(), 'static')
		}),
		WinstonModule.forRoot(winstonConfig),
		ConfigModule.forRoot(),
		AuthModule,
		UserModule,
		ProcessModule,
		DocumentModule
	],
	controllers: [],
	providers: [
	]
})
export class AppModule {}
