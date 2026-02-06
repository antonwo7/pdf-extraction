export default {
	fields: {
		cif: {
			description:
				"Número de identificación fiscal (NIF/CIF) del declarante. Aparece como 'NIF del declarante', 'Identificación' o en el encabezado del documento.",
			title: 'CIF/NIF'
		},
		nombre: {
			description:
				'Nombre de pila del declarante o representante legal. Puede aparecer en la sección de identificación del declarante.',
			title: 'Nombre'
		},
		apellidos: {
			description:
				'Apellidos del declarante o representante legal. Aparecen junto al nombre en el bloque de identificación.',
			title: 'Apellidos'
		},
		razonSocial: {
			description:
				"Denominación social completa de la empresa declarante. Aparece como 'Razón social' o 'Denominación'.",
			title: 'Razón social'
		},
		domicilioSocial: {
			description:
				"Dirección fiscal completa registrada de la empresa o persona jurídica. Puede aparecer como 'Domicilio fiscal' o 'Domicilio social'.",
			title: 'Domicilio social'
		},
		periodoImpositivo: {
			description:
				"Ejercicio fiscal al que corresponde la declaración, generalmente un año completo. Aparece como 'Ejercicio' o 'Periodo impositivo'.",
			title: 'Período impositivo'
		},
		baseImponible: {
			description:
				'Total de las bases imponibles declaradas. Busca en tablas con el resumen anual o en apartados de liquidación.',
			title: 'Base imponible'
		},
		cuotaDevengada: {
			description:
				"IVA devengado durante el período. Aparece como 'Cuota devengada' o 'IVA repercutido'.",
			title: 'Cuota devengada'
		},
		cuotaSoportada: {
			description:
				"IVA soportado deducible durante el año. Aparece como 'Cuota soportada' o 'IVA deducible'.",
			title: 'Cuota soportada'
		},
		liquidacion: {
			description:
				"Resultado de la liquidación final: a pagar, compensar o devolver. Puede aparecer como 'Resultado de la autoliquidación'.",
			title: 'Liquidación'
		},
		resumenOperaciones: {
			description:
				"Resumen de todas las operaciones del ejercicio fiscal, clasificadas por tipo y base. Puede estar en la sección 'Resumen anual'.",
			title: 'Resumen de operaciones'
		},
		saldoAFavor: {
			description:
				"Cantidad a favor del declarante que puede compensarse en futuras declaraciones. Aparece como 'Saldo a compensar'.",
			title: 'Saldo a favor'
		},
		importeTotal: {
			description:
				'Importe total de la declaración, incluyendo el resultado final (deuda, devolución o compensación).',
			title: 'Importe total'
		}
	},

	textBegin: `Extrae y devuelve los datos de esta Declaración de IVA modelo 390 exclusivamente en formato JSON.
	⚠️ Devuelve solo el JSON — sin ninguna explicación, sin texto adicional, sin encabezados, títulos ni comentarios.

	Usa exactamente esta estructura. Si algún dato no está presente en el documento, deja una cadena vacía en ese campo:

	{
		"cif": "",
		"nombre": "",
		"apellidos": "",
		"razonSocial": "",
		"domicilioSocial": "",
		"periodoImpositivo": "",
		"baseImponible": "",
		"cuotaDevengada": "",
		"cuotaSoportada": "",
		"liquidacion": "",
		"resumenOperaciones": "",
		"saldoAFavor": "",
		"importeTotal": ""
	}

	Ahora analiza el siguiente texto y extrae los datos:
	----------------------------------------`,

	textEnd: `----------------------------------------
	Repite únicamente el objeto JSON anterior con los valores extraídos del documento.`
}
