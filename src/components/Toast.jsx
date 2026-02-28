import { useState, useCallback, useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const show = useCallback((msg, type = 'ok') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000)
  }, [])

  return { toasts, show }
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'ok'
            ? <CheckCircle size={16} />
            : <AlertCircle size={16} />}
          <span>{t.msg}</span>
          <button className="toast-close" onClick={() => onDismiss(t.id)}>
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
