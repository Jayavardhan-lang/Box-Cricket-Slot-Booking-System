import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const configs = {
  success: { icon: CheckCircle, bg: '#f0fdf4', border: '#16a34a', text: '#15803d', iconColor: '#16a34a' },
  error:   { icon: XCircle,      bg: '#fef2f2', border: '#dc2626', text: '#b91c1c', iconColor: '#dc2626' },
  warning: { icon: AlertCircle,  bg: '#fffbeb', border: '#d97706', text: '#92400e', iconColor: '#d97706' },
  info:    { icon: Info,          bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8', iconColor: '#3b82f6' },
}

function Alert({ type = 'info', message, onClose, autoClose = 0 }) {
  const [visible, setVisible] = useState(true)
  const cfg = configs[type] || configs.info
  const Icon = cfg.icon

  useEffect(() => {
    if (autoClose > 0) {
      const t = setTimeout(() => { setVisible(false); onClose?.() }, autoClose)
      return () => clearTimeout(t)
    }
  }, [autoClose, onClose])

  if (!visible || !message) return null

  return (
    <div
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border, color: cfg.text }}
      className="flex items-start gap-3 p-4 rounded-xl border mb-4 text-sm font-medium"
    >
      <Icon size={18} style={{ color: cfg.iconColor }} className="shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={() => { setVisible(false); onClose() }}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export default Alert
