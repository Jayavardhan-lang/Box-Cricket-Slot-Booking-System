import { X } from 'lucide-react'
import { useEffect } from 'react'

function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        className={`relative bg-[#111111] border border-primary/30 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] w-full ${maxWidth} max-h-[90vh] flex flex-col`}
      >

        <div
          className="flex items-center justify-between px-6 py-4 border-b border-primary/25 bg-black rounded-t-2xl"
        >
          <h2 className="text-white font-heading font-extrabold tracking-wider text-lg uppercase">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 text-white">{children}</div>
      </div>
    </div>
  )
}

export default Modal
