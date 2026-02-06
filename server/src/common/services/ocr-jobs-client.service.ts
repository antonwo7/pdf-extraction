import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { LoggerService } from './logger.service'

export type JobStatus = 'queued' | 'processing' | 'done' | 'error'
export type JobFileStatus = 'queued' | 'processing' | 'done' | 'error'

interface CreateJobFilePayload {
  externalFileId?: string
  sharepointDriveId: string
  sharepointItemId: string
}

interface CreateJobPayload {
  sourceApp?: string
  files: CreateJobFilePayload[]
  generateSearchablePdf: boolean
}

interface JobResponseDto {
  id: string
  status: JobStatus
  totalFiles: number
  processedFiles: number
}

export interface JobFileSearchablePdfMeta {
	driveId: string
	itemId: string
	fileName: string
}

interface JobFileResultDto {
  jobFileId: string
  externalFileId: string | null
  sharepointDriveId: string
  sharepointItemId: string
  status: JobFileStatus
  text?: string
  searchablePdf?: JobFileSearchablePdfMeta | null
}

interface JobResultsDto {
  jobId: string
  status: JobStatus
  totalFiles: number
  processedFiles: number
  files: JobFileResultDto[]
}

@Injectable()
export class OcrJobsClientService {
  private readonly baseUrl: string

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.baseUrl =
      this.config.get<string>('OCR_SERVICE_BASE_URL') ?? 'http://localhost:4103'
  }

  async createJobForSharepointFile(params: {
    externalFileId?: string
    sharepointDriveId: string
    sharepointItemId: string
    sourceApp?: string
    generateSearchablePdf?: boolean
  }): Promise<JobResponseDto> {
    this.logger.info(
      `Creating OCR job in OKR-service for itemId=${params.sharepointItemId}, driveId=${params.sharepointDriveId}`,
    )

    const payload: CreateJobPayload = {
      sourceApp: params.sourceApp ?? 'extraction-service',
      generateSearchablePdf: params.generateSearchablePdf ?? false,
      files: [
        {
          externalFileId: params.externalFileId,
          sharepointDriveId: params.sharepointDriveId,
          sharepointItemId: params.sharepointItemId,
        },
      ],
    }

    const { data } = await firstValueFrom(
      this.http.post<JobResponseDto>(`${this.baseUrl}/jobs`, payload),
    )

    return data
  }

  async getJobResults(jobId: string): Promise<JobResultsDto> {
    const { data } = await firstValueFrom(
      this.http.get<JobResultsDto>(`${this.baseUrl}/jobs/${jobId}/results`),
    )
    return data
  }

  /**
   * Поллинг OKR-сервиса до завершения OCR для одного файла.
   */
  async waitForSingleFileResult(
    jobId: string,
    params: {
      sharepointDriveId: string
      sharepointItemId: string
      timeoutMs?: number
      pollIntervalMs?: number
    },
  ): Promise<JobFileResultDto> {
    const { sharepointDriveId, sharepointItemId } = params
    const timeoutMs = params.timeoutMs ?? 10 * 60_000 // 10 минут
    const pollIntervalMs = params.pollIntervalMs ?? 10_000 // 10 секунд

    const deadline = Date.now() + timeoutMs

    while (true) {
      const job = await this.getJobResults(jobId)

      const file = job.files.find(
        (f) =>
          f.sharepointDriveId === sharepointDriveId &&
          f.sharepointItemId === sharepointItemId,
      )

      if (!file) {
        this.logger.warn(
          `Job ${jobId} из OKR-сервиса не содержит файл driveId=${sharepointDriveId}, itemId=${sharepointItemId}`,
        )
      }

      if (job.status === 'error' || file?.status === 'error') {
        throw new Error(
          `OCR job ${jobId} завершился с ошибкой для itemId=${sharepointItemId}`,
        )
      }

      if (job.status === 'done' && file && file.text) {
        return file
      }

      if (Date.now() > deadline) {
        throw new Error(
          `Timeout ожидания OCR job ${jobId} (itemId=${sharepointItemId})`,
        )
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
    }
  }
}
