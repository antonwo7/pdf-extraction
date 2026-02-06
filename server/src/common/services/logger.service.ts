import { Injectable, Inject } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

@Injectable()
export class LoggerService {
	constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

	info(message: string) {
		this.logger.info(message)
	}

	warn(message: string) {
		this.logger.warn(message)
	}

	debug(message: string) {
		this.logger.debug(message)
	}

	error(message: string, error?: any) {
		this.logger.error(message, { stack: error?.stack })
	}
}
