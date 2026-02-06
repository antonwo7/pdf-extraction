import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Roles, ROLES_KEY } from './../decorators/roles.decorator'
import { Role } from '@prisma/client'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass()
		])
		if (!requiredRoles) {
			return true
		}
		const { user } = context.switchToHttp().getRequest()
		const userHasRole = requiredRoles.some(role => user.role === role)
		if (!userHasRole) {
			throw new UnauthorizedException('Permission denied')
		}

		return true
	}
}
