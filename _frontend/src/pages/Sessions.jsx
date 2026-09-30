import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'
import styles from './Sessions.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

export default function Sessions() {
  const [bookings, setBookings]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [cancelModal, setCancelModal] = useState({ open: false, id: null })
  const { toast, showToast }          = useToast()
  const navigate = useNavigate()

  const load = () => {
    api.get('/bookings/my')
      .then(r => setBookings(r.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const confirmCancel = async () => {
    try {
      await api.put(`/bookings/${cancelModal.id}/cancel`)
      showToast('Session cancelled', 'success')
      load()
    } catch (e) {
      showToast(e.response?.data?.message ?? 'Failed to cancel', 'error')
    } finally {
      setCancelModal({ open: false, id: null })
    }
  }

  return (
    <main style={{ paddingTop: 65 }}>
      <Toast {...toast} />

      <motion.div
        className="page-header-bar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div>
          <p className="overline">Your Archive</p>
          <h1 className="page-title">My Sessions</h1>
        </div>
        <div className="page-header-rule" />
      </motion.div>

      <div className={styles.container}>
        {loading ? (
          <div className="loading-state">
            <div className="loading-dots"><span/><span/><span/></div>
            <p>Loading sessions…</p>
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-icon">◈</div>
            <p className="empty-title">No sessions yet</p>
            <p className="empty-sub">Browse photographers and book your first session</p>
            <button className="btn-primary" style={{ marginTop: 28 }} onClick={() => navigate('/photographers')}>
              Browse Photographers
            </button>
          </motion.div>
        ) : (
          <>
            <motion.p
              className={styles.countLabel}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            >
              {bookings.filter(b => b.status === 'confirmed').length} confirmed · {bookings.filter(b => b.status === 'cancelled').length} cancelled
            </motion.p>
            <motion.table
              className={styles.table}
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <thead>
                <tr>
                  <th>Photographer</th>
                  <th>Specialty</th>
                  <th>Session Date</th>
                  <th>Booked On</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <motion.tr key={b._id} variants={fadeUp}>
                    <td>
                      <span
                        className={styles.phName}
                        onClick={() => b.photographer?._id && navigate(`/photographers/${b.photographer._id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {b.photographer?.user?.name ?? '—'}
                      </span>
                    </td>
                    <td className={styles.spec}>{b.photographer?.specialty ?? '—'}</td>
                    <td>{fmt(b.sessionDate)}</td>
                    <td className={styles.dim}>{fmt(b.createdAt)}</td>
                    <td>
                      <span className={b.status === 'confirmed' ? styles.confirmed : styles.cancelled}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'confirmed' && (
                        <button
                          className={styles.cancelBtn}
                          onClick={() => setCancelModal({ open: true, id: b._id })}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </>
        )}
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      <AnimatePresence>
        {cancelModal.open && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCancelModal({ open: false, id: null })}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <p className="overline" style={{ color: '#d47a7a' }}>Cancel Session</p>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, margin: '12px 0 16px', color: '#e6e0d6' }}>
                Are you sure?
              </h2>
              <p style={{ color: '#cec7bc', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
                This action will cancel your booking. The date will become available again for other clients to book.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button className="btn-ghost" onClick={() => setCancelModal({ open: false, id: null })}>
                  Keep Session
                </button>
                <button
                  className="btn-primary"
                  style={{ background: '#d47a7a', borderColor: '#d47a7a' }}
                  onClick={confirmCancel}
                >
                  Yes, Cancel It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
