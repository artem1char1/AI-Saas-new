import { configureStore } from '@reduxjs/toolkit'

import { openDealReducer } from '@/entities/deal/model/openDealSlice'

export const store = configureStore({
  reducer: {
    openDeal: openDealReducer,
  },
})

export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
