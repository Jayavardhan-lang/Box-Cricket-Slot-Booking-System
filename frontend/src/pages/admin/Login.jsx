import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'

export default function AdminLogin() {
  const { login, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (isLoggedIn) navigate('/admin/dashboard', { replace: true }) }, [isLoggedIn])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { setError('Please enter username and password'); return }
    setLoading(true); setError('')
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
    <div
      style={{ background: 'linear-gradient(135deg, #1a5c2a 0%, #134520 100%)' }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      {/* decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 bg-white translate-x-32 -translate-y-20" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏏</div>
          <h1 className="text-3xl font-extrabold text-white">Eagle Box Cricket</h1>
          <p className="text-white/60 text-sm mt-1">Admin Control Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-6 text-center">Sign In to Admin</h2>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-username"
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5c2a] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5c2a] transition-colors"
                />
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#1a5c2a' }}
            >
              {loading ? <><Spinner size="sm" color="white" /> Signing in...</> : '🔐 Login to Admin'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-400 text-center">
            Demo: <span className="font-mono font-semibold">eagleadmin</span> / <span className="font-mono font-semibold">eagle@123</span>
          </div>
        </div>
      </div>
    </div>
  )
}
