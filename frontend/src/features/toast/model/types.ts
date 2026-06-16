export type ToastType = 'error' | 'warning' | 'success'

export type ToastItem = {
  id: string
  type: ToastType
  title: string
  message?: string
  durationMs: number
}

export type ShowToastInput = {
  type?: ToastType
  title: string
  message?: string
  durationMs?: number
}
