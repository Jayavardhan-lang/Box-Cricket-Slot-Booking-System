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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [page, setPage] = useState(1)
  const [acting, setActing] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`${API_URL}/bookings`)
      setBookings(data.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => bookings.filter(b => {
    const s = search.toLowerCase()
    const matchSearch = !s || b.customer_name?.toLowerCase().includes(s) || b.phone?.includes(s) || String(b.id).includes(s)
    const matchStatus = !statusFilter || b.booking_status === statusFilter
    const matchPayment = !paymentFilter || b.payment_status === paymentFilter
    return matchSearch && matchStatus && matchPayment
  }), [bookings, search, statusFilter, paymentFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
    <div className="flex min-h-screen bg-brand-dark text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">

        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-6 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white tracking-wide uppercase">ALL BOOKINGS</h1>
            <p className="font-sans text-xs text-brand-greyMedium uppercase mt-1">{filtered.length} total bookings filtered</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 bg-brand-greyDark border border-white/10 rounded-xl font-heading font-extrabold text-[11px] tracking-wider text-primary hover:text-white hover:border-primary/50 transition-colors uppercase cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>REFRESH</span>
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

        <div className="bg-brand-card border border-primary/20 rounded-3xl p-5 mb-8 flex flex-wrap gap-4 shadow-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, phone, or ID..."
              className="w-full pl-11 pr-4 py-3 bg-brand-greyDark border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-sans"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none transition-all cursor-pointer font-sans"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={e => { setPaymentFilter(e.target.value); setPage(1) }}
            className="bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none transition-all cursor-pointer font-sans"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            {paginated.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 animate-float-slow">📋</div>
                <h3 className="font-heading font-black text-sm text-white uppercase">No Bookings Found</h3>
                <p className="font-sans text-xs text-brand-greyMedium mt-1">Try resetting the filter criteria.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-brand-greyDark/40 text-brand-greyMedium text-[10px] font-accent font-bold tracking-widest uppercase border-b border-white/5">
                      <tr>
                        {['ID', 'Customer', 'Phone', 'Team', 'Date', 'Time', 'Players', 'Amount', 'Status', 'Payment', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-4 text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginated.map(b => (
                        <tr key={b.id} className="hover:bg-primary/5 transition-colors font-sans text-xs text-white/95">
                          <td className="px-6 py-4 font-bold text-primary text-xs">#{b.id}</td>
                          <td className="px-6 py-4 font-semibold">{b.customer_name}</td>
                          <td className="px-6 py-4 text-brand-greyMedium">{b.phone}</td>
                          <td className="px-6 py-4">{b.team_name}</td>
                          <td className="px-6 py-4 text-brand-greyMedium whitespace-nowrap">{formatDate(b.date)}</td>
                          <td className="px-6 py-4 text-brand-greyMedium whitespace-nowrap">{formatTime(b.start_time)}</td>
                          <td className="px-6 py-4 text-center">{b.num_players}</td>
                          <td className="px-6 py-4 font-bold text-primary">₹{parseInt(b.total_amount)}</td>
                          <td className="px-6 py-4"><StatusBadge status={b.booking_status} /></td>
                          <td className="px-6 py-4"><StatusBadge status={b.payment_status} /></td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap min-w-[150px]">
                              <button
                                onClick={() => navigate(`/admin/bookings/${b.id}`)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-primary/10 hover:text-primary transition-all text-[11px] font-extrabold tracking-wider uppercase cursor-pointer"
                              >
                                View
                              </button>
                              {b.booking_status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleAction(b.id, 'status', 'confirmed')}
                                    disabled={!!acting}
                                    className="px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all text-[11px] font-extrabold tracking-wider uppercase cursor-pointer"
                                  >
                                    {acting === b.id + 'status' ? '...' : 'Confirm'}
                                  </button>
                                  <button
                                    onClick={() => handleAction(b.id, 'status', 'cancelled')}
                                    disabled={!!acting}
                                    className="px-3 py-1.5 rounded-lg bg-error/15 border border-error/30 text-error hover:bg-error hover:text-white transition-all text-[11px] font-extrabold tracking-wider uppercase cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {b.payment_status !== 'paid' && (
                                <button
                                  onClick={() => handleAction(b.id, 'payment', 'paid')}
                                  disabled={!!acting}
                                  className="px-3 py-1.5 rounded-lg bg-secondary/15 border border-secondary/30 text-secondary hover:bg-secondary hover:text-black transition-all text-[11px] font-extrabold tracking-wider uppercase cursor-pointer"
                                >
                                  Paid
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-6 border-t border-white/5 bg-black/45">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3.5 py-1.5 rounded-lg border border-white/10 text-xs text-white disabled:opacity-40 hover:bg-white/5 transition-colors cursor-pointer font-sans"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-lg text-xs font-heading font-extrabold transition-all cursor-pointer
                          ${n === page ? 'bg-primary text-white shadow-md' : 'text-brand-greyMedium hover:bg-white/5 hover:text-white'}`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3.5 py-1.5 rounded-lg border border-white/10 text-xs text-white disabled:opacity-40 hover:bg-white/5 transition-colors cursor-pointer font-sans"
                    >
                      Next →
                    </button>
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
