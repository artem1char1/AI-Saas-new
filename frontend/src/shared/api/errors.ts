export type ApiErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'conflict'
  | 'server'
  | 'unknown'

type ApiErrorBody = {
  detail?: string | Array<{ msg: string }> | { code?: string; message?: string }
}

export type ParsedApiError = {
  message: string
  code?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly kind: ApiErrorKind
  readonly code?: string

  constructor(message: string, status: number, kind: ApiErrorKind, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.kind = kind
    this.code = code
  }

  get isNetwork(): boolean {
    return this.kind === 'network'
  }

  get isBackendUnreachable(): boolean {
    return this.isNetwork || this.status === 502 || this.status === 503 || this.status === 504
  }

  static network(): ApiError {
    return new ApiError('Network error', 0, 'network')
  }

  static fromStatus(status: number, message: string, code?: string): ApiError {
    if (status === 401) {
      return new ApiError(message, status, 'unauthorized', code)
    }
    if (status === 403) {
      return new ApiError(message, status, 'forbidden', code)
    }
    if (status === 404) {
      return new ApiError(message, status, 'not_found', code)
    }
    if (status === 409) {
      return new ApiError(message, status, 'conflict', code)
    }
    if (status === 422 || status === 400) {
      return new ApiError(message, status, 'validation', code)
    }
    if (status === 502 || status === 503 || status === 504) {
      return new ApiError(message, status, 'network', code)
    }
    if (status >= 500) {
      return new ApiError(message, status, 'server', code)
    }
    return new ApiError(message, status, 'unknown', code)
  }
}

function isStructuredDetail(
  detail: ApiErrorBody['detail'],
): detail is { code?: string; message?: string } {
  return typeof detail === 'object' && detail !== null && !Array.isArray(detail)
}

export async function parseApiError(response: Response): Promise<ParsedApiError> {
  try {
    const data = (await response.json()) as ApiErrorBody

    if (isStructuredDetail(data.detail)) {
      const code = typeof data.detail.code === 'string' ? data.detail.code : undefined
      const message =
        typeof data.detail.message === 'string'
          ? data.detail.message
          : code ?? `API error: ${response.status} ${response.statusText}`

      return { message, code }
    }

    if (typeof data.detail === 'string') {
      return { message: data.detail }
    }

    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return { message: data.detail.map((item) => item.msg).join(', ') }
    }
  } catch {
    // ignore json parse errors
  }

  return { message: `API error: ${response.status} ${response.statusText}` }
}

/** @deprecated Use parseApiError instead */
export async function parseApiErrorMessage(response: Response): Promise<string> {
  const parsed = await parseApiError(response)
  return parsed.message
}
