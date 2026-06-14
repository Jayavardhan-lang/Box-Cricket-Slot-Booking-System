import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Search, RefreshCw, Eye, CheckCircle, XCircle, IndianRupee } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import StatusBadge from '../../components/StatusBadge'
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

const PAGE_SIZE = 10

export default function AdminBookings() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter]   = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [page, setPage]         = useState(1)
  const [acting, setActing]     = useState(null)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await axios.get(`${API_URL}/bookings`)
      setBookings(data.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => bookings.filter(b => {
    const s = search.toLowerCase()
    const matchSearch  = !s || b.customer_name?.toLowerCase().includes(s) || b.phone?.includes(s) || String(b.id).includes(s)
    const matchStatus  = !statusFilter  || b.booking_status  === statusFilter
    const matchPayment = !paymentFilter || b.payment_status === paymentFilter
    return matchSearch && matchStatus && matchPayment
  }), [bookings, search, statusFilter, paymentFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleAction = async (id, type, value) => {
    setActing(id + type)
    try {
      if (type === 'status') {
        await axios.put(`${API_URL}/bookings/${id}/status`, { status: value })
        setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: value } : b))
      } else {
        await axios.put(`${API_URL}/bookings/${id}/payment`, { payment_status: 'paid', payment_method: 'cash', amount: 0 })
        setBookings(prev => prev.map(b => b.id === id ? { ...b, payment_status: 'paid' } : b))
      }
      setSuccess(`Booking #${id} updated successfully`)
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed')
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a]">All Bookings</h1>
            <p className="text-gray-500 text-sm">{filtered.length} total bookings</p>
          </div>
          <button onClick={load} className="flex items-center gap-1.5 text-sm text-[#1a5c2a] hover:underline font-medium">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, phone, or ID..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5c2a]" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2a] bg-white">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2a] bg-white">
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {paginated.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📋</div>
                <p>No bookings found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                      <tr>
                        {['ID','Customer','Phone','Team','Date','Time','Players','Amount','Status','Payment','Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginated.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-[#1a5c2a]">#{b.id}</td>
                          <td className="px-4 py-3 font-medium">{b.customer_name}</td>
                          <td className="px-4 py-3 text-gray-500">{b.phone}</td>
                          <td className="px-4 py-3">{b.team_name}</td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(b.date)}</td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatTime(b.start_time)}</td>
                          <td className="px-4 py-3 text-center">{b.num_players}</td>
                          <td className="px-4 py-3 font-semibold text-[#16a34a]">₹{b.total_amount}</td>
                          <td className="px-4 py-3"><StatusBadge status={b.booking_status} /></td>
                          <td className="px-4 py-3"><StatusBadge status={b.payment_status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              <button onClick={() => navigate(`/admin/bookings/${b.id}`)}
                                className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200">View</button>
                              {b.booking_status === 'pending' && (
                                <>
                                  <button onClick={() => handleAction(b.id, 'status', 'confirmed')} disabled={!!acting}
                                    className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 disabled:opacity-60">
                                    {acting === b.id + 'status' ? '...' : 'Confirm'}
                                  </button>
                                  <button onClick={() => handleAction(b.id, 'status', 'cancelled')} disabled={!!acting}
                                    className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 disabled:opacity-60">Cancel</button>
                                </>
                              )}
                              {b.payment_status !== 'paid' && (
                                <button onClick={() => handleAction(b.id, 'payment', 'paid')} disabled={!!acting}
                                  className="px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 text-xs font-semibold hover:bg-yellow-200 disabled:opacity-60">Paid</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button key={n} onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                          ${n === page ? 'text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                        style={n === page ? { backgroundColor: '#1a5c2a' } : {}}>
                        {n}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
