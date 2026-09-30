import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path ? styles.active : ''
  const isLogin  = location.pathname === '/login'

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <motion.span
            className={styles.logoMark}
            animate={{ rotate: [0, 90, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >◈</motion.span>
          <span className={styles.logoText}>OBSCURA</span>
        </Link>

        <nav className={styles.links}>
          <Link to="/photographers" className={`${styles.link} ${isActive('/photographers')}`}>
            Photographers
          </Link>
          {user && (
            <Link to="/sessions" className={`${styles.link} ${isActive('/sessions')}`}>
              My Sessions
            </Link>
          )}
          {user?.role === 'photographer' && (
            <Link to="/dashboard" className={`${styles.link} ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`${styles.link} ${isActive('/admin')}`}>
              Studio Admin
            </Link>
          )}
        </nav>

        <div className={styles.actions}>
          {user && (
            <AnimatePresence>
              <motion.span
                className={styles.badge}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {user.role}
              </motion.span>
            </AnimatePresence>
          )}
          {user ? (
            <button className={`btn-ghost ${styles.exitBtn}`} onClick={handleLogout}>
              Logout
            </button>
          ) : isLogin ? (
            <Link to="/" className="btn-ghost">Exit</Link>
          ) : (
            <Link to="/login" className="btn-ghost">Enter</Link>
          )}
        </div>
      </div>
      <div className={styles.rule} />
    </header>
  )
}
