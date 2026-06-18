export type DealRiskLevel = 'low' | 'medium' | 'high'

export type RiskFactorKind =
  | 'no_next_step'
  | 'next_action_overdue'
  | 'close_date_overdue'
  | 'no_contact'
  | 'no_contact_days'
  | 'high_priority'
  | 'status_negotiation'
  | 'status_proposal'

export type RiskFactor = {
  kind: RiskFactorKind
  points: number
  days: number | null
}

export type DealRisk = {
  deal_id: string
  risk_score: number
  risk_level: DealRiskLevel
  factors: RiskFactor[]
  reasons: string[]
  next_best_action: string
  days_since_last_contact: number | null
  is_closed: boolean
}

export type TopRiskyDeal = {
  deal_id: string
  title: string
  contact_name: string | null
  company_name: string | null
  amount: string | null
  risk_score: number
  risk_level: DealRiskLevel
  main_reason: string | null
}

export type TodayStatKind = 'high_risk' | 'overdue_next_action' | 'no_contact_7d'
export type AiInsightKind = 'needs_attention' | 'no_next_step' | 'overdue_close'
export type TopDealSubtitleKind = 'status' | 'closing' | 'risk'

export type TodayStat = {
  kind: TodayStatKind
  count: number
}

export type AiInsight = {
  kind: AiInsightKind
  count: number
}

export type UpcomingAction = {
  deal_id: string
  title: string
  next_action: string
  next_action_at: string | null
  is_overdue: boolean
  company_name: string | null
  contact_name: string | null
}

export type TopDealDashboard = {
  deal_id: string
  title: string
  amount: string | null
  status: string
  risk_score: number
  risk_level: DealRiskLevel
  subtitle_kind: TopDealSubtitleKind
  days_to_close: number | null
}

export type DashboardSummary = {
  total_active_deals: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  top_risky_deals: TopRiskyDeal[]
  today_stats: TodayStat[]
  ai_insights: AiInsight[]
  upcoming_actions: UpcomingAction[]
  top_deals: TopDealDashboard[]
}

export type DashboardRiskSummary = Pick<
  DashboardSummary,
  | 'total_active_deals'
  | 'high_risk_count'
  | 'medium_risk_count'
  | 'low_risk_count'
  | 'top_risky_deals'
>
