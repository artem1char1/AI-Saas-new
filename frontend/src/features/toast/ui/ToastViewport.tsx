import { useEffect, useState } from 'react'

import { useI18n } from '@/shared/lib/i18n'

import type { ToastItem } from '../model/types'

import styles from './ToastViewport.module.css'

type ToastViewportProps = {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

function ToastIcon({ type }: { type: ToastItem['type'] }) {
  if (type === 'success') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )
  }

  if (type === 'warning') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
    )
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: string) => void
}) {
  const { t } = useI18n()
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLeaving(true)
      window.setTimeout(() => onDismiss(toast.id), 200)
    }, toast.durationMs)

    return () => window.clearTimeout(timer)
  }, [onDismiss, toast.durationMs, toast.id])

  const iconClass =
    toast.type === 'success'
      ? styles.iconWrapSuccess
      : toast.type === 'warning'
        ? styles.iconWrapWarning
        : styles.iconWrapError

  return (
    <div
      className={`${styles.toast} ${isLeaving ? styles.toastLeaving : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`${styles.iconWrap} ${iconClass}`}>
        <ToastIcon type={toast.type} />
      </div>
      <div className={styles.content}>
        <div className={styles.title}>{toast.title}</div>
        {toast.message && <div className={styles.message}>{toast.message}</div>}
      </div>
      <button
        type="button"
        className={styles.closeButton}
        aria-label={t('common.close')}
        onClick={() => {
          setIsLeaving(true)
          window.setTimeout(() => onDismiss(toast.id), 200)
        }}
      >
        ×
      </button>
    </div>
  )
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div className={styles.viewport}>
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
