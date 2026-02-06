import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt.guard'

export const JWT = () => UseGuards(JwtAuthGuard)
