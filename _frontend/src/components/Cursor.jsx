import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './Cursor.module.css'

export default function Cursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <motion.div
      className={styles.cursor}
      animate={{ x: pos.x - 20, y: pos.y - 20 }}
      transition={{ type: 'tween', ease: 'backOut', duration: 0.08 }}
    />
  )
}
