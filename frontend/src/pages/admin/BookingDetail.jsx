import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, CalendarDays, IndianRupee, Users, CreditCard, ClipboardList } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import StatusBadge from '../../components/StatusBadge'
import { API_URL } from '../../config'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':'); const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [acting, setActing] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`${API_URL}/bookings/${id}`)
      setBooking(data.data)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleStatus = async (status) => {
    setActing(status)
    try {
      await axios.put(`${API_URL}/bookings/${id}/status`, { status })
      setSuccess(`Booking ${status} successfully`)
      setBooking(prev => ({ ...prev, booking_status: status }))
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed')
    } finally {
      setActing('')
    }
  }

  const handleMarkPaid = async () => {
    setActing('paid')
    try {
      await axios.put(`${API_URL}/bookings/${id}/payment`, { payment_status: 'paid', payment_method: 'cash' })
      setSuccess('Booking marked as paid')
      setBooking(prev => ({ ...prev, payment_status: 'paid' }))
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to mark paid')
    } finally {
      setActing('')
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-dark text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">

        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/bookings')}
            className="flex items-center gap-2 font-heading font-extrabold text-[11px] tracking-wider text-brand-greyMedium hover:text-primary transition-colors uppercase cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Bookings</span>
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : !booking ? (
          <div className="text-center py-20 bg-brand-card border border-white/5 rounded-2xl">
            <h3 className="font-heading font-black text-sm text-white uppercase">Booking Not Found</h3>
          </div>
        ) : (
          <>

            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-6 mb-8">
              <div>
                <h1 className="font-display text-4xl text-white tracking-wide uppercase leading-none">BOOKING #{booking.id}</h1>
                <p className="font-sans text-xs text-brand-greyMedium mt-2">
                  Registered on {new Date(booking.booked_at).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex gap-2.5 flex-wrap">
                <StatusBadge status={booking.booking_status} />
                <StatusBadge status={booking.payment_status} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
                <h2 className="font-heading font-black text-xs text-secondary tracking-widest uppercase mb-6 flex items-center gap-2.5">
                  <User size={15} className="text-primary" />
                  <span>CUSTOMER INFORMATION</span>
                </h2>
                <div className="space-y-4 text-xs font-sans">
                  <InfoRow label="NAME" value={booking.customer_name} />
                  <InfoRow label="PHONE NUMBER" value={booking.phone} />
                  <InfoRow label="EMAIL ADDRESS" value={booking.email || '—'} />
                  <InfoRow label="CUSTOMER TYPE" value={<span className="capitalize text-primary font-bold">{booking.customer_type}</span>} />
                </div>
              </div>

              <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
                <h2 className="font-heading font-black text-xs text-secondary tracking-widest uppercase mb-6 flex items-center gap-2.5">
                  <CalendarDays size={15} className="text-primary" />
                  <span>SLOT LOGISTICS</span>
                </h2>
                <div className="space-y-4 text-xs font-sans">
                  <InfoRow label="MATCH DATE" value={formatDate(booking.date)} />
                  <InfoRow label="START TIME" value={formatTime(booking.start_time)} />
                  <InfoRow label="END TIME" value={formatTime(booking.end_time)} />
                  <InfoRow label="BASE PRICE" value={<span className="font-bold text-primary">₹{parseInt(booking.price)}</span>} />
                </div>
              </div>
            </div>

            <div className="bg-brand-card border border-white/5 rounded-2xl p-6 mb-6">
              <h2 className="font-heading font-black text-xs text-secondary tracking-widest uppercase mb-6 flex items-center gap-2.5">
                <ClipboardList size={15} className="text-primary" />
                <span>BOOKING SPECIFICS</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-sans">
                <InfoRow label="TEAM NAME" value={booking.team_name} />
                <InfoRow label="PLAYER COUNT" value={booking.num_players} />
                <InfoRow label="TOTAL AMOUNT" value={<span className="font-bold text-primary">₹{parseInt(booking.total_amount)}</span>} />
                <InfoRow label="RESERVATIONS NOTES" value={booking.notes || '—'} />
              </div>
            </div>

            {booking.payments?.length > 0 && (
              <div className="bg-brand-card border border-white/5 rounded-2xl p-6 mb-6">
                <h2 className="font-heading font-black text-xs text-secondary tracking-widest uppercase mb-6 flex items-center gap-2.5">
                  <CreditCard size={15} className="text-primary" />
                  <span>PAYMENT LEDGER</span>
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-brand-greyDark/40 text-brand-greyMedium text-[10px] font-accent font-bold tracking-widest uppercase border-b border-white/5">
                      <tr>
                        {['ID', 'Amount', 'Method', 'Status', 'Timestamp'].map(h => (
                          <th key={h} className="px-4 py-3 text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {booking.payments.map(p => (
                        <tr key={p.id} className="font-sans text-xs text-white/90">
                          <td className="py-3 px-4 font-semibold">#{p.id}</td>
                          <td className="py-3 px-4 font-bold text-primary">₹{parseInt(p.amount)}</td>
                          <td className="py-3 px-4 capitalize">{p.payment_method}</td>
                          <td className="py-3 px-4"><StatusBadge status={p.payment_status} /></td>
                          <td className="py-3 px-4 text-brand-greyMedium">{new Date(p.paid_at).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
              <h2 className="font-heading font-black text-xs text-secondary tracking-widest uppercase mb-6">ADMINISTRATOR COMMANDS</h2>
              <div className="flex flex-wrap gap-4">
                {booking.booking_status !== 'confirmed' && (
                  <button
                    onClick={() => handleStatus('confirmed')}
                    disabled={!!acting}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-heading font-extrabold text-[12px] tracking-wider rounded-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2 shadow-[0_4px_12px_rgba(0,200,83,0.2)] cursor-pointer uppercase"
                  >
                    {acting === 'confirmed' ? <Spinner size="sm" color="white" /> : null}
                    <span>✓ Confirm Booking</span>
                  </button>
                )}
                {booking.booking_status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatus('cancelled')}
                    disabled={!!acting}
                    className="px-6 py-3 bg-error/10 border border-error/30 text-error hover:bg-error hover:text-white transition-all duration-300 font-heading font-extrabold text-[12px] tracking-wider rounded-xl disabled:opacity-50 flex items-center gap-2 cursor-pointer uppercase"
                  >
                    {acting === 'cancelled' ? <Spinner size="sm" color="white" /> : null}
                    <span>✗ Cancel Booking</span>
                  </button>
                )}
                {booking.payment_status !== 'paid' && (
                  <button
                    onClick={handleMarkPaid}
                    disabled={!!acting}
                    className="px-6 py-3 bg-secondary/15 border border-secondary/30 text-secondary hover:bg-secondary hover:text-black transition-all text-[12px] font-heading font-extrabold tracking-wider rounded-xl disabled:opacity-50 flex items-center gap-2 cursor-pointer uppercase"
                  >
                    {acting === 'paid' ? <Spinner size="sm" color="white" /> : null}
                    <span>💳 Mark as Paid</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-brand-greyMedium font-accent text-[10px] tracking-wider uppercase">{label}</span>
      <span className="font-semibold text-right text-white">{value}</span>
    </div>
  )
}
