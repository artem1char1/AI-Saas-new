import { useCallback, useEffect, useState } from 'react'

import { fetchDealFollowups, generateFollowup, type AiFollowupListItem } from '@/entities/ai-followup'
import { useToast } from '@/features/toast'
import { useI18n } from '@/shared/lib/i18n'

import styles from './DealAiFollowup.module.css'

type DealAiFollowupProps = {
  dealId: string
  embedded?: boolean
}

type ViewState = 'idle' | 'loading' | 'success' | 'error'

export function DealAiFollowup({ dealId, embedded = false }: DealAiFollowupProps) {
  const { t } = useI18n()
  const { showToast } = useToast()

  const [latestFollowup, setLatestFollowup] = useState<AiFollowupListItem | null>(null)
  const [viewState, setViewState] = useState<ViewState>('idle')
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [copyLabel, setCopyLabel] = useState(t('deals.aiFollowup.copy'))

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const items = await fetchDealFollowups(dealId)
      setLatestFollowup(items[0] ?? null)
      setViewState(items[0] ? 'success' : 'idle')
    } catch {
      setLatestFollowup(null)
      setViewState('idle')
    } finally {
      setIsLoadingHistory(false)
    }
  }, [dealId])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const handleGenerate = async () => {
    setViewState('loading')

    try {
      const created = await generateFollowup(dealId)
      setLatestFollowup({
        id: created.id,
        result_text: created.result_text,
        status: created.status,
        created_at: created.created_at,
      })
      setViewState('success')
      showToast({
        type: 'success',
        title: t('deals.aiFollowup.generatedToast'),
      })
    } catch {
      setViewState('error')
      showToast({
        type: 'error',
        title: t('deals.aiFollowup.errorToast'),
      })
    }
  }

  const handleCopy = async () => {
    if (!latestFollowup?.result_text) return

    try {
      await navigator.clipboard.writeText(latestFollowup.result_text)
      setCopyLabel(t('deals.aiFollowup.copied'))
      window.setTimeout(() => setCopyLabel(t('deals.aiFollowup.copy')), 2000)
    } catch {
      showToast({
        type: 'error',
        title: t('deals.aiFollowup.copyError'),
      })
    }
  }

  const isGenerating = viewState === 'loading'

  const body = (
    <div className={styles.box}>
      {!embedded && <p className="muted">{t('deals.aiFollowup.description')}</p>}

      <button
        type="button"
        className="button buttonPrimary"
        onClick={() => void handleGenerate()}
        disabled={isGenerating || isLoadingHistory}
      >
        {isGenerating ? t('deals.aiFollowup.generating') : t('deals.aiFollowup.generate')}
      </button>

      {isGenerating && (
        <p className={styles.status} role="status">
          {t('deals.aiFollowup.loading')}
        </p>
      )}

      {!isGenerating && latestFollowup && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <h3>{t('deals.aiFollowup.latest')}</h3>
            <button type="button" className="button buttonSecondary" onClick={() => void handleCopy()}>
              {copyLabel}
            </button>
          </div>
          <p className={styles.resultText}>{latestFollowup.result_text}</p>
        </div>
      )}

      {!isGenerating && !isLoadingHistory && viewState === 'error' && !latestFollowup && (
        <p className={styles.error}>{t('deals.aiFollowup.errorHint')}</p>
      )}
    </div>
  )

  if (embedded) {
    return body
  }

  return (
    <section className="card">
      <div className="cardHeader">
        <h2>{t('deals.aiFollowup.title')}</h2>
      </div>
      <div className="cardBody">{body}</div>
    </section>
  )
}
