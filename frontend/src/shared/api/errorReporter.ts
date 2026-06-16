import type { ApiError } from './errors'

export type ReportOptions = {
  suppressToast?: boolean
}

type ToastHandler = (error: ApiError) => void
type UnauthorizedHandler = () => void | Promise<void>
type BackendStatusHandler = {
  setAvailable: () => void
  setUnavailable: () => void
}

let toastHandler: ToastHandler | null = null
let unauthorizedHandler: UnauthorizedHandler | null = null
let backendStatusHandler: BackendStatusHandler | null = null

export function setToastHandler(handler: ToastHandler | null): void {
  toastHandler = handler
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

export function setBackendStatusHandler(handler: BackendStatusHandler | null): void {
  backendStatusHandler = handler
}

export function markBackendAvailable(): void {
  backendStatusHandler?.setAvailable()
}

export function markBackendUnavailable(): void {
  backendStatusHandler?.setUnavailable()
}

export async function handleUnauthorized(): Promise<void> {
  await unauthorizedHandler?.()
}

export function reportApiError(error: ApiError, options: ReportOptions = {}): void {
  if (error.isBackendUnreachable) {
    markBackendUnavailable()
    return
  }

  if (!options.suppressToast) {
    toastHandler?.(error)
  }
}
