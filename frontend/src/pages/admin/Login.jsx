import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, ShieldAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'

export default function AdminLogin() {
  const { login, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate('/admin/dashboard', { replace: true })
  }, [isLoggedIn])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Please enter username and password')
      return
    }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 400)) // slight delay for UX
    const result = login(form.username, form.password)
    if (result.success) {
      navigate('/admin/dashboard', { replace: true })
    } else {
      setError('Invalid credentials. Try eagleadmin / eagle@123')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row relative overflow-hidden">
      
      {/* ── Left Side Panel (60% on desktop) ── */}
      <div className="flex-1 md:flex-[1.5] bg-gradient-to-br from-brand-dark via-[#0d2818] to-brand-dark relative flex flex-col items-center justify-center p-8 sm:p-12 border-b md:border-b-0 md:border-r border-primary/25 z-10">
        
        {/* Floating background SVGs */}
        <div className="absolute top-[10%] left-[10%] text-6xl opacity-5 animate-float-slow select-none">🏏</div>
        <div className="absolute bottom-[10%] right-[10%] text-6xl opacity-5 animate-float-medium select-none">🏆</div>
        
        <div className="max-w-md text-center md:text-left flex flex-col items-center md:items-start">
          <span className="font-accent text-secondary tracking-[3px] text-xs font-bold uppercase block mb-3">
            ⚡ GATEWAY
          </span>
          <h1 className="leading-none mb-4 text-center md:text-left">
            <span className="font-display text-5xl sm:text-7xl text-white tracking-tight uppercase leading-none block">EAGLE</span>
            <span className="font-display text-5xl sm:text-7xl text-primary tracking-tight uppercase leading-none block">BOX CRICKET</span>
          </h1>
          <p className="font-sans text-sm text-brand-greyMedium mb-8 leading-relaxed text-center md:text-left">
            Eagle Box Cricket staff administration node. Log in to manage schedules, track revenue metrics, and configure leagues.
          </p>

          {/* Features pills */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 max-w-sm">
            <span className="font-accent text-[10px] font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-full uppercase tracking-wider">
              📊 Stats Dashboard
            </span>
            <span className="font-accent text-[10px] font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-full uppercase tracking-wider">
              🏏 Slot Management
            </span>
            <span className="font-accent text-[10px] font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-full uppercase tracking-wider">
              📋 PDF Reports
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Side Panel (40% on desktop) ── */}
      <div className="flex-1 bg-brand-card flex items-center justify-center p-8 sm:p-12 z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center md:text-left mb-8">
            <h2 className="font-display text-4xl text-white tracking-wide uppercase leading-none mb-2">ADMIN LOGIN</h2>
            <p className="font-sans text-xs text-brand-greyMedium uppercase tracking-wider">
              Access the secure management portal
            </p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block font-accent text-[11px] font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                USERNAME
              </label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  id="admin-username"
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Enter username"
                  className="w-full pl-11 pr-4 py-3 bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl text-sm text-white focus:outline-none transition-all font-sans"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-accent text-[11px] font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  id="admin-password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-4 py-3 bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl text-sm text-white focus:outline-none transition-all font-sans"
                />
              </div>
            </div>

            {/* Actions */}
            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-heading font-extrabold text-[12px] tracking-wider rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,200,83,0.3)] cursor-pointer uppercase"
            >
              {loading ? (
                <>
                  <Spinner size="sm" color="white" />
                  <span>AUTHORIZING...</span>
                </>
              ) : (
                <span>LOGIN →</span>
              )}
            </button>
          </form>

          {/* Credentials Tips */}
          <div className="mt-8 p-4 bg-brand-greyDark/85 border border-white/5 rounded-2xl text-[11px] text-brand-greyMedium text-center font-sans">
            Demo Portal Credentials:<br />
            Username: <strong className="font-mono text-white">eagleadmin</strong> | Password: <strong className="font-mono text-white">eagle@123</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
