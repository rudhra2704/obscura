import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'
import styles from './Photographers.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function Photographers() {
  const [photographers, setPhotographers] = useState([])
  const [filtered, setFiltered]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/photographers')
      .then(r => { setPhotographers(r.data); setFiltered(r.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      photographers.filter(p =>
        p.user?.name?.toLowerCase().includes(q) ||
        p.specialty?.toLowerCase().includes(q)
      )
    )
  }, [search, photographers])

  return (
    <main style={{ paddingTop: 65 }}>
      <motion.div
        className="page-header-bar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div>
          <p className="overline">The Roster</p>
          <h1 className="page-title">Our Photographers</h1>
        </div>
        <div className="page-header-rule" />
      </motion.div>

      <motion.div
        className={styles.filterBar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search by name or specialty…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
        )}
      </motion.div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-dots"><span/><span/><span/></div>
          <p>Loading photographers…</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty-icon">◈</div>
          <p className="empty-title">No photographers found</p>
          <p className="empty-sub">Try adjusting your search</p>
          {search && (
            <button className="btn-ghost" style={{ marginTop: 20 }} onClick={() => setSearch('')}>
              Clear Search
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          className={styles.grid}
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((ph) => (
            <motion.div
              key={ph._id}
              className={styles.card}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate(`/photographers/${ph._id}`)}
            >
              <div className={styles.cardImg}>
                <img
                  src={`/images/${ph.user?.name?.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                  alt={ph.user?.name}
                  onError={(e) => { e.target.src = '/images/fallback-avatar.jpg' }}
                />
                <div className={styles.cardImgOverlay} />
              </div>
              <div className={styles.cardBody}>
                <p className={styles.specialty}>{ph.specialty}</p>
                <h2 className={styles.name}>{ph.user?.name ?? 'Unknown'}</h2>
                <div className={styles.cardMeta}>
                  <p className={styles.price}>₹{ph.pricePerSession?.toLocaleString('en-IN')} / session</p>
                  <p className={styles.avail}>
                    {ph.availableDates?.length
                      ? `${ph.availableDates.length} date${ph.availableDates.length > 1 ? 's' : ''} open`
                      : 'Check availability'}
                  </p>
                </div>
                <span className={styles.arrow}>View Profile →</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  )
}
