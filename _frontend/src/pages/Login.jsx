import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import ImagePlaceholder from '../components/ImagePlaceholder'
import Toast from '../components/Toast'
import styles from './Login.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast, showToast } = useToast()

  const [tab, setTab]     = useState('login')
  const [loading, setLoading] = useState(false)

  // Login state
  const [lEmail, setLEmail] = useState('')
  const [lPass,  setLPass]  = useState('')

  // Register state
  const [rName,  setRName]  = useState('')
  const [rEmail, setREmail] = useState('')
  const [rPass,  setRPass]  = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await api.post('/auth/login', { email: lEmail, password: lPass })
      login(res.data.user, res.data.token)
      const role = res.data.user.role
      if (role === 'admin')        navigate('/admin')
      else if (role === 'photographer') navigate('/dashboard')
      else navigate('/')
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await api.post('/auth/register', { name: rName, email: rEmail, password: rPass, role: 'client' })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <Toast {...toast} />

      {/* LEFT — image */}
      <div className={styles.imgCol}>
        <img src="/images/login-auth.jpg" alt="Login Auth" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className={styles.imgOverlay}>
          <p className={styles.quote}>"The camera is an instrument that teaches people how to see without a camera."</p>
          <p className={styles.attr}>— Dorothea Lange</p>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className={styles.formCol}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>◈</span>
          <span className={styles.logoText}>OBSCURA</span>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'login' ? styles.activeTab : ''}`} onClick={() => setTab('login')}>
            Sign In
          </button>
          <button className={`${styles.tab} ${tab === 'register' ? styles.activeTab : ''}`} onClick={() => setTab('register')}>
            Create Account
          </button>
        </div>

        {tab === 'login' ? (
          <form className="editorial-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={lEmail} onChange={e => setLEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={lPass} onChange={e => setLPass(e.target.value)} required />
            </div>
            <button className="btn-primary" type="submit" style={{ width:'100%' }} disabled={loading}>
              {loading ? 'Entering…' : 'Enter the Studio'}
            </button>
          </form>
        ) : (
          <form className="editorial-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="Your name" value={rName} onChange={e => setRName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={rEmail} onChange={e => setREmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters" value={rPass} onChange={e => setRPass(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input form-select" disabled>
                <option>Client</option>
              </select>
              <p className="form-hint">Photographers are onboarded by studio admin only.</p>
            </div>
            <button className="btn-primary" type="submit" style={{ width:'100%' }} disabled={loading}>
              {loading ? 'Joining…' : 'Join the Studio'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
