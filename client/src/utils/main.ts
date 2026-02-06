export const apiUrl = (filePath: string) => {
	return `${process.env.NEXT_PUBLIC_API_HOST}/files/${filePath}`
}

export const basename = (url: string) => {
	const parts = url.split('/')
	return parts[parts.length - 1]
}
