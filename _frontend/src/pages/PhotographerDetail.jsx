import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import ImagePlaceholder from '../components/ImagePlaceholder'
import Toast from '../components/Toast'
import styles from './PhotographerDetail.module.css'

export default function PhotographerDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast, showToast } = useToast()

  const [ph, setPh]                 = useState(null)
  const [dates, setDates]           = useState([])
  const [selectedDate, setSelected] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [booking, setBooking]       = useState(false)
  const [modalOpen, setModalOpen]   = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/photographers'),
      api.get(`/photographers/${id}/availability`),
    ]).then(([phRes, avRes]) => {
      const found = phRes.data.find(p => p._id === id)
      setPh(found)
      setDates(avRes.data.availableDates ?? [])
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })

  const handleBook = () => {
    if (!user) { navigate('/login'); return }
    if (!selectedDate) { showToast('Please select a date first', 'error'); return }
    setModalOpen(true)
  }

  const confirmBooking = async () => {
    try {
      setBooking(true)
      await api.post('/bookings', { photographerId: id, sessionDate: selectedDate })
      showToast('Session confirmed!', 'success')
      setModalOpen(false)
      setSelected(null)
      // refresh dates
      const avRes = await api.get(`/photographers/${id}/availability`)
      setDates(avRes.data.availableDates ?? [])
    } catch (e) {
      showToast(e.response?.data?.message ?? 'Booking failed', 'error')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return (
    <div className="loading-state" style={{ paddingTop: 120 }}>
      <div className="loading-dots"><span/><span/><span/></div>
    </div>
  )

  if (!ph) return (
    <div className="empty-state" style={{ paddingTop: 120 }}>
      <p className="empty-title">Photographer not found</p>
    </div>
  )

  return (
    <main style={{ paddingTop: 65 }}>
      <Toast {...toast} />

      <div className={styles.backBar}>
        <button className="btn-ghost" onClick={() => navigate('/photographers')}>
          ← All Photographers
        </button>
      </div>

      <div className={styles.layout}>
        {/* LEFT — sticky image */}
        <div className={styles.imgCol}>
          <img 
            src={`/images/${ph.user?.name?.toLowerCase().replace(/\s+/g, '-')}.jpg`} 
            alt={ph.user?.name}
            onError={(e) => { e.target.src = '/images/fallback-avatar.jpg' }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* RIGHT — info + booking */}
        <div className={styles.infoCol}>
          <p className={styles.specialty}>{ph.specialty}</p>
          <h1 className={styles.name}>{ph.user?.name}</h1>
          <p className={styles.price}>₹{ph.pricePerSession?.toLocaleString('en-IN')} per session</p>

          <div className={styles.divider} />

          <p className={styles.availLabel}>Available Dates</p>
          {dates.length === 0 ? (
            <p className={styles.noDates}>No dates currently available.<br/>Check back soon.</p>
          ) : (
            <div className={styles.datesGrid}>
              {dates.map(d => (
                <button
                  key={d}
                  className={`${styles.dateChip} ${selectedDate === d ? styles.selected : ''}`}
                  onClick={() => setSelected(d === selectedDate ? null : d)}
                >
                  {fmt(d)}
                </button>
              ))}
            </div>
          )}

          {user ? (
            <button className="btn-primary" style={{ marginTop: 32 }} onClick={handleBook}>
              {selectedDate ? `Book — ${fmt(selectedDate)}` : 'Select a Date to Book'}
            </button>
          ) : (
            <p className={styles.loginPrompt}>
              <span onClick={() => navigate('/login')}>Sign in</span> to book a session
            </p>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className={styles.modal}>
            <button className={styles.modalClose} onClick={() => setModalOpen(false)}>✕</button>
            <p className="overline" style={{ color: '#6b6f4e' }}>Confirm Session</p>
            <h2 className={styles.modalTitle}>{ph.user?.name}</h2>
            {[
              ['Date',      fmt(selectedDate)],
              ['Rate',      `₹${ph.pricePerSession?.toLocaleString('en-IN')}`],
              ['Specialty', ph.specialty],
            ].map(([label, val]) => (
              <div key={label} className={styles.modalRow}>
                <span className={styles.modalLabel}>{label}</span>
                <span className={styles.modalVal}>{val}</span>
              </div>
            ))}
            <div className={styles.modalActions}>
              <button className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmBooking} disabled={booking}>
                {booking ? 'Confirming…' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
