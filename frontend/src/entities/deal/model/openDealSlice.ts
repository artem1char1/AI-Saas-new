import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { fetchActivities, type Activity } from '@/entities/activity'
import { fetchContact, type Contact } from '@/entities/contact'

import { fetchDeal } from '../api/dealApi'
import type { Deal } from './types'

type OpenDealState = {
  dealId: string | null
  deal: Deal | null
  contact: Contact | null
  activities: Activity[]
  isLoading: boolean
  hasError: boolean
}

const initialState: OpenDealState = {
  dealId: null,
  deal: null,
  contact: null,
  activities: [],
  isLoading: false,
  hasError: false,
}

export const loadOpenDeal = createAsyncThunk(
  'openDeal/load',
  async (dealId: string) => {
    const deal = await fetchDeal(dealId)
    const [contact, activities] = await Promise.all([
      fetchContact(deal.contact_id),
      fetchActivities(dealId),
    ])
    return { dealId, deal, contact, activities }
  },
  {
    condition: (dealId, { getState }) => {
      const state = getState() as { openDeal: OpenDealState }
      return state.openDeal.deal?.id !== dealId
    },
  },
)

const openDealSlice = createSlice({
  name: 'openDeal',
  initialState,
  reducers: {
    setOpenDeal(state, action: PayloadAction<Deal>) {
      state.dealId = action.payload.id
      state.deal = action.payload
      state.hasError = false
    },
    clearOpenDeal(state) {
      state.dealId = null
      state.deal = null
      state.contact = null
      state.activities = []
      state.isLoading = false
      state.hasError = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOpenDeal.pending, (state) => {
        state.isLoading = true
        state.hasError = false
      })
      .addCase(loadOpenDeal.fulfilled, (state, action) => {
        state.isLoading = false
        state.dealId = action.payload.dealId
        state.deal = action.payload.deal
        state.contact = action.payload.contact
        state.activities = action.payload.activities
      })
      .addCase(loadOpenDeal.rejected, (state) => {
        state.isLoading = false
        state.hasError = true
      })
  },
})

export const { setOpenDeal, clearOpenDeal } = openDealSlice.actions
export const openDealReducer = openDealSlice.reducer

export const selectOpenDeal = (state: { openDeal: OpenDealState }) => state.openDeal.deal
export const selectOpenDealContact = (state: { openDeal: OpenDealState }) => state.openDeal.contact
export const selectOpenDealActivities = (state: { openDeal: OpenDealState }) => state.openDeal.activities
export const selectOpenDealLoading = (state: { openDeal: OpenDealState }) => state.openDeal.isLoading
export const selectOpenDealError = (state: { openDeal: OpenDealState }) => state.openDeal.hasError

export const selectOpenDealById = (dealId: string | undefined) => (state: { openDeal: OpenDealState }) =>
  dealId && state.openDeal.deal?.id === dealId ? state.openDeal.deal : null
