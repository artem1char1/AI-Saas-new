export const DEAL_PIPELINE_STAGES = ['new', 'qualification', 'proposal', 'negotiation'] as const
export const DEAL_OUTCOME_STAGES = ['won', 'lost'] as const
export const DEAL_STATUSES = [...DEAL_PIPELINE_STAGES, ...DEAL_OUTCOME_STAGES] as const
export const DEAL_PRIORITIES = ['low', 'medium', 'high'] as const

export type DealPipelineStage = (typeof DEAL_PIPELINE_STAGES)[number]
export type DealOutcomeStage = (typeof DEAL_OUTCOME_STAGES)[number]
export type DealStatus = (typeof DEAL_STATUSES)[number]

export function isDealOutcome(status: string): boolean {
  return DEAL_OUTCOME_STAGES.includes(status.toLowerCase() as DealOutcomeStage)
}

export function dealStatusProgress(status: string): number {
  const normalized = status.toLowerCase()
  if (normalized === 'won') return 100
  if (normalized === 'lost') return 0

  const index = DEAL_PIPELINE_STAGES.indexOf(normalized as DealPipelineStage)
  if (index < 0) return 20
  return Math.round(((index + 1) / DEAL_PIPELINE_STAGES.length) * 100)
}

export function dealStageIndex(status: string): number {
  return DEAL_PIPELINE_STAGES.indexOf(status.toLowerCase() as DealPipelineStage)
}
