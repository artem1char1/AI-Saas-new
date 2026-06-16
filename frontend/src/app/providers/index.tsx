import type { ReactNode } from 'react'

import { Provider } from 'react-redux'

import { BackendStatusProvider } from '@/features/backend-status'
import { ThemeProvider } from '@/features/theme'
import { ToastProvider } from '@/features/toast'
import { I18nProvider } from '@/shared/lib/i18n'

import { AppRouter } from '@/app/router'
import { store } from '@/app/store'

type AppProvidersProps = {
  children?: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <I18nProvider>
        <ThemeProvider>
          <ToastProvider>
            <BackendStatusProvider>
              <div className="appViewport">{children ?? <AppRouter />}</div>
            </BackendStatusProvider>
          </ToastProvider>
        </ThemeProvider>
      </I18nProvider>
    </Provider>
  )
}
