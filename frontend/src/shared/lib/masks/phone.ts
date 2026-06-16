export const PHONE_DIGITS_LENGTH = 11

/** Строгий формат: +X(XXX)XXX-XX-XX */
export const PHONE_DISPLAY_REGEX = /^\+\d\(\d{3}\)\d{3}-\d{2}-\d{2}$/

export function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, PHONE_DIGITS_LENGTH)
}

/**
 * Формат: +X(XXX)XXX-XX-XX (ровно 11 цифр)
 * Пример: 79991234567 -> +7(999)123-45-67
 */
export function formatPhoneDisplay(digits: string): string {
  if (!digits) {
    return ''
  }

  let index = 0
  let result = `+${digits[index++]}`

  if (index >= digits.length) {
    return result
  }

  result += '('
  const areaEnd = Math.min(index + 3, digits.length)
  result += digits.slice(index, areaEnd)
  index = areaEnd

  if (index >= digits.length) {
    return result
  }

  result += ')'
  const blockEnd = Math.min(index + 3, digits.length)
  result += digits.slice(index, blockEnd)
  index = blockEnd

  if (index >= digits.length) {
    return result
  }

  result += '-'
  const pair1End = Math.min(index + 2, digits.length)
  result += digits.slice(index, pair1End)
  index = pair1End

  if (index >= digits.length) {
    return result
  }

  result += '-'
  const pair2End = Math.min(index + 2, digits.length)
  result += digits.slice(index, pair2End)

  return result
}

export function digitsFromStoredPhone(stored: string): string {
  return extractPhoneDigits(stored)
}

export function formatPhoneForDisplay(stored: string): string {
  if (!stored.trim()) {
    return ''
  }

  return formatPhoneDisplay(digitsFromStoredPhone(stored))
}

export function isValidPhoneDisplay(value: string): boolean {
  return PHONE_DISPLAY_REGEX.test(value)
}

export function isValidPhone(digits: string): boolean {
  if (!digits) {
    return true
  }

  if (digits.length !== PHONE_DIGITS_LENGTH) {
    return false
  }

  return isValidPhoneDisplay(formatPhoneDisplay(digits))
}

export function normalizePhone(digits: string): string | undefined {
  if (!digits) {
    return undefined
  }

  if (!isValidPhone(digits)) {
    return undefined
  }

  return `+${digits}`
}
