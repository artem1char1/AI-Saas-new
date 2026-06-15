import { Link } from 'react-router-dom'

import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        AI SaaS
      </Link>
      <nav className={styles.nav}>
        <Link to="/">Home</Link>
      </nav>
    </header>
  )
}
