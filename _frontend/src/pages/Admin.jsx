import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'
import styles from './Admin.module.css'

export default function Admin() {
  const { toast, showToast } = useToast()
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [specialty, setSpecialty] = useState('')
  const [price,     setPrice]     = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' })

  // Edit modal state
  const [editModal, setEditModal]   = useState({ open: false, id: null, name: '', specialty: '', price: '' })
  const [editSaving, setEditSaving] = useState(false)

  // Studio stats
  const [stats, setStats] = useState(null)

  const loadRoster = () => {
    api.get('/photographers')
      .then(r => setRoster(r.data))
      .finally(() => setLoading(false))
  }

  const loadStats = () => {
    api.get('/photographers/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
  }

  useEffect(() => { loadRoster(); loadStats() }, [])

  const handleOnboard = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await api.post('/photographers', {
        name,
        email,
        password,
        specialty,
        pricePerSession: Number(price),
      })
      showToast(`${name} added to roster`, 'success')
      setName(''); setEmail(''); setPassword(''); setSpecialty(''); setPrice('')
      loadRoster()
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Onboarding failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveClick = (id, name) => {
    setDeleteModal({ open: true, id, name })
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/photographers/${deleteModal.id}`)
      showToast(`${deleteModal.name} removed from roster`, 'success')
      loadRoster(); loadStats()
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Failed to remove photographer', 'error')
    } finally {
      setDeleteModal({ open: false, id: null, name: '' })
    }
  }

  const handleEditClick = (ph) => {
    setEditModal({ open: true, id: ph._id, name: ph.user?.name, specialty: ph.specialty, price: String(ph.pricePerSession) })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setEditSaving(true)
      await api.patch(`/photographers/${editModal.id}`, {
        specialty: editModal.specialty,
        pricePerSession: Number(editModal.price),
      })
      showToast('Photographer updated', 'success')
      setEditModal({ open: false, id: null, name: '', specialty: '', price: '' })
      loadRoster()
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Update failed', 'error')
    } finally {
      setEditSaving(false)
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
          <p className="overline">Studio Control</p>
          <h1 className="page-title">Admin Panel</h1>
        </div>
        <div className="page-header-rule" />
      </motion.div>

      {/* STUDIO STATS */}
      {stats && (
        <motion.div
          className={styles.statStrip}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden" animate="visible"
        >
          {[
            ['Photographers', stats.totalPhotographers],
            ['Total Bookings', stats.totalBookings],
            ['Confirmed', stats.confirmedBookings],
            [`₹${(stats.totalRevenue ?? 0).toLocaleString('en-IN')}`, 'Est. Revenue'],
          ].map(([val, label]) => (
            <motion.div key={label} className={styles.statCard} variants={{ hidden: { opacity:0, y:20 }, visible: { opacity:1, y:0, transition:{duration:0.5} } }}>
              <p className={styles.statVal}>{val}</p>
              <p className={styles.statLabel}>{label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className={styles.layout}>

        {/* ONBOARD */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-num">01</span>
            <h2 className="admin-card-title">Onboard Photographer</h2>
          </div>
          <p className="admin-card-desc">
            Register a new photographer to the studio. They will receive the photographer role and can begin managing their calendar immediately.
          </p>
          <form className="editorial-form" onSubmit={handleOnboard}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="e.g. Sebastião Salgado" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="photographer@studio.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Specialty</label>
                <input className="form-input" type="text" placeholder="e.g. Editorial Portrait" value={specialty} onChange={e => setSpecialty(e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price Per Session (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 15000" min="0" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add to Roster'}
            </button>
          </form>
        </div>

        {/* ROSTER */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-num">02</span>
            <h2 className="admin-card-title">Current Roster</h2>
          </div>
          {loading ? (
            <div className="loading-state">
              <div className="loading-dots"><span/><span/><span/></div>
            </div>
          ) : roster.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">No photographers yet</p>
              <p className="empty-sub">Add the first one using the form</p>
            </div>
          ) : roster.map(ph => (
            <div className="roster-row" key={ph._id}>
              <div>
                <p className="roster-name">{ph.user?.name}</p>
                <p className="roster-spec">{ph.specialty}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <p className="roster-price">₹{ph.pricePerSession?.toLocaleString('en-IN')}</p>
                <button
                  onClick={() => handleEditClick(ph)}
                  style={{ background: 'transparent', border: 'none', color: '#617891', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleRemoveClick(ph._id, ph.user?.name)} 
                  style={{ background: 'transparent', border: 'none', color: '#d47a7a', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModal({ open: false, id: null, name: '' })}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <p className="overline" style={{ color: '#d47a7a' }}>Danger Zone</p>
              <h2 className="section-title" style={{ marginTop: 8, marginBottom: 16 }}>Remove {deleteModal.name}?</h2>
              <p style={{ color: '#cec7bc', marginBottom: 32, fontSize: '14px', lineHeight: 1.6 }}>
                This action cannot be undone. The photographer profile, their user account, and all associated bookings will be permanently deleted from the database.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button className="btn-ghost-light" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  style={{ background: '#d47a7a', borderColor: '#d47a7a' }}
                  onClick={confirmDelete}
                >
                  Confirm Deletion
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editModal.open && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditModal({ open: false, id: null, name: '', specialty: '', price: '' })}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <p className="overline" style={{ color: '#617891' }}>Edit Profile</p>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, margin: '8px 0 24px', color: '#e6e0d6', fontStyle: 'italic' }}>
                {editModal.name}
              </h2>
              <form className="editorial-form" onSubmit={handleUpdate}>
                <div className="form-group">
                  <label className="form-label">Specialty</label>
                  <input
                    className="form-input"
                    type="text"
                    value={editModal.specialty}
                    onChange={e => setEditModal(m => ({ ...m, specialty: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price Per Session (₹)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={editModal.price}
                    onChange={e => setEditModal(m => ({ ...m, price: e.target.value }))}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button className="btn-ghost-light" type="button" onClick={() => setEditModal({ open: false, id: null, name: '', specialty: '', price: '' })}>
                    Cancel
                  </button>
                  <button className="btn-primary" type="submit" disabled={editSaving}>
                    {editSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
