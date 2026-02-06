import { Injectable } from '@nestjs/common'
import { encoding_for_model } from 'tiktoken'

@Injectable()
export class TikTokenService {
	constructor() {}

	trimTextToMaxTokens(text: string, maxTokens: number = 16385): string {
		const enc = encoding_for_model('gpt-3.5-turbo')
		const tokens = enc.encode(text)

		if (tokens.length <= maxTokens) {
			return text
		}

		const trimmedTokens = tokens.slice(0, maxTokens)
		return Buffer.from(enc.decode(trimmedTokens)).toString('utf-8')
	}

	countTokens(text: string) {
		const enc = encoding_for_model('gpt-3.5-turbo')
		const tokens = enc.encode(text)
		return tokens.length
	}
}
