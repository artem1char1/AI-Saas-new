import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { en } from './locales/en'
import { ru, type TranslationSchema } from './locales/ru'

export type Locale = 'ru' | 'en'

const STORAGE_KEY = 'ai_saas_locale'

const locales: Record<Locale, TranslationSchema> = {
  ru,
  en,
}

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function detectBrowserLocale(): Locale {
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]

  const prefersRussian = languages.some((language) => language.toLowerCase().startsWith('ru'))
  return prefersRussian ? 'ru' : 'en'
}

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'ru' || stored === 'en') {
    return stored
  }
  return detectBrowserLocale()
}

function resolvePath(obj: TranslationSchema, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return typeof current === 'string' ? current : undefined
}

type I18nProviderProps = {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale())

  useEffect(() => {
    document.documentElement.lang = locale
    localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const value = resolvePath(locales[locale], key) ?? resolvePath(locales.ru, key) ?? key

      if (!params) {
        return value
      }

      return Object.entries(params).reduce(
        (result, [paramKey, paramValue]) =>
          result.replaceAll(`{{${paramKey}}}`, String(paramValue)),
        value,
      )
    },
    [locale],
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export function useLocaleCode(): string {
  const { locale } = useI18n()
  return locale === 'ru' ? 'ru-RU' : 'en-US'
}
