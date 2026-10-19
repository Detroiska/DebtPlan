const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatMoney(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return '—'
  return moneyFormatter.format(parsed)
}

export function formatPercent(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return '—'
  return `${parsed.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} %`
}

export function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(isoDate) {
  if (typeof isoDate !== 'string' || isoDate === '') return '—'
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function pluralize(count, one, few, many) {
  const mod100 = Math.abs(count) % 100
  const mod10 = mod100 % 10
  if (mod100 >= 11 && mod100 <= 14) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

export function formatMonths(months) {
  const parsed = Number(months)
  if (!Number.isFinite(parsed) || parsed <= 0) return '—'

  const total = Math.floor(parsed)
  const years = Math.floor(total / 12)
  const rest = total % 12

  const parts = []
  if (years > 0) parts.push(`${years} ${pluralize(years, 'год', 'года', 'лет')}`)
  if (rest > 0) parts.push(`${rest} ${pluralize(rest, 'месяц', 'месяца', 'месяцев')}`)

  return parts.length > 0 ? parts.join(' ') : '—'
}

export function formatMonth(yearMonthIso) {
  if (typeof yearMonthIso !== 'string' || yearMonthIso === '') return '—'
  const date = new Date(`${yearMonthIso}-01T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
  })
}