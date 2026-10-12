import { centuryBucketStart, formatYear, formatYearRange } from './year'

export interface Scale {
  toX: (year: number) => number
  totalWidth: number
  ticks: { x: number; label: string }[]
}

const PIXELS_PER_STEP = 140
const PIXELS_PER_ERA = 260

// Diepe tijd: eigen schaal per tijdperk, anders verdwijnt de hele menselijke
// geschiedenis op één pixel naast de oerknal (zie SPEC risico 2).
export const ERAS = [
  { label: 'Oerknal', start: -13_800_000_000 },
  { label: 'Aarde ontstaat', start: -4_600_000_000 },
  { label: 'Prehistorie', start: -10_000 },
  { label: 'Geschiedenis', start: -3000 },
]

const DEEP_TIME_THRESHOLD = -10_000

function niceStep(span: number): number {
  const steps = [10, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 25000, 50000, 100000]
  for (const step of steps) {
    if (span / step <= 12) return step
  }
  return steps[steps.length - 1]
}

function buildLinearScale(minYear: number, maxYear: number): Scale {
  const span = Math.max(maxYear - minYear, 100)
  const step = niceStep(span)
  const domainStart = Math.floor(minYear / step) * step - step
  const domainEnd = Math.ceil(maxYear / step) * step + step
  const numSteps = Math.round((domainEnd - domainStart) / step)

  const toX = (year: number) => ((year - domainStart) / step) * PIXELS_PER_STEP

  const ticks = []
  for (let y = domainStart; y <= domainEnd; y += step) {
    ticks.push({ x: toX(y), label: formatYear(y) })
  }

  return { toX, totalWidth: numSteps * PIXELS_PER_STEP, ticks }
}

function buildEraScale(maxYear: number): Scale {
  const currentYear = new Date().getFullYear()
  const segments = ERAS.map((era, i) => ({
    label: era.label,
    start: era.start,
    end: i + 1 < ERAS.length ? ERAS[i + 1].start : Math.max(maxYear, currentYear),
  }))

  const toX = (year: number) => {
    let index = segments.findIndex((s) => year < s.end)
    if (index === -1) index = segments.length - 1
    const seg = segments[Math.max(index, 0)]
    const fraction = (year - seg.start) / (seg.end - seg.start)
    const segIndex = segments.indexOf(seg)
    return segIndex * PIXELS_PER_ERA + Math.min(Math.max(fraction, 0), 1) * PIXELS_PER_ERA
  }

  const ticks = segments.map((seg, i) => ({ x: i * PIXELS_PER_ERA, label: seg.label }))

  return { toX, totalWidth: segments.length * PIXELS_PER_ERA, ticks }
}

export function buildScale(minYear: number, maxYear: number): Scale {
  if (minYear < DEEP_TIME_THRESHOLD) return buildEraScale(maxYear)
  return buildLinearScale(minYear, maxYear)
}

export function getGroupLabel(year: number): { key: string; label: string } {
  if (year < DEEP_TIME_THRESHOLD) {
    const era = [...ERAS].reverse().find((e) => year >= e.start) ?? ERAS[0]
    return { key: era.label, label: era.label }
  }
  const bucket = centuryBucketStart(year)
  return { key: String(bucket), label: formatYearRange(bucket, null, 'century') }
}

export function getYearRange(years: number[]): { min: number; max: number } {
  if (years.length === 0) {
    return { min: -600, max: new Date().getFullYear() }
  }
  return { min: Math.min(...years), max: Math.max(...years) }
}
