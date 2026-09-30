import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'
import styles from './Dashboard.module.css'

const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

export default function Dashboard() {
  const { toast, showToast } = useToast()

  const [profile,  setProfile]  = useState(null)
  const [dates,    setDates]    = useState([])
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)

  // Add date
  const [newDate, setNewDate] = useState('')
  const [adding,  setAdding]  = useState(false)

  // Edit profile
  const [editMode,     setEditMode]     = useState(false)
  const [editPrice,    setEditPrice]    = useState('')
  const [editSpecialty,setEditSpecialty]= useState('')
  const [saving,       setSaving]       = useState(false)

  const loadData = async () => {
    try {
      const [avRes, bkRes, phRes] = await Promise.all([
        api.get('/photographers/availability').catch(() => ({ data: { availableDates: [] } })),
        api.get('/bookings/my'),
        api.get('/photographers').catch(() => ({ data: [] })),
      ])
      const myProfile = phRes.data?.find(p => p.user && bkRes.data?.length > 0
        ? p._id === bkRes.data[0]?.photographer?._id
        : false
      ) ?? phRes.data?.[0]

      // Get own profile via availability endpoint which uses logged-in user
      const ownPh = avRes.data
      setDates(avRes.data?.availableDates ?? [])
      setBookings(bkRes.data)

      // Fetch own photographer profile
      const allPh = phRes.data
      // We'll store whatever we can from bookings to show profile info
      setProfile(myProfile ?? null)
    } catch { /* silently handle */ }
    finally { setLoading(false) }
  }

  // Better: get own photographer record by calling the availability endpoint which requires auth
  const loadProfile = async () => {
    try {
      // Get full own profile from first booking or all photographers
      const [avRes, bkRes, allRes] = await Promise.all([
        api.get('/photographers/availability'),
        api.get('/bookings/my'),
        api.get('/photographers'),
      ])
      setDates(avRes.data?.availableDates ?? [])
      setBookings(bkRes.data)
      // The photographer whos bookings we see as client is not our own profile
      // Our own profile is in allRes — but we need to identify it by user id
      // Since we can't easily get user id here, use me endpoint
      const meRes = await api.get('/photographers').catch(() => ({ data: [] }))
      // We'll identify ourselves by having /me route return data
      const myProfile = await api.get('/photographers/me').catch(() => null)
      if (myProfile?.data) setProfile(myProfile.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    // Simplified: load data cleanly
    const run = async () => {
      try {
        const [avRes, bkRes] = await Promise.all([
          api.get('/photographers/availability'),
          api.get('/bookings/my'),
        ])
        setDates(avRes.data?.availableDates ?? [])
        setBookings(bkRes.data)

        // Try to get photographer's own full profile
        try {
          const phAllRes = await api.get('/photographers')
          // Find profile using the user reference from availability response
          // Since availability is secured to own photographer, we trust the data
          // We get specialty and price via a separate me call
        } catch {}
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    run()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newDate) return
    try {
      setAdding(true)
      await api.post('/photographers/availability', { dates: [newDate] })
      showToast('Date added to your calendar', 'success')
      setNewDate('')
      const avRes = await api.get('/photographers/availability')
      setDates(avRes.data?.availableDates ?? [])
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Failed to add date', 'error')
    } finally { setAdding(false) }
  }

  const handleRemoveDate = async (date) => {
    try {
      const iso = date.split('T')[0]
      await api.delete(`/photographers/availability/${iso}`)
      showToast('Date removed', 'success')
      const avRes = await api.get('/photographers/availability')
      setDates(avRes.data?.availableDates ?? [])
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Failed to remove', 'error')
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.patch('/photographers/me', {
        specialty: editSpecialty || undefined,
        pricePerSession: editPrice ? Number(editPrice) : undefined,
      })
      showToast('Profile updated successfully', 'success')
      setEditMode(false)
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Failed to update', 'error')
    } finally { setSaving(false) }
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const totalEarnings     = confirmedBookings.length

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
          <p className="overline">Your Calendar</p>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="page-header-rule" />
      </motion.div>

      {/* STAT STRIP */}
      <motion.div
        className={styles.statStrip}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden" animate="visible"
      >
        {[
          ['Upcoming Sessions', confirmedBookings.length],
          ['Total Bookings',    bookings.length],
          ['Open Dates',        dates.length],
          ['Cancelled',         bookings.filter(b => b.status === 'cancelled').length],
        ].map(([label, val]) => (
          <motion.div
            key={label}
            className={styles.statCard}
            variants={fadeUp}
          >
            <p className={styles.statVal}>{val}</p>
            <p className={styles.statLabel}>{label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className={styles.layout}>

        {/* ADD DATE */}
        <motion.div className="admin-card" initial="hidden" animate="visible" variants={fadeUp}>
          <div className="admin-card-header">
            <span className="admin-card-num">01</span>
            <h2 className="admin-card-title">Add Available Dates</h2>
          </div>
          <p className="admin-card-desc">Mark dates you are available for sessions. Clients will see these when booking.</p>
          <form className="editorial-form" onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Select Date</label>
              <input
                className="form-input"
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <button className="btn-primary" type="submit" disabled={adding}>
              {adding ? 'Adding…' : 'Mark Available'}
            </button>
          </form>
        </motion.div>

        {/* MY AVAILABILITY */}
        <motion.div className="admin-card" initial="hidden" animate="visible" variants={fadeUp}>
          <div className="admin-card-header">
            <span className="admin-card-num">02</span>
            <h2 className="admin-card-title">My Availability</h2>
          </div>
          {loading ? (
            <div className="loading-state"><div className="loading-dots"><span/><span/><span/></div></div>
          ) : dates.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">No dates set</p>
              <p className="empty-sub">Add available dates using the form</p>
            </div>
          ) : dates.map(d => (
            <div key={d} className={styles.dateRow}>
              <span className={styles.dateVal}>{fmt(d)}</span>
              <button className={styles.removeBtn} onClick={() => handleRemoveDate(d)} title="Remove">✕</button>
            </div>
          ))}
        </motion.div>

        {/* EDIT PROFILE */}
        <motion.div className="admin-card" initial="hidden" animate="visible" variants={fadeUp}>
          <div className="admin-card-header">
            <span className="admin-card-num">03</span>
            <h2 className="admin-card-title">Edit My Profile</h2>
          </div>
          <p className="admin-card-desc">Update your specialty or session price. Changes go live immediately on your public profile.</p>
          {!editMode ? (
            <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => setEditMode(true)}>
              Edit Profile →
            </button>
          ) : (
            <form className="editorial-form" onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Specialty</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Editorial Portrait"
                  value={editSpecialty}
                  onChange={e => setEditSpecialty(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price Per Session (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="e.g. 15000"
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button className="btn-ghost" type="button" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* INCOMING BOOKINGS */}
        <motion.div className="admin-card" initial="hidden" animate="visible" variants={fadeUp} style={{ gridColumn: '1 / -1' }}>
          <div className="admin-card-header">
            <span className="admin-card-num">04</span>
            <h2 className="admin-card-title">Incoming Bookings</h2>
          </div>
          {loading ? (
            <div className="loading-state"><div className="loading-dots"><span/><span/><span/></div></div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">No bookings yet</p>
              <p className="empty-sub">Once clients book your dates, they will appear here</p>
            </div>
          ) : (
            <table className={styles.bookingTable}>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Session Date</th>
                  <th>Booked On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td className={styles.clientName}>{b.client?.name ?? '—'}</td>
                    <td className={styles.clientEmail}>{b.client?.email ?? '—'}</td>
                    <td>{fmt(b.sessionDate)}</td>
                    <td className={styles.dim}>{fmt(b.createdAt)}</td>
                    <td>
                      <span className={b.status === 'confirmed' ? styles.confirmed : styles.cancelled}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

      </div>
    </main>
  )
}
