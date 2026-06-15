import { useCallback, useEffect, useState } from 'react'

import { fetchHealthStatus, type HealthStatus } from '@/entities/health'
import { Button } from '@/shared/ui'

import styles from './HealthStatus.module.css'

export function HealthStatus() {
  const [data, setData] = useState<HealthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchHealthStatus()
      setData(response)
    } catch (err) {
      setData(null)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>API Status</h2>

      {isLoading && <p className={styles.muted}>Checking backend...</p>}

      {!isLoading && error && (
        <p className={styles.error}>Backend unavailable: {error}</p>
      )}

      {!isLoading && !error && data && (
        <dl className={styles.list}>
          <div>
            <dt>Status</dt>
            <dd>{data.status}</dd>
          </div>
          <div>
            <dt>Service</dt>
            <dd>{data.service}</dd>
          </div>
        </dl>
      )}

      <Button onClick={() => void load()} disabled={isLoading}>
        Refresh
      </Button>
    </section>
  )
}
