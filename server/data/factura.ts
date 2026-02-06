export default {
	fields: {
		destinatario: {
			description:
				"Nombre de la empresa o persona a la que se emite la factura. Puede aparecer como 'Titular' o en la parte superior del documento.",
			title: 'Destinatario'
		},
		numeroFactura: {
			description:
				"Número completo de la factura. Aparece como una cadena alfanumérica larga en el encabezado o pie del documento. Ejemplo: 'FMDVMEH021****-240513-003-E0-026-000132'.",
			title: 'Numero'
		},
		fechaFactura: {
			description:
				"Fecha en la que se emitió la factura. Busca una fecha cerca de la parte superior o junto al número de factura. Ejemplo: '13 de Mayo de 2024'.",
			title: 'Fecha',
			type: 'date'
		},
		nombreProveedor: {
			description:
				"Nombre de la empresa que emite la factura. Suele aparecer al final del documento con razón social y CIF. Ejemplo: 'Telefónica de España, S.A.U.'.",
			title: 'Proveedor'
		},
		conceptoFactura: {
			description:
				"Descripción de los servicios o productos facturados. Combina en una sola cadena. Si es demasiado larga, resume con una frase general como 'Servicios de telecomunicaciones'.",
			title: 'Concepto'
		},
		importeFactura: {
			description:
				"Importe de la factura sin impuestos (sin IVA). Busca en la línea de 'Base imponible' o subtotal.",
			title: 'Importe',
			type: 'price'
		},
		retencionGarantia: {
			description:
				'Importe o porcentaje de retención por garantía, si se especifica. Si no aparece, dejar vacío.',
			title: 'Retencion garantia',
			type: 'price'
		},
		baseImponible: {
			description:
				"Base imponible de la factura antes de impuestos. Normalmente aparece como 'Base imponible' con un importe en euros.",
			title: 'Base imponible',
			type: 'price'
		},
		iva21: {
			description:
				"Importe del IVA al 21%. Aparece junto a 'IVA (21%)' o 'IVA sobre base imponible'. Ejemplo: '6,2306 €'.",
			title: 'IVA21',
			type: 'price'
		},
		igic7: {
			description:
				'Importe del IGIC al 7% si el documento menciona Canarias o aplica esta tasa. Si no aplica, dejar vacío.',
			title: 'IGIC7',
			type: 'price'
		},
		cif: {
			description:
				"CIF o NIF del destinatario de la factura. Puede aparecer cerca del nombre del titular o en el encabezado. Ejemplo: 'Y8795****'.",
			title: 'CIF'
		},
		totalFactura: {
			description:
				"Importe total de la factura con todos los impuestos incluidos. Aparece como 'Total factura' o 'Total a pagar'.",
			title: 'Total',
			type: 'price'
		},
		suplidosSinIVA: {
			description:
				'Gastos suplidos sin IVA que puedan estar incluidos en la factura. Si no se mencionan específicamente, dejar vacío.',
			title: 'Suplidos Sin IVA',
			type: 'price'
		},
		retencionIRPF: {
			description:
				'Retención de IRPF aplicada, si está especificada en el documento. Si no aparece, dejar vacío.',
			title: 'Retencion IRPF',
			type: 'price'
		},
		fechaVencimiento: {
			description:
				"Fecha de vencimiento o de cobro del recibo. Busca frases como 'Mandaremos el recibo a partir del...'.",
			title: 'Vencimiento',
			type: 'date'
		}
	},
	textBegin: `Extrae y devuelve los datos de esta factura exclusivamente en formato JSON.  
⚠️ Devuelve solo el JSON — sin ninguna explicación, sin texto adicional, sin encabezados, comentarios ni texto antes o después.

	Para cada campo, debes devolver un objeto con esta estructura exacta:
	{
		"nombreDelCampo": {
			"value": "<valor normalizado en forma de texto>",
			"sourceText": "<fragmento exacto del documento donde aparece el dato, o cadena vacía>",
			"source_sentence": "<frase u oración del documento que contiene el fragmento anterior, o cadena vacía>"
		}
	}

	Usa exactamente esta estructura. Si algún dato no está presente en el documento, deja una cadena vacía en ese campo:

	{
		"destinatario": "",
		"numeroFactura": "",
		"fechaFactura": "",
		"nombreProveedor": "",
		"conceptoFactura": "",
		"importeFactura": "",
		"retencionGarantia": "",
		"baseImponible": "",
		"iva21": "",
		"igic7": "",
		"cif": "",
		"totalFactura": "",
		"suplidosSinIVA": "",
		"retencionIRPF": "",
		"fechaVencimiento": ""
	}

	Ahora analiza el siguiente texto y extrae los datos:`,
	textEnd: `Repite únicamente el objeto JSON anterior con los valores extraídos del documento.`
}
