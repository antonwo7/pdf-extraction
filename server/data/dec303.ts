export default {
	fields: {
		cif: {
			description:
				'Identificador único de la persona o entidad para fines fiscales en España, también conocido como NIF o CIF.',
			title: 'CIF/NIF'
		},
		nombre: {
			description:
				'Nombre personal del contribuyente o representante de la empresa que presenta la declaración.',
			title: 'Nombre'
		},
		apellidos: {
			description:
				'Apellido del contribuyente que presenta la declaración fiscal.',
			title: 'Apellidos'
		},
		razonSocial: {
			description:
				'Nombre oficial registrado de la entidad jurídica o empresa en España (si se encuentra).',
			title: 'Razón social'
		},
		domicilioSocial: {
			description:
				'Dirección fiscal oficial registrada de la entidad o empresa en España.',
			title: 'Domicilio social'
		},
		periodoImpositivo: {
			description:
				'Período de tiempo al que corresponde la declaración del IVA, generalmente de un mes o trimestre.',
			title: 'Período impositivo'
		},
		baseImponible: {
			description:
				'Cantidad total de la base sobre la que se aplica el tipo impositivo del IVA en las operaciones realizadas.',
			title: 'Base imponible'
		},
		cuotaDevengada: {
			description:
				'Importe total del IVA generado en las operaciones realizadas durante el período impositivo.',
			title: 'Cuota devengada'
		},
		cuotaSoportada: {
			description:
				'Importe total del IVA soportado en las adquisiciones y gastos durante el período impositivo.',
			title: 'Cuota soportada'
		},
		liquidacion: {
			description:
				'Resultado final de la declaración de IVA, reflejando si la empresa debe pagar, devolver o compensar el IVA.',
			title: 'Liquidación'
		},
		resumenOperaciones: {
			description:
				'Resumen de las operaciones de venta y compra realizadas por la empresa durante el período, desglosado por tipo de IVA.',
			title: 'Resumen de operaciones'
		},
		saldoAFavor: {
			description:
				'Cantidad de IVA que la empresa tiene a su favor y que podrá solicitar como devolución o compensar en futuras declaraciones.',
			title: 'Saldo a favor'
		},
		importeTotal: {
			description:
				'Suma total de la deuda o crédito fiscal a favor de la empresa que se refleja en la declaración.',
			title: 'Importe total'
		},
		ingresos: {
			description:
				'Total de los ingresos obtenidos por la empresa durante el período impositivo, desde la venta de productos o servicios.',
			title: 'Ingresos'
		},
		gastos: {
			description:
				'Total de los gastos deducibles incurridos por la empresa durante el período impositivo, incluyendo compras y servicios.',
			title: 'Gastos'
		}
	},
	textBegin: `Extrae y devuelve los datos de esta Declaración de IVA modelo 303 exclusivamente en formato JSON.
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
		"importeTotal": "",
		"ingresos": "",
		"gastos": ""
	}.

	Ahora analiza el siguiente texto y extrae los datos:
	----------------------------------------

	`,
	textEnd: `----------------------------------------
	Repite únicamente el objeto JSON anterior con los valores extraídos del documento.`
}
