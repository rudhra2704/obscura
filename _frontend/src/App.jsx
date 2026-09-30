import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Cursor from './components/Cursor'
import Noise from './components/Noise'

// Pages
import Home from './pages/Home'
import Photographers from './pages/Photographers'
import PhotographerDetail from './pages/PhotographerDetail'
import Login from './pages/Login'
import Sessions from './pages/Sessions'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

// Route Guards
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return children
}

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  out: { opacity: 0, y: -20, transition: { duration: 0.4, ease: 'easeIn' } }
}

const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
  >
    {children}
  </motion.div>
)

function AppRoutes() {
  const location = useLocation()
  
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/photographers" element={<PageWrapper><Photographers /></PageWrapper>} />
          <Route path="/photographers/:id" element={<PageWrapper><PhotographerDetail /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          
          {/* Protected */}
          <Route path="/sessions" element={
            <ProtectedRoute><PageWrapper><Sessions /></PageWrapper></ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['photographer']}><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><PageWrapper><Admin /></PageWrapper></ProtectedRoute>
          } />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Cursor />
      <Noise />
      <AppRoutes />
    </AuthProvider>
  )
}
