export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')                 // убираем диакритику
    .replace(/\u00A0/g, ' ')           // NBSP - обычный пробел
    .replace(/[€$£]/g, '')             // убираем символы валют
    .replace(/\s+/g, ' ')              // схлопываем пробелы
    .trim()

export const normalizeNumeric = (s: string) =>
  s.replace(/\D+/g, '')                // оставляем только цифры