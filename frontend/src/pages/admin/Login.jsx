import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, User, ShieldCheck, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'

export default function AdminLogin() {
  const { login, isLoggedIn, authStatus } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authStatus === 'ready' && isLoggedIn) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isLoggedIn, authStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.password) {
      setError('Please enter your username and password')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(form.username.trim(), form.password)
    if (result.success) {
      navigate('/admin/dashboard', { replace: true })
    } else {
      setError(result.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row relative overflow-hidden">

      <div className="flex-1 md:flex-[1.5] bg-gradient-to-br from-brand-dark via-[#0d2818] to-brand-dark relative flex flex-col items-center justify-center p-8 sm:p-12 border-b md:border-b-0 md:border-r border-primary/25 z-10">

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

      <div className="flex-1 bg-brand-card flex items-center justify-center p-8 sm:p-12 z-10">
        <div className="w-full max-w-md">

          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-8 text-white/50 hover:text-primary font-heading font-bold text-[12px] tracking-wider uppercase transition-all duration-300 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Return to Home
          </Link>

          <div className="text-center md:text-left mb-8">
            <h2 className="font-display text-4xl text-white tracking-wide uppercase leading-none mb-2">ADMIN LOGIN</h2>
            <p className="font-sans text-xs text-brand-greyMedium uppercase tracking-wider">
              Access the secure management portal
            </p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">

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
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3 bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl text-sm text-white focus:outline-none transition-all font-sans"
                />
              </div>
            </div>

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
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-3 bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl text-sm text-white focus:outline-none transition-all font-sans"
                />
              </div>
            </div>

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

          <div className="mt-8 p-5 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col items-center gap-3 text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/30">
              <ShieldCheck size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-black text-sm text-white tracking-wider uppercase mb-1">
                🔒 Authorized Administrator Access
              </p>
              <p className="font-sans text-[11px] text-brand-greyMedium leading-relaxed">
                This management portal is restricted to Eagle Box Cricket administrators.
                Please sign in using your assigned credentials.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
