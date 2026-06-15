import { HealthStatus } from '@/features/health-check'
import { Header } from '@/widgets/header'

import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.badge}>ФСД2</p>
          <h1>React + FastAPI starter</h1>
          <p className={styles.description}>
            Frontend is organized with FSD layers. Backend exposes a health endpoint
            to verify the connection.
          </p>
        </section>
        <HealthStatus />
      </main>
    </div>
  )
}
