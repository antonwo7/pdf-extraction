import moment from 'moment'

export const formatDate = (date: string, format = 'DD.MM.YYYY HH:mm:ss') => {
	return moment(date, 'YYYY-MM-DD hh:mm:ss').format(format)
}
