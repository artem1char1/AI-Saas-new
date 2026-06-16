import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth-session'

import styles from './Header.module.css'

export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        AI SaaS CRM
      </Link>
      <nav className={styles.nav}>
        <Link to="/">Home</Link>
        <Link to="/contacts">Contacts</Link>
        <Link to="/deals">Deals</Link>
        {user && <span>{user.email}</span>}
        <button type="button" onClick={() => void handleLogout()}>
          Logout
        </button>
      </nav>
    </header>
  )
}
