import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays, IndianRupee, LayoutGrid, CreditCard,
  Trophy, Users, CheckCircle, XCircle, RefreshCw, Eye
} from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import StatusBadge from '../../components/StatusBadge'
import SummaryCard from '../../components/SummaryCard'
import { API_URL } from '../../config'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':'); const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [actionErr, setActionErr] = useState('')
  const [actioning, setActioning] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [sumRes, bookRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/summary`),
        axios.get(`${API_URL}/bookings`),
      ])
      setSummary(sumRes.data.data)
      setBookings((bookRes.data.data || []).slice(0, 10))
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAction = async (id, status) => {
    setActioning(id + status)
    try {
      await axios.put(`${API_URL}/bookings/${id}/status`, { status })
      setActionMsg(`Booking #${id} ${status} successfully`)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: status } : b))
    } catch (e) {
      setActionErr(e.response?.data?.message || 'Action failed')
    } finally {
      setActioning(null)
    }
  }

  const summaryCards = summary ? [
    { title: "Today's Bookings", value: summary.today_bookings, icon: <CalendarDays size={20} />, color: '#2196f3' },
    { title: 'Monthly Revenue', value: `₹${summary.monthly_revenue.toLocaleString()}`, icon: <IndianRupee size={20} />, color: '#00c853' },
    { title: 'Available Slots Today', value: summary.available_slots_today, icon: <LayoutGrid size={20} />, color: '#ffd700' },
    { title: 'Active Memberships', value: summary.active_memberships, icon: <CreditCard size={20} />, color: '#7c4dff' },
    { title: 'Upcoming Tournaments', value: summary.upcoming_tournaments, icon: <Trophy size={20} />, color: '#ff6f00' },
    { title: 'Total Customers', value: summary.total_customers, icon: <Users size={20} />, color: '#00bcd4' },
  ] : []

  return (
    <div className="flex min-h-screen bg-brand-dark text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white tracking-wide uppercase">DASHBOARD</h1>
            <p className="font-sans text-xs text-brand-greyMedium uppercase mt-1">Welcome back, Eagle Manager 👋</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 bg-brand-greyDark border border-white/10 rounded-xl font-heading font-extrabold text-[11px] tracking-wider text-primary hover:text-white hover:border-primary/50 transition-colors uppercase cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>REFRESH</span>
          </button>
        </div>

        {error && <Alert type="error" message={error} />}
        {actionMsg && <Alert type="success" message={actionMsg} onClose={() => setActionMsg('')} autoClose={3000} />}
        {actionErr && <Alert type="error" message={actionErr} onClose={() => setActionErr('')} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
              {summaryCards.map((c, i) => (
                <SummaryCard key={i} title={c.title} value={c.value} icon={c.icon} color={c.color} />
              ))}
            </div>

            {/* Recent Bookings Panel */}
            <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-black/45">
                <h2 className="font-heading font-black text-xs text-secondary tracking-widest uppercase">RECENT BOOKINGS</h2>
                <button
                  onClick={() => navigate('/admin/bookings')}
                  className="font-heading font-extrabold text-[11px] text-primary hover:text-primary-light uppercase tracking-wider cursor-pointer"
                >
                  VIEW ALL →
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-brand-greyDark/40 text-brand-greyMedium text-[10px] font-accent font-bold tracking-widest uppercase border-b border-white/5">
                    <tr>
                      {['ID', 'Customer', 'Phone', 'Team', 'Date', 'Time', 'Status', 'Payment', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-brand-greyMedium font-sans text-xs">
                          No bookings recorded yet.
                        </td>
                      </tr>
                    ) : (
                      bookings.map(b => (
                        <tr key={b.id} className="hover:bg-primary/5 transition-colors font-sans text-xs text-white/95">
                          <td className="px-6 py-4 font-bold text-primary">#{b.id}</td>
                          <td className="px-6 py-4 font-semibold">{b.customer_name}</td>
                          <td className="px-6 py-4 text-brand-greyMedium">{b.phone}</td>
                          <td className="px-6 py-4">{b.team_name}</td>
                          <td className="px-6 py-4 text-brand-greyMedium">{formatDate(b.date)}</td>
                          <td className="px-6 py-4 text-brand-greyMedium">{formatTime(b.start_time)}</td>
                          <td className="px-6 py-4"><StatusBadge status={b.booking_status} /></td>
                          <td className="px-6 py-4"><StatusBadge status={b.payment_status} /></td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {b.booking_status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleAction(b.id, 'confirmed')}
                                    disabled={actioning === b.id + 'confirmed'}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer font-bold disabled:opacity-50"
                                    title="Confirm"
                                  >
                                    {actioning === b.id + 'confirmed' ? '..' : '✓'}
                                  </button>
                                  <button
                                    onClick={() => handleAction(b.id, 'cancelled')}
                                    disabled={actioning === b.id + 'cancelled'}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-error/10 border border-error/30 text-error hover:bg-error hover:text-white transition-all cursor-pointer font-bold disabled:opacity-50"
                                    title="Cancel"
                                  >
                                    {actioning === b.id + 'cancelled' ? '..' : '✗'}
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => navigate(`/admin/bookings/${b.id}`)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-primary/20 hover:text-primary transition-all cursor-pointer"
                                title="View Details"
                              >
                                <Eye size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
