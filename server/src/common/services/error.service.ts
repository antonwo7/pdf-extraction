import { Injectable } from '@nestjs/common'
import { InternalServerErrorException } from '@nestjs/common'
import { LoggerService } from './logger.service'

@Injectable()
export class ErrorService {
	constructor(private readonly logger: LoggerService) {}

	handleError(error: any, contextMessage: string): never {
		this.logger.error(contextMessage, error)

		if (error instanceof InternalServerErrorException) {
			throw new InternalServerErrorException(contextMessage)
		}

		throw error
	}
}
