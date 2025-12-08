/**
 * Date formatting utilities for the application
 * Centralizes all date formatting logic for consistent use across the app
 */

/**
 * Format a date to dd/MM/yyyy format
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date in dd/MM/yyyy format
 */
export function formatToDDMMYYYY(date) {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  
  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const year = dateObj.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Format a date to yyyy-MM-dd format (ISO date format)
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date in yyyy-MM-dd format
 */
export function formatToYYYYMMDD(date) {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  
  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const year = dateObj.getFullYear()
  
  return `${year}-${month}-${day}`
}

/**
 * Parse a dd/MM/yyyy string to a Date object
 * @param {string} dateString - Date string in dd/MM/yyyy format
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
export function parseFromDDMMYYYY(dateString) {
  if (!dateString || !dateString.includes('/')) return null
  
  const parts = dateString.split('/')
  if (parts.length !== 3) return null
  
  const day = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1 // JavaScript months are 0-based
  const year = parseInt(parts[2])
  
  const date = new Date(year, month, day)
  
  // Validate the date
  if (isNaN(date.getTime()) || 
      date.getDate() !== day || 
      date.getMonth() !== month || 
      date.getFullYear() !== year) {
    return null
  }
  
  return date
}

/**
 * Parse a yyyy-MM-dd string to a Date object
 * @param {string} dateString - Date string in yyyy-MM-dd format
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
export function parseFromYYYYMMDD(dateString) {
  if (!dateString) return null
  
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Get today's date in dd/MM/yyyy format
 * @returns {string} - Today's date in dd/MM/yyyy format
 */
export function getTodayDDMMYYYY() {
  const today = new Date()
  return formatToDDMMYYYY(today)
}

/**
 * Get today's date in yyyy-MM-dd format
 * @returns {string} - Today's date in yyyy-MM-dd format
 */
export function getTodayYYYYMMDD() {
  const today = new Date()
  return formatToYYYYMMDD(today)
}

/**
 * Add months to a date and return in dd/MM/yyyy format
 * @param {Date|string} date - The base date
 * @param {number} months - Number of months to add (can be negative to subtract)
 * @returns {string} - New date in dd/MM/yyyy format
 */
export function addMonthsToDate(date, months) {
  if (!date || months === undefined || months === null || isNaN(months)) return ''
  
  let dateObj
  if (typeof date === 'string') {
    if (date.includes('/')) {
      dateObj = parseFromDDMMYYYY(date)
    } else {
      dateObj = parseFromYYYYMMDD(date)
    }
  } else {
    dateObj = date
  }
  
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  
  const newDate = new Date(dateObj)
  newDate.setMonth(newDate.getMonth() + months)
  
  return formatToDDMMYYYY(newDate)
}

/**
 * Validate if a string is a valid date in dd/MM/yyyy format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidDDMMYYYY(dateString) {
  if (!dateString) return false
  
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
  if (!dateRegex.test(dateString)) return false
  
  const date = parseFromDDMMYYYY(dateString)
  return date !== null
}

/**
 * Convert between date formats
 * @param {string} dateString - Input date string
 * @param {string} fromFormat - Source format ('dd/MM/yyyy' or 'yyyy-MM-dd')
 * @param {string} toFormat - Target format ('dd/MM/yyyy' or 'yyyy-MM-dd')
 * @returns {string} - Converted date string
 */
export function convertDateFormat(dateString, fromFormat, toFormat) {
  if (!dateString) return ''
  
  let dateObj
  
  if (fromFormat === 'dd/MM/yyyy') {
    dateObj = parseFromDDMMYYYY(dateString)
  } else if (fromFormat === 'yyyy-MM-dd') {
    dateObj = parseFromYYYYMMDD(dateString)
  } else {
    return dateString
  }
  
  if (!dateObj) return ''
  
  if (toFormat === 'dd/MM/yyyy') {
    return formatToDDMMYYYY(dateObj)
  } else if (toFormat === 'yyyy-MM-dd') {
    return formatToYYYYMMDD(dateObj)
  }
  
  return dateString
}

/**
 * Get date picker value (yyyy-MM-dd) from dd/MM/yyyy format
 * @param {string} ddMMyyyy - Date in dd/MM/yyyy format
 * @returns {string} - Date in yyyy-MM-dd format for date picker
 */
export function getDatePickerValue(ddMMyyyy) {
  return convertDateFormat(ddMMyyyy, 'dd/MM/yyyy', 'yyyy-MM-dd')
}

/**
 * Get display value (dd/MM/yyyy) from date picker value (yyyy-MM-dd)
 * @param {string} yyyyMMdd - Date in yyyy-MM-dd format
 * @returns {string} - Date in dd/MM/yyyy format for display
 */
export function getDisplayValue(yyyyMMdd) {
  return convertDateFormat(yyyyMMdd, 'yyyy-MM-dd', 'dd/MM/yyyy')
}

/**
 * Format date for display with fallback text
 * @param {Date|string} date - The date to format
 * @param {string} fallbackText - Text to show if date is invalid
 * @returns {string} - Formatted date or fallback text
 */
export function formatDateWithFallback(date, fallbackText = 'לא נקבע') {
  if (!date) return fallbackText
  
  const formatted = formatToDDMMYYYY(date)
  return formatted || fallbackText
}

/**
 * Compare two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} - -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1, date2) {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  
  if (!d1 || !d2 || isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
  
  if (d1 < d2) return -1
  if (d1 > d2) return 1
  return 0
}

/**
 * Check if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean} - True if the date is today
 */
export function isToday(date) {
  if (!date) return false
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return false
  
  const today = new Date()
  return dateObj.toDateString() === today.toDateString()
}

/**
 * Check if a date is in the past
 * @param {Date|string} date - The date to check
 * @returns {boolean} - True if the date is in the past
 */
export function isPastDate(date) {
  if (!date) return false
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!dateObj || isNaN(dateObj.getTime())) return false
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dateObj.setHours(0, 0, 0, 0)
  
  return dateObj < today
}

/**
 * Check if a date is in the future
 * @param {Date|string} date - The date to check (supports dd/MM/yyyy format)
 * @returns {boolean} - True if the date is in the future
 */
export function isFutureDate(date) {
  if (!date) return false
  
  let dateObj
  if (typeof date === 'string') {
    // Try parsing as dd/MM/yyyy format first
    if (date.includes('/')) {
      dateObj = parseFromDDMMYYYY(date)
    } else {
      // Try standard Date parsing
      dateObj = new Date(date)
    }
  } else {
    dateObj = date
  }
  
  if (!dateObj || isNaN(dateObj.getTime())) return false
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dateObj.setHours(0, 0, 0, 0)
  
  return dateObj > today
}
