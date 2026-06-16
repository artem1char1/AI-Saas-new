import { config } from '@/shared/config'
import { getAccessToken } from '@/shared/api/authToken'

import { ApiError, parseApiError } from './errors'
import {
  handleUnauthorized,
  markBackendAvailable,
  reportApiError,
  type ReportOptions,
} from './errorReporter'

type RequestOptions = Omit<RequestInit, 'body'> &
  ReportOptions & {
    body?: unknown
    skipAuth?: boolean
    skipAuthRetry?: boolean
  }

type AuthHandlers = {
  refresh: () => Promise<boolean>
}

let authHandlers: AuthHandlers | null = null
let refreshPromise: Promise<boolean> | null = null

export function setAuthHandlers(handlers: AuthHandlers | null): void {
  authHandlers = handlers
}

async function tryRefreshToken(): Promise<boolean> {
  if (!authHandlers) {
    return false
  }

  if (!refreshPromise) {
    refreshPromise = authHandlers.refresh().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

async function throwApiError(
  response: Response,
  options: RequestOptions,
  triggerUnauthorized = false,
): Promise<never> {
  const { message, code } = await parseApiError(response)
  const error = ApiError.fromStatus(response.status, message, code)

  if (triggerUnauthorized && error.kind === 'unauthorized') {
    await handleUnauthorized()
  }

  reportApiError(error, options)
  throw error
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    body,
    headers,
    skipAuth = false,
    skipAuthRetry = false,
    suppressToast = false,
    ...rest
  } = options

  const requestHeaders = new Headers(headers)
  requestHeaders.set('Content-Type', 'application/json')

  if (!skipAuth) {
    const accessToken = getAccessToken()
    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`)
    }
  }

  let response: Response

  try {
    response = await fetch(`${config.apiUrl}${endpoint}`, {
      ...rest,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    const error = ApiError.network()
    reportApiError(error, { suppressToast })
    throw error
  }

  if (
    response.status === 401 &&
    !skipAuth &&
    !skipAuthRetry &&
    authHandlers
  ) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      return apiFetch<T>(endpoint, { ...options, skipAuthRetry: true })
    }

    return throwApiError(response, options, true)
  }

  if (!response.ok) {
    const triggerUnauthorized = response.status === 401 && !skipAuth
    return throwApiError(response, options, triggerUnauthorized)
  }

  markBackendAvailable()

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
