import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import styles from './EmptyState.module.css'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    to: string
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.root}>
      <div className={styles.iconWrap} aria-hidden="true">
        {icon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <Link to={action.to} className={`button buttonPrimary ${styles.action}`}>
          {action.label}
        </Link>
      )}
    </div>
  )
}
