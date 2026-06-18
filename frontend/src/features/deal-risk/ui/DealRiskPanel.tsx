import { useCallback, useEffect, useState } from 'react'

import { fetchDealRisk, type DealRisk, type DealRiskLevel } from '@/entities/deal-risk'
import { DealAiFollowup } from '@/features/deal-ai-followup'
import { lastContactLabel, riskFactorLabel, useI18n } from '@/shared/lib/i18n'

import styles from './DealRiskPanel.module.css'

type DealRiskPanelProps = {
  dealId: string
  refreshKey?: string
  risk?: DealRisk | null
  isLoading?: boolean
}

const LEVEL_EMOJI: Record<DealRiskLevel, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
}

function levelBannerClass(level: string): string {
  switch (level) {
    case 'high':
      return styles.levelHigh
    case 'medium':
      return styles.levelMedium
    default:
      return styles.levelLow
  }
}

export function DealRiskPanel({
  dealId,
  refreshKey,
  risk: externalRisk,
  isLoading: externalLoading,
}: DealRiskPanelProps) {
  const { t } = useI18n()
  const [internalRisk, setInternalRisk] = useState<DealRisk | null>(null)
  const [internalLoading, setInternalLoading] = useState(externalRisk === undefined)

  const useExternal = externalRisk !== undefined
  const risk = useExternal ? externalRisk : internalRisk
  const isLoading = useExternal ? (externalLoading ?? false) : internalLoading

  const loadRisk = useCallback(async () => {
    if (useExternal) return
    setInternalLoading(true)
    try {
      const data = await fetchDealRisk(dealId)
      setInternalRisk(data)
    } catch {
      setInternalRisk(null)
    } finally {
      setInternalLoading(false)
    }
  }, [dealId, useExternal])

  useEffect(() => {
    void loadRisk()
  }, [loadRisk, refreshKey])

  const riskLevel = (risk?.risk_level ?? 'low') as DealRiskLevel
  const levelKey = `deals.riskAnalysis.levelBanner.${riskLevel}`
  const levelBannerText = t(levelKey)
  const factors = risk?.factors ?? []

  return (
    <section className={`card ${styles.panel}`}>
      <div className="cardHeader">
        <h2>{t('deals.riskAnalysis.title')}</h2>
      </div>
      <div className="cardBody">
        {isLoading && <p className="muted">{t('common.loading')}</p>}

        {!isLoading && risk?.is_closed && (
          <p className="muted">{t('deals.riskAnalysis.closedMessage')}</p>
        )}

        {!isLoading && risk && !risk.is_closed && (
          <div className={styles.content}>
            <div className={`${styles.levelBanner} ${levelBannerClass(risk.risk_level)}`}>
              <span className={styles.levelEmoji} aria-hidden>
                {LEVEL_EMOJI[riskLevel]}
              </span>
              <span className={styles.levelText}>{levelBannerText}</span>
            </div>

            <div className={styles.scoreValue}>
              {t('deals.riskAnalysis.scoreOf', { score: risk.risk_score })}
            </div>

            <div className={styles.lastContact}>
              <span className={styles.lastContactLabel}>{t('deals.riskAnalysis.lastContact')}</span>
              <span className={styles.lastContactValue}>
                {lastContactLabel(risk.days_since_last_contact, t)}
              </span>
            </div>

            {factors.length > 0 && (
              <div>
                <h3 className={styles.subtitle}>{t('deals.riskAnalysis.reasons')}</h3>
                <ul className={styles.reasonList}>
                  {factors.map((factor) => (
                    <li key={`${factor.kind}-${factor.days ?? 'x'}`}>
                      <span>{riskFactorLabel(factor, t)}</span>
                      <span className={styles.factorPoints}>
                        {t('deals.riskAnalysis.points', { points: factor.points })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {risk.next_best_action && (
              <div className={styles.nextActionBox}>
                <h3 className={styles.subtitle}>{t('deals.riskAnalysis.nextBestAction')}</h3>
                <p>{risk.next_best_action}</p>
              </div>
            )}

            <DealAiFollowup dealId={dealId} embedded />
          </div>
        )}
      </div>
    </section>
  )
}
