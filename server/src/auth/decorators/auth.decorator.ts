import { applyDecorators, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt.guard'
import { Role } from '@prisma/client'
import { Roles } from './roles.decorator'
import { RolesGuard } from '../guards/roles.guard'

export const Auth = (...roles: Role[]) => {
	return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard))
}
