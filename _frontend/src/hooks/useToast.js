import { useState, useEffect, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ msg: '', type: '', show: false })

  const showToast = useCallback((msg, type = 'default') => {
    setToast({ msg, type, show: true })
  }, [])

  useEffect(() => {
    if (!toast.show) return
    const t = setTimeout(() => setToast(p => ({ ...p, show: false })), 3000)
    return () => clearTimeout(t)
  }, [toast.show, toast.msg])

  return { toast, showToast }
}
