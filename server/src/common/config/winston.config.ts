import * as winston from 'winston'

import { utilities as nestWinstonModuleUtilities } from 'nest-winston'

export const winstonConfig = {
	isGlobal: true,
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.timestamp(),
				nestWinstonModuleUtilities.format.nestLike('Myofihome', {
					prettyPrint: true
				})
			)
		})
	]
}
