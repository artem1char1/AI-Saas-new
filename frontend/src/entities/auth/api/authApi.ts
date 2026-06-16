import { apiFetch } from '@/shared/api'

import type {
  AuthResponse,
  AuthTokens,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../model/types'

export function register(request: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: request,
    skipAuth: true,
  })
}

export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: request,
    skipAuth: true,
  })
}

export function refreshToken(refresh_token: string): Promise<AuthTokens> {
  return apiFetch<AuthTokens>('/auth/refresh', {
    method: 'POST',
    body: { refresh_token },
    skipAuth: true,
    skipAuthRetry: true,
    suppressToast: true,
  })
}

export function fetchMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me')
}

export function logout(refresh_token: string): Promise<void> {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
    body: { refresh_token },
    skipAuthRetry: true,
    suppressToast: true,
  })
}
