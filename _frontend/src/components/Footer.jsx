import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './Footer.module.css'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.rule} />
      <div className={styles.inner}>
        <motion.div
          className={styles.brand}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.logoRow}>
            <span className={styles.logoMark}>◈</span>
            <span className={styles.logoText}>OBSCURA</span>
          </div>
          <p className={styles.tagline}>A Private Photography Studio</p>
        </motion.div>
        
        <motion.nav
          className={styles.links}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className={styles.linksLabel}>Navigate</p>
          <Link to="/" className={styles.link}>Home</Link>
          <Link to="/photographers" className={styles.link}>Photographers</Link>
          <Link to="/sessions" className={styles.link}>My Sessions</Link>
          <Link to="/login" className={styles.link}>Sign In</Link>
        </motion.nav>

        <motion.div
          className={styles.meta}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className={styles.tagline} style={{ maxWidth: 220, marginBottom: 16, lineHeight: 1.7 }}>
            Where photography becomes an encounter — not a transaction.
          </p>
          <p className={styles.copy}>© {year} OBSCURA. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}
