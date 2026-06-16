import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { ApiError } from '@/shared/api/errors'
import { setToastHandler } from '@/shared/api/errorReporter'
import { useI18n } from '@/shared/lib/i18n'

import { ToastViewport } from '../ui/ToastViewport'

import type { ShowToastInput, ToastItem } from './types'

type ToastContextValue = {
  showToast: (toast: ShowToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function getApiErrorTitle(error: ApiError, t: (key: string) => string): string {
  switch (error.kind) {
    case 'network':
      return t('errors.networkTitle')
    case 'unauthorized':
      return t('errors.unauthorizedTitle')
    case 'forbidden':
      return t('errors.forbiddenTitle')
    case 'not_found':
      return t('errors.notFoundTitle')
    case 'validation':
      return t('errors.validationTitle')
    case 'conflict':
      return t('errors.conflictTitle')
    case 'server':
      return t('errors.serverTitle')
    default:
      return t('errors.unknownTitle')
  }
}

function translateErrorCode(code: string, t: (key: string) => string): string | null {
  const key = `errors.codes.${code}`
  const translated = t(key)
  return translated === key ? null : translated
}

function isTechnicalMessage(message: string): boolean {
  return message.startsWith('API error:')
}

function getApiErrorMessage(error: ApiError, t: (key: string) => string): string {
  if (error.isBackendUnreachable) {
    return t('errors.networkMessage')
  }

  if (error.code) {
    const translated = translateErrorCode(error.code, t)
    if (translated) {
      return translated
    }
  }

  if (error.kind === 'unauthorized') {
    const normalized = error.message.toLowerCase()
    if (normalized.includes('email or password') || normalized.includes('invalid email')) {
      return t('errors.invalidCredentials')
    }
    return t('errors.sessionExpired')
  }

  if (error.kind === 'server' && isTechnicalMessage(error.message)) {
    return t('errors.serverMessage')
  }

  if (isTechnicalMessage(error.message)) {
    return t('errors.unknownMessage')
  }

  return error.message
}

type ToastProviderProps = {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { t } = useI18n()
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: ShowToastInput) => {
    const id = crypto.randomUUID()

    setToasts((current) => [
      ...current,
      {
        id,
        type: toast.type ?? 'error',
        title: toast.title,
        message: toast.message,
        durationMs: toast.durationMs ?? 5000,
      },
    ])
  }, [])

  useEffect(() => {
    setToastHandler((error: ApiError) => {
      showToast({
        type: error.kind === 'forbidden' || error.kind === 'conflict' ? 'warning' : 'error',
        title: getApiErrorTitle(error, t),
        message: getApiErrorMessage(error, t),
      })
    })

    return () => setToastHandler(null)
  }, [showToast, t])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
