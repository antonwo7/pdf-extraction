export default {
	fields: {
		numero: {
			description: 'Número de DNI',
			title: 'Número'
		},
		numeroSoporte: {
			description: 'Número de soporte',
			title: 'Soporte'
		},
		fechaValidez: {
			description: 'Fecha de validez',
			title: 'Fecha de validez',
			type: 'date'
		},
		numeroCan: {
			description: 'Número CAN',
			title: 'Número CAN'
		},
		fechaNacimiento: {
			description: 'Fecha de nacimiento',
			title: 'Fecha de nacimiento',
			type: 'date'
		},
		sexo: {
			description: 'Sexo',
			title: 'Sexo'
		},
		nacionalidad: {
			description: 'Nacionalidad',
			title: 'Nacionalidad'
		},
		nombre: {
			description: 'Nombre',
			title: 'Nombre'
		}
	},
	textBegin:
		'Extrae y devuelve los datos de este DNI en formato JSON (sin otro texto solo datos en JSON) de esta forma:',
	textEnd:
		'Si algun dato no puedes leer, entonces devuelve cadena vacia en lugar de este dato.'
}
