import { config } from '@/shared/config'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

type ApiErrorBody = {
  detail?: string | Array<{ msg: string }>
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorBody

    if (typeof data.detail === 'string') {
      return data.detail
    }

    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail.map((item) => item.msg).join(', ')
    }
  } catch {
    // ignore json parse errors
  }

  return `API error: ${response.status} ${response.statusText}`
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`${config.apiUrl}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
