import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const configs = {
  success: { icon: CheckCircle, bg: 'rgba(0, 200, 83, 0.1)',  border: '#00c853', text: '#00c853', iconColor: '#00c853' },
  error:   { icon: XCircle,      bg: 'rgba(255, 23, 68, 0.1)',  border: '#ff1744', text: '#ff1744', iconColor: '#ff1744' },
  warning: { icon: AlertCircle,  bg: 'rgba(255, 145, 0, 0.1)',  border: '#ff9100', text: '#ff9100', iconColor: '#ff9100' },
  info:    { icon: Info,          bg: 'rgba(255, 255, 255, 0.05)', border: '#ffd700', text: '#ffd700', iconColor: '#ffd700' },
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
