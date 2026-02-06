import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { DocumentController } from './controllers/document.controller'
import { SharepointWebhookController } from './controllers/sharepoint-webhook.controller'

import { DocumentService } from './services/document.service'
import { DocumentRepository } from './repositories/document.repository'

import { ShareService } from 'src/common/services/share.service'
import { OpeAIService } from 'src/common/services/openai.service'
import { LoggerService } from 'src/common/services/logger.service'
import { PrismaService } from 'src/common/services/prisma.service'
import { ErrorService } from 'src/common/services/error.service'
import { TikTokenService } from 'src/common/services/tictokenservice'
import { OcrJobsClientService } from 'src/common/services/ocr-jobs-client.service'
import { ConfigService } from '@nestjs/config'
import { DocumentGateway } from './gateways/document.gateway'

@Module({
  imports: [HttpModule],
  controllers: [DocumentController, SharepointWebhookController],
  providers: [
    DocumentService,
    DocumentRepository,
    ShareService,
    OpeAIService,
    LoggerService,
    PrismaService,
    ErrorService,
    TikTokenService,
    OcrJobsClientService,
    ConfigService,
    DocumentGateway
  ],
  exports: [DocumentService, DocumentRepository],
})
export class DocumentModule {}
