import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  console.warn('NEXT_PUBLIC_API_URL is not set')
}

export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})
