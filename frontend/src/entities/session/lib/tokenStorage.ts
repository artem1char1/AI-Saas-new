const STORAGE_KEY = 'ai_saas_auth'

export type StoredSession = {
  user: {
    id: string
    email: string
    full_name: string
    is_active: boolean
    last_login_at: string | null
  }
  tokens: {
    access_token: string
    refresh_token: string
    token_type: string
  }
}

export function loadSession(): StoredSession | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveSession(session: StoredSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getRefreshToken(): string | null {
  return loadSession()?.tokens.refresh_token ?? null
}
