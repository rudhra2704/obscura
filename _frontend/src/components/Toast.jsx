import styles from './Toast.module.css'

export default function Toast({ msg, type, show }) {
  return (
    <div className={`${styles.toast} ${show ? styles.show : ''} ${styles[type] || ''}`}>
      {msg}
    </div>
  )
}
