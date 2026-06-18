type TranslateFn = (key: string, params?: Record<string, string | number>) => string

export function activityTypeLabel(type: string, t: TranslateFn): string {
  const normalized = type.trim().toLowerCase()
  const key = `activities.types.${normalized}`
  const translated = t(key)
  return translated === key ? type : translated
}

type RiskFactorLike = {
  kind: string
  points: number
  days?: number | null
}

export function riskFactorLabel(factor: RiskFactorLike, t: TranslateFn): string {
  const key = `deals.riskAnalysis.factors.${factor.kind}`
  const params = factor.days != null ? { days: factor.days } : undefined
  const translated = t(key, params)
  return translated === key ? factor.kind : translated
}

export function lastContactLabel(days: number | null | undefined, t: TranslateFn): string {
  if (days == null) return t('deals.riskAnalysis.lastContactNever')
  if (days === 0) return t('deals.riskAnalysis.lastContactToday')
  return t('deals.riskAnalysis.lastContactDays', { days })
}
