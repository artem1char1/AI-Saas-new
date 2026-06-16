import { Link } from 'react-router-dom'

import styles from './DashboardSectionEmpty.module.css'

type DashboardSectionEmptyProps = {
  title?: string
  description?: string
  action?: {
    label: string
    to: string
  }
}

export function DashboardSectionEmpty({ title, description, action }: DashboardSectionEmptyProps) {
  return (
    <div className={styles.sectionEmpty}>
      {title && <p className={styles.title}>{title}</p>}
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <Link to={action.to} className={`button buttonPrimary ${styles.action}`}>
          {action.label}
        </Link>
      )}
    </div>
  )
}
