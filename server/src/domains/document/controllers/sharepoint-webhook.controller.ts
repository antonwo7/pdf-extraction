import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { DocumentService } from '../services/document.service'
import { LoggerService } from 'src/common/services/logger.service'
import { GraphSubscriptionRequestBody } from '../dto/sharepoint-webhook.dto'
import { ShareService } from 'src/common/services/share.service'

/**
 * Controller that receives Microsoft Graph webhook notifications
 * for SharePoint file changes (new/updated items).
 */
@Controller('sharepoint/webhook')
export class SharepointWebhookController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly logger: LoggerService,
    private readonly shareService: ShareService,
  ) {}

  /**
   * Simple GET handler for manual testing in browser:
   * https://<ngrok>/sharepoint/webhook?validationToken=TEST
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async validateGet(@Query('validationToken') validationToken?: string): Promise<string> {
    if (validationToken) {
      this.logger.info(
        `Received validationToken via GET from Microsoft Graph (or browser): ${validationToken}`,
      )
      return validationToken
    }

    return 'OK'
  }

  /**
   * Main webhook endpoint that receives both:
   * - subscription validation (POST with validationToken query param)
   * - real change notifications.
   */
  @Post()
  async handleNotifications(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: GraphSubscriptionRequestBody,
    @Headers('validation-token') headerValidationToken?: string,
  ): Promise<void> {
    const startedAt = Date.now()

    // 1) Subscription validation via POST ?validationToken=...
    const queryValidationToken = req.query.validationToken as string | undefined

    if (queryValidationToken) {
      this.logger.info(
        `Received validationToken via POST query from Microsoft Graph: ${queryValidationToken}`,
      )

      // IMPORTANT: must return the token as plain text within 10 seconds
      res.status(200).type('text/plain').send(queryValidationToken)
      return
    }

    // Some Graph flows may send validation token in header (just in case)
    if (headerValidationToken) {
      this.logger.info(
        `Received validation-token header from Microsoft Graph: ${headerValidationToken}`,
      )
      res.status(200).type('text/plain').send(headerValidationToken)
      return
    }

    // 2) Real notifications
    const notifications = body?.value ?? []

    if (!notifications.length) {
      this.logger.info('Received empty Graph webhook notification')
      res.sendStatus(HttpStatus.ACCEPTED)
      return
    }

    this.logger.info(
      `Received ${notifications.length} notification(s) from Microsoft Graph`,
    )

    await Promise.all(
      notifications.map((notification) =>
        this.processNotification(notification).catch((err) => {
          this.logger.error(
            `Error while processing notification for resource=${notification.resource}`,
            err,
          )
        }),
      ),
    )

    const duration = Date.now() - startedAt
		this.logger.info(`handleNotifications finished in ${duration} ms`)

    res.sendStatus(HttpStatus.ACCEPTED)
  }

  /**
   * Handle a single notification: parse driveId/itemId and start document processing.
   */
  private async processNotification(notification: any): Promise<void> {
    const { resource, changeType, clientState } = notification

    this.logger.info(
      `Processing notification: changeType=${changeType}, resource=${resource}`,
    )

    // Optional: verify clientState
    if (clientState && clientState !== 'ilusiak-secret-123') {
      this.logger.warn(
        `Skipping notification with invalid clientState: ${clientState}`,
      )
      return
    }

    // resource сейчас вида: "/drives/{driveId}/root"
    const matchRoot = resource.match(/^\/?drives\/([^/]+)\/root$/)
    if (!matchRoot) {
      this.logger.warn(`Could not parse driveId from resource: ${resource}`)
      return
    }

    const driveId = matchRoot[1]

    this.logger.info(`Drive updated: driveId=${driveId}`)

    await this.documentService.handleDriveUpdated(driveId)
  }

}
