import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { searchEntities, type SearchEntityType, type SearchResultItem } from '@/entities/search'
import { useI18n } from '@/shared/lib/i18n'
import { ActivityIcon, Briefcase, Building2, Search, Users } from '@/shared/ui/icons'

import styles from './GlobalSearch.module.css'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300

type GroupedResults = {
  entityType: SearchEntityType
  items: SearchResultItem[]
}

function getResultPath(item: SearchResultItem): string {
  switch (item.entity_type) {
    case 'contact':
      return `/contacts/${item.id}`
    case 'deal':
      return `/deals/${item.id}`
    case 'activity':
      return item.deal_id ? `/deals/${item.deal_id}` : '/activities'
    case 'organization':
      return '/settings/organization'
    default:
      return '/dashboard'
  }
}

function groupResults(results: SearchResultItem[]): GroupedResults[] {
  const order: SearchEntityType[] = ['organization', 'contact', 'deal', 'activity']
  const groups = new Map<SearchEntityType, SearchResultItem[]>()

  for (const item of results) {
    const existing = groups.get(item.entity_type) ?? []
    existing.push(item)
    groups.set(item.entity_type, existing)
  }

  return order
    .filter((type) => groups.has(type))
    .map((entityType) => ({ entityType, items: groups.get(entityType)! }))
}

function EntityIcon({ type }: { type: SearchEntityType }) {
  switch (type) {
    case 'contact':
      return <Users size={16} />
    case 'deal':
      return <Briefcase size={16} />
    case 'activity':
      return <ActivityIcon size={16} />
    case 'organization':
      return <Building2 size={16} />
    default:
      return <Search size={16} />
  }
}

export function GlobalSearch() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const flatResults = results
  const groupedResults = groupResults(results)
  const showDropdown = isOpen && query.trim().length >= MIN_QUERY_LENGTH

  const close = useCallback(() => {
    setIsOpen(false)
    setActiveIndex(-1)
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const navigateToResult = useCallback(
    (item: SearchResultItem) => {
      navigate(getResultPath(item))
      setQuery('')
      setResults([])
      close()
      inputRef.current?.blur()
    },
    [close, navigate],
  )

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([])
      setIsLoading(false)
      setActiveIndex(-1)
      return
    }

    setIsLoading(true)
    const timeoutId = window.setTimeout(() => {
      void searchEntities(trimmed)
        .then((response) => {
          setResults(response.results)
          setActiveIndex(response.results.length > 0 ? 0 : -1)
        })
        .catch(() => {
          setResults([])
          setActiveIndex(-1)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [query])

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        open()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [close])

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      close()
      inputRef.current?.blur()
      return
    }

    if (!showDropdown || flatResults.length === 0) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % flatResults.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? flatResults.length - 1 : index - 1))
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      const item = flatResults[activeIndex]
      if (item) {
        navigateToResult(item)
      }
    }
  }

  let resultOffset = 0

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={`${styles.search} ${isOpen ? styles.searchFocused : ''}`}>
        <Search />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            open()
          }}
          onFocus={open}
          onKeyDown={handleInputKeyDown}
          placeholder={t('common.search')}
          aria-label={t('common.search')}
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listboxId : undefined}
          aria-autocomplete="list"
          role="combobox"
        />
        <span className={styles.searchHint}>⌘K</span>
      </div>

      {showDropdown && (
        <div className={styles.dropdown} role="listbox" id={listboxId}>
          {isLoading && <p className={styles.status}>{t('search.loading')}</p>}

          {!isLoading && flatResults.length === 0 && (
            <p className={styles.status}>{t('search.noResults')}</p>
          )}

          {!isLoading &&
            groupedResults.map((group) => (
              <div key={group.entityType} className={styles.group}>
                <p className={styles.groupTitle}>{t(`search.groups.${group.entityType}`)}</p>
                <ul className={styles.groupList}>
                  {group.items.map((item) => {
                    const currentIndex = resultOffset
                    resultOffset += 1
                    const isActive = currentIndex === activeIndex

                    return (
                      <li key={`${item.entity_type}-${item.id}`}>
                        <button
                          type="button"
                          className={`${styles.result} ${isActive ? styles.resultActive : ''}`}
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActiveIndex(currentIndex)}
                          onClick={() => navigateToResult(item)}
                        >
                          <span className={styles.resultIcon}>
                            <EntityIcon type={item.entity_type} />
                          </span>
                          <span className={styles.resultBody}>
                            <span className={styles.resultTitle}>{item.title}</span>
                            {item.subtitle && (
                              <span className={styles.resultSubtitle}>{item.subtitle}</span>
                            )}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
