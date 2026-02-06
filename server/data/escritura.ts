export default {
	fields: {
	  numero: {
		description: `Extrae únicamente el número de escritura del documento notarial (Escritura de Préstamo o Hipoteca).  
		📍 Este número aparece en las primeras líneas de la primera página del documento.  
		📍 Está escrito en palabras (por ejemplo, "DOS MIL SETECIENTOS TREINTA Y OCHO").  
		📍 Suele estar junto a la palabra "NUMERO" o "Número de escritura".  
		📍 Convierte el número de palabras a formato numérico: "DOS MIL SETECIENTOS TREINTA Y OCHO" → 2738.  
		📍 Ignora otros números que no sean el número de escritura, como fechas, DNIs o direcciones.  
		📌 Responde únicamente con el número en formato numérico.`,
		title: 'Nº prestamo'
	  },
	  producto: {
		description: `Indica el tipo de producto del préstamo descrito en el documento.  
		📍 Devuelve únicamente una de las siguientes opciones: "Préstamo Hipotecario" o "Préstamo Personal".  
		📍 Si el préstamo está respaldado por una garantía hipotecaria (es decir, hay una hipoteca sobre un inmueble), responde "Préstamo Hipotecario".  
		📍 Si no hay hipoteca o garantía real, responde "Préstamo Personal".  
		📌 Devuelve solo una de las dos opciones posibles.`,
		title: 'Producto'
	  },
	  titulares: {
		description: `Extrae únicamente los nombres completos de los titulares del préstamo, es decir, todas las personas físicas que intervienen como prestatarios, deudores o hipotecantes.  
		📍 Incluye también a quienes intervienen mediante representante (por ejemplo, cónyuge representado).  
		📍 Excluye notarios, representantes legales de la entidad financiera y empleados bancarios.  
		📍 Si hay varios titulares, incluye todos los nombres completos, separados por "y".  
		📍 No repitas nombres.  
		Ejemplo: "Sonsoles Gomez Jorge y Luis Miguel Gomez Funes y Sonsoles Jorge Collado"`,
		title: 'Titulares'
	  },
	  capitalInicial: {
		description: `El capital inicial es el monto total del préstamo otorgado por la entidad financiera.  
		📍 Aparece generalmente en la sección financiera del documento con frases como "capital inicial", "monto del préstamo", "importe total", "cantidad de préstamo" o "principal".  
		📍 Evita confundirlo con otros montos como intereses, cuotas, comisiones o gastos administrativos.  
		📍 Devuelve solo la cantidad exacta en formato numérico, incluyendo la moneda.  
		Ejemplo de respuesta esperada: "280,000.00"`,
		title: 'Capital inicial (€)'
	  },
	  periodo: {
		description: "Periodo total del préstamo, expresado en meses o años. Busca frases como 'plazo del préstamo', 'duración' o 'término del préstamo'.",
		title: 'Periodo'
	  },
	  carenciaTecnica: {
		description: "Indica si existe carencia técnica en el préstamo. Devuelve 'Sí' o 'No'.",
		title: 'Carencia tecnica'
	  },
	  tipoPago: {
		description: "Tipo de periodicidad del pago del préstamo: Mensual, Trimestral, Cuatrimestral, Semestral o Anual.",
		title: 'Tipo de pago'
	  },
	  tipoInteres: {
		description: "Indica si el tipo de interés aplicado al préstamo es Fijo o Variable.",
		title: 'Tipo de interés'
	  },
	  interesFijo: {
		description: "Porcentaje exacto del interés fijo, si aplica. Ejemplo: '2.75%'",
		title: 'Interés fijo (%)'
	  },
	  fechaFormalizacion: {
		description: "Fecha en la que se formaliza el préstamo. Debe estar en formato DD/MM/YYYY.",
		title: 'Resumen de operaciones'
	  },
	  fechaPrimerQuota: {
		description: "Fecha en la que se realiza el primer pago del préstamo. Debe estar en formato DD/MM/YYYY.",
		title: 'Fecha inicial (1º cuota)'
	  },
	  fechaFinal: {
		description: "Fecha final del préstamo o vencimiento de la última cuota. Busca frases como 'última cuota', 'vencimiento', etc.",
		title: 'Fecha final'
	  },
	  clausulaSuelo: {
		description: "Indica si el contrato contiene una cláusula suelo. Devuelve 'Sí' o 'No'.",
		title: 'Clausula suelo'
	  },
	  baseOrdinarios: {
		description: "Número de días base utilizados en el cálculo de intereses ordinarios: 360 o 365.",
		title: 'Base ordinarios'
	  },
	  baseDias: {
		description: "Tipo de conteo de días aplicado: Comercial (30 días por mes) o Natural (días reales del mes).",
		title: 'Base dias'
	  },
	  tipoDemora: {
		description: "Tipo de cálculo de los intereses de demora: 'TOTAL' o 'AÑADIDO AL INTERES'.",
		title: 'Tipo de demora'
	  },
	  demora: {
		description: "Porcentaje de interés aplicado en caso de demora. Ejemplo: '3.50%'",
		title: 'Demora (%)'
	  },
	  totalDemora: {
		description: "Indica si la demora aplica solo sobre el capital ('Solo capital') o sobre capital + intereses ('Capital + Intereses').",
		title: 'Total/Capital de Demora'
	  },
	  baseDiasDemora: {
		description: "Tipo de conteo de días utilizado en intereses de demora: Comercial o Natural.",
		title: 'Base dias de demora'
	  },
	  baseOrdinariosDemora: {
		description: "Número de días base usados para intereses de demora: 360 o 365.",
		title: 'Base ordinarios de demora'
	  },
	  carencia: {
		description: "Indica si el préstamo tiene periodo de carencia. Devuelve 'Sí' o 'No'.",
		title: 'Carencia'
	  }
	},
  
	textBegin: `Extrae y devuelve los datos de esta Escritura de Préstamo exclusivamente en formato JSON.  
	⚠️ Devuelve solo el JSON — sin ninguna explicación, sin texto adicional, sin encabezados, títulos ni comentarios.

	Para cada campo, debes devolver un objeto con esta estructura exacta:
	{
		"nombreDelCampo": {
			"value": "<valor normalizado en forma de texto>",
			"sourceText": "<fragmento exacto del documento donde aparece el dato, o cadena vacía>",
			"source_sentence": "<frase u oración del documento que contiene el fragmento anterior, o cadena vacía>"
		}
	}
	
	Usa exactamente esta estructura. Si algún dato no está presente en el documento, deja una cadena vacía en ese campo:`,
  
	fullTextBegin: `Aquí tienes el texto de un documento notarial tipo Escritura de Préstamo.  
	Extrae y devuelve exclusivamente los datos solicitados en formato JSON, sin explicaciones ni texto adicional.  
	Usa esta estructura exacta. Si algún dato no se encuentra, deja el valor como cadena vacía:`,
  
	textEnd: `\n\nDevuelve únicamente el objeto JSON completo con todos los valores extraídos. No añadas ningún comentario ni explicación.`
  };