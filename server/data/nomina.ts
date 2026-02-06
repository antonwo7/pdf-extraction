export default {
	fields: {
		nombreEmpresa: {
			description:
				"Nombre completo de la empresa que emite la nómina. Puede aparecer cerca del logotipo, en la parte superior o junto a los datos del trabajador. Ejemplo: 'ILUSIAK SL'.",
			title: 'Empresa'
		},
		cifEmpresa: {
			description:
				"Número de identificación fiscal (CIF) de la empresa. Aparece cerca del nombre de la empresa. Ejemplo: 'B42673095'.",
			title: 'CIF de empresa'
		},
		nombreTrabajador: {
			description:
				"Nombre completo del trabajador que recibe la nómina. Suele aparecer como 'NOMBRE:' seguido del nombre. Ejemplo: 'BABESHKA, ANTON'.",
			title: 'Nombre de trabajador'
		},
		nifTrabajador: {
			description:
				"Número de identificación fiscal del trabajador. Suele estar junto al nombre bajo la etiqueta 'NIF:'. Ejemplo: 'Y8795465A'.",
			title: 'NIF de trabajador'
		},
		categoriaProfesional: {
			description:
				"Categoría profesional o puesto del trabajador. Puede aparecer como 'Puesto de Trabajo', 'Categoría Profesional' o dentro de una tabla. Ejemplo: 'Desarrollador'.",
			title: 'Categoría profesional'
		},
		periodoNomina: {
			description:
				"Mes y año al que corresponde la nómina. Busca frases como 'Periodo de Liquidación' o fechas como '01 01 2025 al 31 01 2025'.",
			title: 'Periodo nómina'
		},
		salarioBruto: {
			description:
				"Suma total devengada antes de aplicar deducciones. Puede figurar como 'Total Devengos' o estar indicada por la suma de conceptos brutos.",
			title: 'Salario bruto'
		},
		salarioNeto: {
			description:
				"Cantidad final que recibe el trabajador tras deducciones. Busca valores cercanos a 'Líquido' o 'Remuneración Total'.",
			title: 'Salario neto'
		},
		totalDeducciones: {
			description:
				"Suma total de todas las deducciones. Puede estar bajo 'Total Desc' o cerca de la sección de deducciones como IRPF, SS, etc.",
			title: 'Total deducciones'
		},
		irpf: {
			description:
				"Cantidad retenida por concepto de IRPF (Impuesto sobre la Renta). Busca expresiones como 'RETENCION IRPF' y un porcentaje con importe.",
			title: 'IRPF'
		},
		seguridadSocial: {
			description:
				"Importe total aportado por el trabajador a la Seguridad Social. Aparece como 'DTO. CONT. COMUNES' o 'Seguridad Social'.",
			title: 'Seguridad Social'
		},
		fechaPago: {
			description:
				"Fecha en la que se realizó el pago. Puede estar al final del documento con frases como '31 de Enero de 2025'.",
			title: 'Fecha de pago'
		}
	},
	textBegin: `Extrae y devuelve los datos de esta nómina **exclusivamente en formato JSON**.  
		⚠️ Devuelve **solo el JSON** — sin ninguna explicación, sin texto adicional, sin encabezados ni comentarios.

		Usa esta estructura exacta (si un dato no está presente, deja una cadena vacía):

		{
		"nombreEmpresa": "",
		"cifEmpresa": "",
		"nombreTrabajador": "",
		"nifTrabajador": "",
		"categoriaProfesional": "",
		"periodoNomina": "",
		"salarioBruto": "",
		"salarioNeto": "",
		"totalDeducciones": "",
		"irpf": "",
		"seguridadSocial": "",
		"fechaPago": ""
		}

		Ahora analiza el siguiente texto y extrae los datos:

		----------------------------------------
		`,
	textEnd: `
		----------------------------------------
		Repite solo el objeto JSON anterior con los valores extraídos del documento.`
}
