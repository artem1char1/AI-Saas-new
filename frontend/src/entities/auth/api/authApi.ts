import { apiFetch } from '@/shared/api'

import type { AuthResponse, LoginRequest } from '../model/types'

export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: request,
  })
}
