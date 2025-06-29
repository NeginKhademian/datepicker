const ONE_DAY_TIMESTAMP = 24 * 3600

const JALALI_DAYS_LABELS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

const GREGORIAN_DAYS_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export type JalaliDay = {
  day: number
  ts: number
  weekday: string
  month: number
  year: number | string
}
type FormatOptions = Intl.DateTimeFormatOptions & {
  numberingSystem?: string
}
interface FormattedPersianDate {
  year: string
  month: string
  day: string
}
export const getTodayDate = () => {
  const now = new Date()
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  todayUTC.setUTCHours(0, 0, 0, 0)
  return {
    day: todayUTC.getUTCDate(),
    month: todayUTC.getUTCMonth() + 1,
    year: todayUTC.getUTCFullYear(),
    ts: Math.floor(todayUTC.getTime() / 1000),
  }
}
export const getJalaliMonths = () => {
  const JALALI_MONTHS = [
    {
      id: 1,
      title: 'فروردین',
    },
    {
      id: 2,
      title: 'اردیبهشت',
    },
    {
      id: 3,
      title: 'خرداد',
    },
    {
      id: 4,
      title: 'تیر',
    },
    {
      id: 5,
      title: 'مرداد',
    },
    {
      id: 6,
      title: 'شهریور',
    },
    {
      id: 7,
      title: 'مهر',
    },
    {
      id: 8,
      title: 'آبان',
    },
    {
      id: 9,
      title: 'آذر',
    },
    {
      id: 10,
      title: 'دی',
    },
    {
      id: 11,
      title: 'بهمن',
    },
    {
      id: 12,
      title: 'اسفند',
    },
  ]
  return JALALI_MONTHS
}

export const mapWeekdayToPersian = date => {
  const WEEK_DAYS_PERSIAN = {
    یکشنبه: 1,
    دوشنبه: 2,
    سه‌شنبه: 3,
    چهارشنبه: 4,
    پنجشنبه: 5,
    جمعه: 6,
    شنبه: 0,
    1: 'یکشنبه',
    2: 'دوشنبه',
    3: 'سه‌شنبه',
    4: 'چهارشنبه',
    5: 'پنجشنبه',
    6: 'جمعه',
    0: 'شنبه',
  }
  return WEEK_DAYS_PERSIAN[date]
}
// Returns month name in Persian
export const persianMonthNameConvertor = (date: { month: number }) => {
  const month = date.month
  return month ? getJalaliMonths()[month - 1].title : ''
}

export const formatPersianDates = (
  date: Date,
  type: FormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    numberingSystem: 'latn',
  },
): FormattedPersianDate => {
  const formatted = date.toLocaleDateString('fa-IR', type)
  const [year, month, day] = formatted.split('/')

  return { year, month, day }
}

export const daysInMonth = (month, year) => {
  return {
    1: 31,
    2: 31,
    3: 31,
    4: 31,
    5: 31,
    6: 31,
    7: 30,
    8: 30,
    9: 30,
    10: 30,
    11: 30,
    12: !((year + 621) % 4) ? 30 : 29,
  }[month]
}

export const generateCurrentJalaliMonthDays = (inputDate?: Date) => {
  const date = inputDate || new Date()
  const startOfMonthTimestamp = getStartOfJalaliMonthTimestamp(date)

  const { days, month, year } = generateJalaliMonthDaysFromTimestamp(
    startOfMonthTimestamp,
  )
  const weekday = new Date(startOfMonthTimestamp * 1000).getUTCDay()

  // Adjust so Saturday = 1
  const firstDayOfMonthWeekDay = (weekday % 7) + 1
  const monthName = getJalaliMonths().find(m => m.id === month)?.title

  return {
    monthName,
    year,
    days,
    month,
    firstDayOfMonthWeekDay,
  }
}
export const adjustJalaliMonth = (
  year: number,
  month: number,
  delta: number,
) => {
  let newMonth = month + delta
  let newYear = year

  while (newMonth < 1) {
    newMonth += 12
    newYear -= 1
  }
  while (newMonth > 12) {
    newMonth -= 12
    newYear += 1
  }

  return { year: newYear, month: newMonth }
}

export const getStartOfJalaliMonthTimestamp = (date: Date) => {
  const { year, month } = formatPersianDates(date)
  return calculateBaseTimestamp(parseInt(year), parseInt(month))
}
export const generateJalaliMonthDaysFromTimestamp = (
  startOfMonthTimestamp: number,
) => {
  // Convert timestamp to Jalali year and month
  const date = new Date(startOfMonthTimestamp * 1000)
  const { year, month } = formatPersianDates(date)

  const daysInMonths = daysInMonth(parseInt(month), parseInt(year))

  const days = [] as JalaliDay[]
  for (let i = 0; i < daysInMonths; i++) {
    const dayTimestamp = startOfMonthTimestamp + i * ONE_DAY_TIMESTAMP
    const weekdayIndex = new Date(dayTimestamp * 1000).getUTCDay()
    const weekdayName = mapWeekdayToPersian(weekdayIndex)

    days.push({
      day: i + 1,
      ts: dayTimestamp,
      weekday: weekdayName,
      month: +month,
      year,
    })
  }
  return {
    days,
    month: +month,
    year,
  }
}
export const calculateBaseTimestamp = (
  targetYear: number | string,
  targetMonth: number | string,
  targetDay: number | string = 1,
): number => {
  // Convert Persian year to Gregorian year
  const gregorianYear = +targetYear + 621
  const isLeapYear = gregorianYear % 4 === 0

  // Calculate the timestamp for Farvardin 1st of the Persian year
  const farvardin1 = new Date(
    Date.UTC(gregorianYear, 2, isLeapYear ? 22 : 21, 0, 0, 0),
  ) // March 21st is Farvardin 1st in most cases
  const farvardin1Timestamp = Math.floor(farvardin1.getTime() / 1000) // Convert to seconds

  // Calculate the number of days passed from Farvardin 1st to the target month
  let daysSinceFarvardin = 0
  for (let m = 1; m < +targetMonth; m++) {
    daysSinceFarvardin += daysInMonth(m, targetYear)
  }

  // Add the days (in seconds) to Farvardin 1st timestamp
  const targetMonthTimestamp =
    farvardin1Timestamp + daysSinceFarvardin * ONE_DAY_TIMESTAMP // Add days in seconds

  // Adjust the timestamp for the specific day of the target month
  const targetDayTimestamp =
    targetMonthTimestamp + (+targetDay - 1) * ONE_DAY_TIMESTAMP

  return targetDayTimestamp
}
export const getStartOfMonth = (date: Date, type: string = 'GREGORIAN') => {
  if (type === 'JALALI') {
    const { year, month } = formatPersianDates(date)
    return calculateBaseTimestamp(year, month)
  } else {
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()
    const startOfMonth = new Date(Date.UTC(year, month, 1))
    return Math.floor(startOfMonth.getTime() / 1000) // Timestamp in seconds
  }
}
export const getStartOfGregorianMonth = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const startOfMonth = new Date(Date.UTC(year, month, 1))
  return Math.floor(startOfMonth.getTime() / 1000) // Timestamp in seconds
}

// Function to generate all days for the target Persian month

export const getCurrentDate = (date, type = 'JALALI') => {
  if (type === 'JALALI') {
    const { day, month, year } = formatPersianDates(date)
    return {
      day,
      month,
      year,
    }
  } else {
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }
  }
}

export const getDaysLabels = (type: string) => {
  if (type === 'JALALI') return JALALI_DAYS_LABELS
  else return GREGORIAN_DAYS_LABELS
}
