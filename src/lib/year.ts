import type { DatePrecision } from '../types/item'

export interface ParsedYear {
  year_start: number
  year_end: number | null
  date_precision: DatePrecision
}

/**
 * Snelle jaartal-invoer: "-500", "500 v.Chr.", "1618", "1600s".
 * "1600s" → eeuw als het getal op 00 eindigt (1600s = 17e eeuw),
 * anders decennium (1980s = 1980-1989).
 */
export function parseYear(input: string): ParsedYear | null {
  let text = input.trim().toLowerCase()
  if (!text) return null

  let forcedCentury = false
  if (text.startsWith('ca.') || text.startsWith('ca ') || text.startsWith('~')) {
    text = text.replace(/^(ca\.?|~)\s*/, '')
    forcedCentury = true
  }

  const bcMatch = text.match(/^(\d+)\s*v\.?\s*chr\.?$/)
  if (bcMatch) {
    const year = -Number(bcMatch[1])
    return { year_start: year, year_end: null, date_precision: forcedCentury ? 'century' : 'exact' }
  }

  const adMatch = text.match(/^(\d+)\s*n\.?\s*chr\.?$/)
  if (adMatch) {
    const year = Number(adMatch[1])
    return { year_start: year, year_end: null, date_precision: forcedCentury ? 'century' : 'exact' }
  }

  const decadeMatch = text.match(/^(-?\d+)s$/)
  if (decadeMatch) {
    const year = Number(decadeMatch[1])
    const isCentury = year % 100 === 0
    const span = isCentury ? 99 : 9
    return {
      year_start: year,
      year_end: year + span,
      date_precision: isCentury ? 'century' : 'decade',
    }
  }

  const rangeMatch = text.match(/^(-?\d+)\s*(?:-|tot|–)\s*(-?\d+)$/)
  if (rangeMatch) {
    return {
      year_start: Number(rangeMatch[1]),
      year_end: Number(rangeMatch[2]),
      date_precision: 'exact',
    }
  }

  const plainMatch = text.match(/^-?\d+$/)
  if (plainMatch) {
    return {
      year_start: Number(plainMatch[0]),
      year_end: null,
      date_precision: forcedCentury ? 'century' : 'exact',
    }
  }

  return null
}

export function centuryBucketStart(year: number): number {
  return Math.floor(year / 100) * 100
}

export function formatYear(year: number): string {
  if (year < 0) return `${-year} v.Chr.`
  return `${year}`
}

export function formatYearRange(
  yearStart: number,
  yearEnd: number | null,
  precision: DatePrecision,
): string {
  if (precision === 'century') {
    const centuryStart = Math.floor((yearStart < 0 ? yearStart - 99 : yearStart) / 100) + 1
    const suffix = yearStart < 0 ? ' v.Chr.' : ''
    const label = yearStart < 0 ? -centuryStart : centuryStart
    return `${label}e eeuw${suffix}`
  }

  if (yearEnd === null || yearEnd === yearStart) {
    return `ca. ${formatYear(yearStart)}`
  }

  return `${formatYear(yearStart)} tot ${formatYear(yearEnd)}`
}
