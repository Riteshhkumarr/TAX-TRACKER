import { format, parseISO, isValid } from 'date-fns'

/**
 * Format a number as currency
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a date string or Date object
 */
export function formatDate(date, fmt = 'MMM dd, yyyy') {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(d)) return '—'
    return format(d, fmt)
  } catch {
    return '—'
  }
}

/**
 * Format a decimal as percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0%'
  return `${Number(value).toFixed(decimals)}%`
}

/**
 * Get month name from index (0-based)
 */
export function getMonthName(monthIndex, short = true) {
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
  ]
  const shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  if (monthIndex < 0 || monthIndex > 11) return ''
  return short ? shortMonths[monthIndex] : months[monthIndex]
}

/**
 * Truncate text to maxLength with ellipsis
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format a large number with K/M/B suffixes
 */
export function formatCompact(amount) {
  if (!amount && amount !== 0) return '0'
  const absAmount = Math.abs(amount)
  if (absAmount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`
  if (absAmount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (absAmount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`
  return String(amount)
}

/**
 * Format change percentage with sign
 */
export function formatChange(value) {
  if (value === null || value === undefined || isNaN(value)) return '+0.0%'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${Number(value).toFixed(1)}%`
}
