import { Injectable, Logger } from '@nestjs/common'
import queryConfig from 'src/common/config/chatgpt.config'
import { TikTokenService } from './tictokenservice'
import { ConfigService } from '@nestjs/config'
const OpenAI = require('openai')

@Injectable()
export class OpeAIService {
	openai: any

	constructor(private tikTokenService: TikTokenService, private readonly config: ConfigService) {
		const apiKey = this.config.get<string>('OPENAI_KEY') ?? ''

		this.openai = new OpenAI({
			apiKey
		})
	}

	async getFileType(text: string) {
		text = text.slice(0, 2000)
		const query = queryConfig.getFileTypeQuery(text)

		try {
			const response = await this.openai.chat.completions.create({
				messages: [
					{
						role: 'system',
						content: `Eres un asistente que ayuda a analizar el tipo de fichero.`
					},
					{
						role: 'user',
						content: query
					}
				],
				temperature: 0,
				model: 'gpt-3.5-turbo',
				top_p: 1,
				frequency_penalty: 0,
				presence_penalty: 0
			})

			let data = response?.choices?.[0]?.message?.content
			console.warn('Document type recieved from AI: ', data)
			if (!data) return false

			return this.cleanType(data)
		} catch (error) {
			console.error('Error al parsear JSON:', error)
			return false
		}
	}

	async analizeText(fileType: string, text: string) {
		const queryEmpty = queryConfig.getQueryByText(fileType, '')
		if (!queryEmpty) return null

		const queryEmptyLength = this.tikTokenService.countTokens(queryEmpty)

		const trimmedText = this.tikTokenService.trimTextToMaxTokens(
			text,
			16385 - queryEmptyLength - 3100
		)

		const query = queryConfig.getQueryByText(fileType, trimmedText)

		const response = await this.openai.chat.completions.create({
			messages: [
				{
					role: 'system',
					content: `Eres un asistente que ayuda a extraer los datos de Escrituras de Préstamo o Hipoteca en un formato JSON específico. `
				},
				{
					role: 'user',
					content: query
				}
			],
			temperature: 0,
			model: 'gpt-3.5-turbo',
			max_tokens: 3000,
		})

		let data = response?.choices?.[0]?.message?.content
		if (!data) return null

		console.warn('Document data from AI: ', data)

		try {
			const json = data.replace('```json', '').replace('```', '')
			const objectData = JSON.parse(json)
			if (!objectData) {
				return null
			}

			return objectData
		} catch (error) {
			console.error('Error al parsear JSON:', error)
			return null
		}
	}

	cleanType(value: string) {
		return value.replace('.', '').replace(',', '').replace(' ', '')
	}
}
