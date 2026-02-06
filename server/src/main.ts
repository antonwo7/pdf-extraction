import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import config from '../config'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const server = app.getHttpServer()
	server.timeout = 2400000

	app.setGlobalPrefix('api')
	app.use(cookieParser())
	app.enableCors({
		origin: [config.appUrl],
		credentials: true,
		exposedHeaders: ['set-cookie', 'extension']
	})
	await app.listen(config.serverPort)
}

bootstrap()
