const EMAIL_ALLOWED_CHARS = /[^a-z0-9@._%+-]/g

export function maskEmailInput(value: string): string {
  const lower = value.toLowerCase().replace(EMAIL_ALLOWED_CHARS, '')
  const atIndex = lower.indexOf('@')

  if (atIndex === -1) {
    return lower
  }

  const local = lower.slice(0, atIndex)
  const domain = lower.slice(atIndex + 1).replace(/@/g, '')
  return `${local}@${domain}`
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) {
    return true
  }

  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(trimmed)
}

export function normalizeEmail(value: string): string {
  return maskEmailInput(value.trim())
}
