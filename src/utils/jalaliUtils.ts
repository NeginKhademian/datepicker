
const ONE_DAY_SECONDS = 24 * 3600

export const JALALI_DAYS_LABELS: string[] = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
export const GREGORIAN_DAYS_LABELS: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export interface TodayDate {
  day: number
  month: number
  year: number
  ts: number
}

export interface JalaliMonth {
  id: number
  title: string
}

export interface JalaliDay {
  day: number
  ts: number
  weekday: string
  month: number
  year: number | string
}

export interface MonthDaysResult {
  monthName: string
  year: string
  days: JalaliDay[]
  month: number
  firstDayOfMonthWeekDay: number
}

export interface FormattedPersianDate {
  year: string
  month: string
  day: string
}

export interface CurrentDateResult {
  day: string | number
  month: string | number
  year: string | number
}


/** Returns today in UTC at 00:00 as Jalali-aligned Unix ts + Y/M/D */
export const getTodayDate = (): TodayDate => {
  const now = new Date()
  const utcMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  utcMidnight.setUTCHours(0, 0, 0, 0)

  return {
    day: utcMidnight.getUTCDate(),
    month: utcMidnight.getUTCMonth() + 1,
    year: utcMidnight.getUTCFullYear(),
    ts: Math.floor(utcMidnight.getTime() / 1000),
  }
}

/** List of 12 Persian month names */
export const getJalaliMonths = (): JalaliMonth[] => [
  { id: 1, title: 'فروردین' },
  { id: 2, title: 'اردیبهشت' },
  { id: 3, title: 'خرداد' },
  { id: 4, title: 'تیر' },
  { id: 5, title: 'مرداد' },
  { id: 6, title: 'شهریور' },
  { id: 7, title: 'مهر' },
  { id: 8, title: 'آبان' },
  { id: 9, title: 'آذر' },
  { id: 10, title: 'دی' },
  { id: 11, title: 'بهمن' },
  { id: 12, title: 'اسفند' },
]

/** Map JS weekday index (0=Sunday … 6=Saturday) to Persian name */
export const mapWeekdayToPersian = (weekdayIndex: number): string => {
  const map: Record<number, string> = {
    0: 'شنبه',
    1: 'یکشنبه',
    2: 'دوشنبه',
    3: 'سه‌شنبه',
    4: 'چهارشنبه',
    5: 'پنجشنبه',
    6: 'جمعه',
  }
  return map[weekdayIndex]
}

/** Convert a JS Date to Persian numeric strings (YYYY/MM/DD in fa-IR-u-nu-latn) */
export const formatPersianDates = (
  date: Date,
): FormattedPersianDate => {
  // embed numbering system in the locale tag
  const formatted = date.toLocaleDateString('fa-IR-u-nu-latn', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const [year, month, day] = formatted.split('/')
  return { year, month, day }
}

/** Days in a given Jalali month */
export const daysInJalaliMonth = (
  month: number,
  persianYear: number,
): number => {
  // Months 1–6 have 31, 7–11 have 30, 12 has 29 or 30 in leap years
  if (month >= 1 && month <= 6) return 31
  if (month >= 7 && month <= 11) return 30

  // month === 12
  const gregYear = persianYear + 621
  const isLeap = gregYear % 4 === 0
  return isLeap ? 30 : 29
}

/**
 * Calculate the Unix timestamp (in seconds) for
 * 1 Farvardin of {targetYear}, then offset by month/day.
 */
export const calculateBaseTimestamp = (
  targetYear: number,
  targetMonth: number,
  targetDay: number = 1,
): number => {
  const gregYear = targetYear + 621
  const isLeap = gregYear % 4 === 0
  // Farvardin 1 → March 21 or 22
  const farvardin1 = new Date(
    Date.UTC(gregYear, 2, isLeap ? 22 : 21, 0, 0, 0)
  )
  const baseTs = Math.floor(farvardin1.getTime() / 1000)

  // sum up days of months before targetMonth
  let daysOffset = 0
  for (let m = 1; m < targetMonth; m++) {
    daysOffset += daysInJalaliMonth(m, targetYear)
  }
  // then add (targetDay–1)
  return baseTs + (daysOffset + (targetDay - 1)) * ONE_DAY_SECONDS
}

/** Start-of-Jalali-month ts for any Date */
export const getStartOfJalaliMonthTimestamp = (date: Date): number => {
  const { year, month } = formatPersianDates(date)
  return calculateBaseTimestamp(+year, +month, 1)
}

/** Generate all Jalali-day objects from a given start-of-month ts */
export const generateJalaliMonthDaysFromTimestamp = (
  startOfMonthTs: number,
): { days: JalaliDay[]; month: number; year: string } => {
  const dt = new Date(startOfMonthTs * 1000)
  const { year, month } = formatPersianDates(dt)
  const persYear = +year
  const persMonth = +month
  const totalDays = daysInJalaliMonth(persMonth, persYear)
  const days: JalaliDay[] = []

  for (let i = 0; i < totalDays; i++) {
    const ts = startOfMonthTs + i * ONE_DAY_SECONDS
    const wd = new Date(ts * 1000).getUTCDay()
    days.push({
      day: i + 1,
      ts,
      weekday: mapWeekdayToPersian(wd),
      month: persMonth,
      year,
    })
  }

  return { days, month: persMonth, year }
}

/** Generate the current month’s Jalali calendar */
export const generateCurrentJalaliMonthDays = (
  inputDate: Date = new Date(),
): MonthDaysResult => {
  const startTs = getStartOfJalaliMonthTimestamp(inputDate)
  const { days, month, year } = generateJalaliMonthDaysFromTimestamp(startTs)
  const firstWeekday = new Date(startTs * 1000).getUTCDay()
  // In Jalali, Saturday is often treated as weekday 1
  const firstDayOfMonthWeekDay = ((firstWeekday + 1) % 7) || 7
  const monthName =
    getJalaliMonths().find((m) => m.id === month)?.title ?? ''

  return {
    monthName,
    year,
    days,
    month,
    firstDayOfMonthWeekDay,
  }
}

/** Shift a (year, month) by Δ months */
export const adjustJalaliMonth = (
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } => {
  let y = year
  let m = month + delta
  while (m < 1) {
    m += 12
    y--
  }
  while (m > 12) {
    m -= 12
    y++
  }
  return { year: y, month: m }
}

/** Start-of-Gregorian-month ts for any Date */
export const getStartOfGregorianMonth = (date: Date): number => {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth()
  const dt = new Date(Date.UTC(y, m, 1))
  return Math.floor(dt.getTime() / 1000)
}

/** Unified start-of-month (JALALI or GREGORIAN) */
export const getStartOfMonth = (
  date: Date,
  type: 'JALALI' | 'GREGORIAN' = 'GREGORIAN',
): number =>
  type === 'JALALI'
    ? getStartOfJalaliMonthTimestamp(date)
    : getStartOfGregorianMonth(date)

/** Today’s Y/M/D in either calendar */
export const getCurrentDate = (
  date: Date,
  type: 'JALALI' | 'GREGORIAN' = 'JALALI',
): CurrentDateResult =>
  type === 'JALALI'
    ? formatPersianDates(date)
    : {
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
    }

/** Week-day labels array by calendar */
export const getDaysLabels = (
  type: 'JALALI' | 'GREGORIAN',
): string[] =>
  type === 'JALALI'
    ? JALALI_DAYS_LABELS
    : GREGORIAN_DAYS_LABELS
