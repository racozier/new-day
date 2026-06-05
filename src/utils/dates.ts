export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })
}

export function formatShort(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })
}

export function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export function getQuarter(date: Date = new Date()): { quarter: number; year: number } {
  return {
    quarter: Math.floor(date.getMonth() / 3) + 1,
    year: date.getFullYear(),
  }
}

export function lastNDates(n: number): string[] {
  return Array.from({ length: n }, (_, i) => daysAgo(n - 1 - i))
}
