import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays, IndianRupee, LayoutGrid, CreditCard,
  Trophy, Users, CheckCircle, XCircle, RefreshCw,
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
  const [summary, setSummary]   = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [actionErr, setActionErr] = useState('')
  const [actioning, setActioning] = useState(null)

  const load = async () => {
    setLoading(true); setError('')
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

  useEffect(() => { load() }, [])

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
    { title: "Today's Bookings",    value: summary.today_bookings,      icon: <CalendarDays size={24} />, color: '#3b82f6' },
    { title: 'Monthly Revenue',     value: `₹${summary.monthly_revenue.toLocaleString()}`, icon: <IndianRupee size={24} />, color: '#16a34a' },
    { title: 'Available Slots Today', value: summary.available_slots_today, icon: <LayoutGrid size={24} />, color: '#d97706' },
    { title: 'Active Memberships',  value: summary.active_memberships,  icon: <CreditCard size={24} />, color: '#8b5cf6' },
    { title: 'Upcoming Tournaments',value: summary.upcoming_tournaments, icon: <Trophy size={24} />,     color: '#f97316' },
    { title: 'Total Customers',     value: summary.total_customers,     icon: <Users size={24} />,      color: '#6b7280' },
  ] : []

  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, Eagle Admin 👋</p>
          </div>
          <button onClick={load} className="flex items-center gap-1.5 text-sm text-[#1a5c2a] hover:underline font-medium">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error     && <Alert type="error"   message={error}     />}
        {actionMsg && <Alert type="success" message={actionMsg} onClose={() => setActionMsg('')} autoClose={3000} />}
        {actionErr && <Alert type="error"   message={actionErr} onClose={() => setActionErr('')} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
              {summaryCards.map((c, i) => (
                <SummaryCard key={i} title={c.title} value={c.value} icon={c.icon} color={c.color} />
              ))}
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-[#1a1a1a]">Recent Bookings</h2>
                <button onClick={() => navigate('/admin/bookings')} className="text-sm text-[#1a5c2a] hover:underline font-medium">
                  View All →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['ID','Customer','Phone','Team','Date','Time','Status','Payment','Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-10 text-gray-400">No bookings yet</td></tr>
                    ) : bookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-[#1a5c2a]">#{b.id}</td>
                        <td className="px-4 py-3 font-medium">{b.customer_name}</td>
                        <td className="px-4 py-3 text-gray-500">{b.phone}</td>
                        <td className="px-4 py-3">{b.team_name}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(b.date)}</td>
                        <td className="px-4 py-3 text-gray-500">{formatTime(b.start_time)}</td>
                        <td className="px-4 py-3"><StatusBadge status={b.booking_status} /></td>
                        <td className="px-4 py-3"><StatusBadge status={b.payment_status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {b.booking_status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAction(b.id, 'confirmed')}
                                  disabled={actioning === b.id + 'confirmed'}
                                  className="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors disabled:opacity-60"
                                >
                                  {actioning === b.id + 'confirmed' ? '...' : '✓'}
                                </button>
                                <button
                                  onClick={() => handleAction(b.id, 'cancelled')}
                                  disabled={actioning === b.id + 'cancelled'}
                                  className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors disabled:opacity-60"
                                >
                                  {actioning === b.id + 'cancelled' ? '...' : '✗'}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => navigate(`/admin/bookings/${b.id}`)}
                              className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
