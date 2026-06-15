export type AuthUser = {
  id: string
  email: string
  full_name: string
  is_active: boolean
  last_login_at: string | null
}

export type AuthTokens = {
  access_token: string
  refresh_token: string
  token_type: string
}

export type AuthResponse = {
  user: AuthUser
  tokens: AuthTokens
}

export type LoginRequest = {
  email: string
  password: string
}
