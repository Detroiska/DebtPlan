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