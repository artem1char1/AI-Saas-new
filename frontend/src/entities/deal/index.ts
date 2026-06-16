export type { Deal, DealCreate, DealPatch, DealUpdate } from './model/types'
export {
  DEAL_OUTCOME_STAGES,
  DEAL_PIPELINE_STAGES,
  DEAL_PRIORITIES,
  DEAL_STATUSES,
  dealStageIndex,
  dealStatusProgress,
  isDealOutcome,
} from './model/constants'
export {
  clearOpenDeal,
  loadOpenDeal,
  openDealReducer,
  selectOpenDeal,
  selectOpenDealActivities,
  selectOpenDealById,
  selectOpenDealContact,
  selectOpenDealError,
  selectOpenDealLoading,
  setOpenDeal,
} from './model/openDealSlice'
export { buildDealPayload, dealToFormValues, type DealFormValues } from './lib/dealForm'
export { createDeal, deleteDeal, fetchDeal, fetchDeals, patchDeal, updateDeal } from './api/dealApi'
