import { config } from '@/shared/config'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
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
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}
