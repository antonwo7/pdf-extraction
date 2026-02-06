import { ChatCompletionCreateParams } from 'openai/resources'
import factura from 'data/factura'
import dni from 'data/dni'
import nomina from 'data/nomina'
import dec303 from 'data/dec303'
import escrituraHipoteca from 'data/escritura'
import dec390 from 'data/dec390'
import denuncia from 'data/denuncia'

export const dataMap = {
	escritura: escrituraHipoteca,
	factura: factura,
	dni: dni,
	nomina: nomina,
	dec303: dec303,
	dec390: dec390,
	denuncia: denuncia
}

const fileTypeQuery = `Aqui tienes el texto extraido de un documento:
						
						Determina el tipo de este documento. Elige una opcion de la lista:
                        1. Factura. Devuelve la palabra 'factura'.
                        2. DNI. Devuelve la palabra 'dni'.
                        3. Certificado energético. Devuelve la palabra 'energyCertificate'.
                        4. Nomina. Devuelve la palabra 'nomina'.
						5. Escritura de Hipoteca. Devuelve la palabra 'escritura'.
                        
                        Si no puedes determinar el tipo de este documento eligiendo una opcion de la lista, entonces devuelve la palabra 'unknown'.`

const getFileTypeQuery = (text: string): string | false => {
	const textBegin = 'Aquí tienes la primera parte del texto extraído de un documento: '
	const textEnd = `
					Determina el tipo de este documento. 
					Elige **solo una** opción de esta lista y responde **únicamente con esa palabra, sin ningún otro texto**:
                        - factura
						- dni
						- energyCertificate
						- nomina
						- escritura
						- denuncia
                        
                    Si no puedes determinar el tipo, responde únicamente: unknown.
					IMPORTANTE: La respuesta debe ser solo una de las palabras anteriores. No expliques nada. No añadas texto adicional. Solo una palabra.`

	const query = `${textBegin}

        -----------------------------
		${text}
		-----------------------------
	
        ${textEnd}
    `

	return query
}

const getQuery = (type: string): string | false => {
	if (!dataMap[type]) return false

	const textBegin = dataMap[type]['textBegin']
	const textEnd = dataMap[type]['textEnd']
	const fields = dataMap[type]['fields']

	let text = `${textBegin}
        {
            `

	for (let field in fields)
		text += `"${field}": "${fields[field]['description']}",
        `

	text += `}.`

	text += `
        ${textEnd}
    `

	return text
}

const getQueryByText = (type: string, text: string): string | false => {
	if (!dataMap[type]) return false

	const textBegin = `
		${text}. \n\r
		${dataMap[type]['fullTextBegin']}
	`

	const textEnd = dataMap[type]['textEnd']
	const fields = dataMap[type]['fields']

	let query = `${textBegin}
        {
            `

	for (let field in fields)
		query += `  "${field}": {
			"value": "<${fields[field]['description']}>",
			"sourceText": "<fragmento exacto del documento donde aparece el dato, o cadena vacía>",
			"source_sentence": "<frase u oración del documento que contiene el fragmento anterior, o cadena vacía>"
		}`

	query += `}.`

	query += `
        ${textEnd}
    `

	return query
}

export default {
	getQuery,
	getQueryByText,
	fileTypeQuery,
	dataMap,
	getFileTypeQuery
}
