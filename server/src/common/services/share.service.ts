import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import * as path from 'path'
import { createWriteStream, readFileSync } from 'fs'
import { nanoid } from 'nanoid'
import { LoggerService } from './logger.service'
import { ErrorService } from './error.service'
import { TDownloadedFile } from 'src/types'
import * as https from 'node:https'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ShareService {
  private graphAccessToken: string = ''
  private tokenExpirationTime: number = 0

  private clientId: string
  private clientSecret: string
  private tenantId: string

  private resource = 'offline_access https://graph.microsoft.com/.default'
  private SPscope = 'https://graph.microsoft.com/.default'
  private tokenEndpoint: string
  private readonly graphBaseUrl = 'https://graph.microsoft.com/v1.0'

  private readonly entradasDriveId: string

  private readonly http: AxiosInstance

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.clientId = this.config.get<string>('CLIENT_ID')!
    this.clientSecret = this.config.get<string>('CLIENT_SECRET')!
    this.tenantId = this.config.get<string>('TENANT_ID')!
    this.entradasDriveId = this.config.get<string>('INPUTS_DRIVE_ID')!
    this.tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`

    this.http = axios.create({
      httpsAgent: new https.Agent({
        keepAlive: true,
        maxSockets: 10,
      }),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120_000,
    })
  }

  getAccessToken = async () => {
    if (this.graphAccessToken && Date.now() < this.tokenExpirationTime) {
      return this.graphAccessToken
    }
    try {
      const response = await axios.post(
        this.tokenEndpoint,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: this.SPscope,
        }),
      )

      this.graphAccessToken = response.data.access_token
      this.tokenExpirationTime = Date.now() + response.data.expires_in * 1000

      console.log(`✅ Получен токен для Graph`)

      return this.graphAccessToken
    } catch (error: any) {
      console.error(
        'Error fetching access token:',
        error.response?.status,
        error.response?.data,
      )
      throw new Error('Error fetching access token')
    }
  }

  getFiles = async () => {
    const token = await this.getAccessToken()

    const url = `${this.graphBaseUrl}/drives/${this.entradasDriveId}/root/children`

    const res = await this.http.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    this.logger.info('✅ Получены файлы из библиотеки Entradas')

    return res.data.value
  }

  async downloadFile(
    itemId: string,
    fileName: string,
    driveId: string,
    dirPath: string,
  ): Promise<string> {
    const token = await this.getAccessToken()

    const url = `${this.graphBaseUrl}/drives/${driveId}/items/${itemId}/content`

    const fileExtension = path.extname(fileName).replaceAll('.', '')
    const filePathParseData = path.parse(fileName)

    const fullFileName =
      filePathParseData.name + '__' + nanoid(30) + '.' + fileExtension

    const fullFilePath = path.resolve(dirPath, fullFileName)

    const response = await this.http.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'stream',
    })

    const writer = createWriteStream(fullFilePath)
    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(fullFilePath))
      writer.on('error', reject)
    })
  }

  async downloadAllFiles(dirPath: string): Promise<TDownloadedFile[]> {
    try {
      this.logger.info(`Downloading files from input directory...`)

      const files = await this.getFiles()
      if (!files.length) {
        throw new Error('The input directory in sharepoint is empty')
      }

      const downloadTasks = files
        .filter((file) => file.file)
        .map(async (file) => {
          const { id, name, parentReference } = file
          const driveId = parentReference.driveId

          const path = await this.downloadFile(id, name, driveId, dirPath)

          return { path, name }
        })

      const filePaths = await Promise.all(downloadTasks)

      this.logger.info(
        `✅ Downloaded ${filePaths.length} files from input directory`,
      )

      return filePaths
    } catch (e) {
      this.errorService.handleError(
        e,
        `Could not download files from input directory`,
      )
    }
  }

  async uploadFileToOneDrive(filePath: string) {
    const fileName = path.basename(filePath)
    try {
      const token = await this.getAccessToken()
      const fileBuffer = readFileSync(filePath)

      const targetDriveInfo = await this.getTargetDriveInfo()
      if (!targetDriveInfo.driveId || !targetDriveInfo.folderPath) {
        throw new Error('La info de directorio OneDrive esta vacio')
      }

      const uploadUrl = `${this.graphBaseUrl}/drives/${targetDriveInfo.driveId}/root:/${targetDriveInfo.folderPath}/${fileName}:/content`

      const res = await this.http.put(uploadUrl, fileBuffer, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
        },
      })

      console.log(`✅ На OneDrive загружен файл ${fileName}`)

      return res.data
    } catch (error) {
      console.log(`Ошибка загрузки файла ${fileName} на OneDrive`)
    }
  }

  async getTargetDriveInfo() {
    const token = await this.getAccessToken()
    const encodedUrl =
      'u!aHR0cHM6Ly9pbHVzaWFrY29tLW15LnNoYXJlcG9pbnQuY29tL3BlcnNvbmFsL2FudG9uX2JhYmVzaGthX2lsdXNpYWtfY29tL0RvY3VtZW50cy9FeHRyYWNjaW9uL1Jlc3VsdGFkbw'

    const res = await this.http.get(
      `${this.graphBaseUrl}/shares/${encodedUrl}/driveItem`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )

    const driveId = res.data.parentReference.driveId
    const parentPath = res.data.parentReference.path // /drive/root:/Extraccion
    const name = res.data.name // Resultado

    const folderPath = parentPath.includes('root:')
      ? parentPath.split('root:')[1].replace(/^\/+/, '') + '/' + name
      : name

    return { driveId, folderPath }
  }

  async updateProcessingStatus(
    driveId: string,
    itemId: string,
    status: 'In progress' | 'Processed' | 'Failed',
  ): Promise<void> {
    try {
      const token = await this.getAccessToken()

      const url = `${this.graphBaseUrl}/drives/${driveId}/items/${itemId}/listItem/fields`

      const body = {
        Estado: status,
      }

      await this.http.patch(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      this.logger.info(
        `SharePoint Estado updated to "${status}" for driveId=${driveId}, itemId=${itemId}`,
      )
    } catch (e) {
      this.errorService.handleError(
        e,
        `Could not update Estado for driveId=${driveId}, itemId=${itemId}`,
      )
      throw e
    }
  }

  async downloadFileByIds(
    driveId: string,
    itemId: string,
    fileName: string,
    dirPath: string,
  ): Promise<{ path: string; name: string }> {
    try {
      const filePath = await this.downloadFile(itemId, fileName, driveId, dirPath)

      this.logger.info(
        `File downloaded via downloadFileByIds: driveId=${driveId}, itemId=${itemId}, localPath=${filePath}`,
      )

      return {
        path: filePath,
        name: fileName,
      }
    } catch (e) {
      this.errorService.handleError(
        e,
        `Could not download file via downloadFileByIds for driveId=${driveId}, itemId=${itemId}`,
      )
    }
  }

  async getFileMetadata(
    driveId: string,
    itemId: string,
  ): Promise<{
    id: string
    name: string
    size?: number
    webUrl?: string
    file?: { mimeType?: string }
    parentReference?: { id?: string; driveId?: string; path?: string }
  }> {
    try {
      const token = await this.getAccessToken()
      const url = `${this.graphBaseUrl}/drives/${driveId}/items/${itemId}`

      const res = await this.http.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = res.data

      return {
        id: data.id,
        name: data.name,
        size: data.size,
        webUrl: data.webUrl,
        file: data.file,
        parentReference: data.parentReference,
      }
    } catch (e) {
      this.errorService.handleError(
        e,
        `Could not fetch file metadata for driveId=${driveId}, itemId=${itemId}`,
      )
    }
  }
}
