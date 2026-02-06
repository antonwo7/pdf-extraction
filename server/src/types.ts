export type TGDFile = {
	name: string
	id: string
	mimeType: string
}

export type TFileMapItem = {
  initialFileName: string
  uploadedFileName: string
  type: string
  data: any | null
}

export type TFilesMap = Record<string, TFileMapItem>

export type TXlsFiles = {
	xlsDataPath: string
	xlsReportPath: string
}

export type TDownloadedFile = { path: string; name: string }

export type TFieldData = {description: string, title: string}

export type TFieldsDataObject = Record<string, TFieldData>