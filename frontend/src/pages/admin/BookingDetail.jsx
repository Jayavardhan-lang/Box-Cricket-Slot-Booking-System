import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, CalendarDays, IndianRupee, Users } from 'lucide-react'
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
  const [booking, setBooking]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [acting, setActing]     = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await axios.get(`${API_URL}/bookings/${id}`)
      setBooking(data.data)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

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
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin/bookings')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a5c2a] transition-colors font-medium">
            <ArrowLeft size={16} /> Back to Bookings
          </button>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : !booking ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Booking not found</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Booking #{booking.id}</h1>
                <p className="text-gray-500 text-sm">
                  Created on {new Date(booking.booked_at).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <StatusBadge status={booking.booking_status} />
                <StatusBadge status={booking.payment_status} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Customer Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                  <User size={16} className="text-[#1a5c2a]" /> Customer Info
                </h2>
                <div className="space-y-3 text-sm">
                  <InfoRow label="Name"   value={booking.customer_name} />
                  <InfoRow label="Phone"  value={booking.phone} />
                  <InfoRow label="Email"  value={booking.email || '—'} />
                  <InfoRow label="Type"   value={<span className="capitalize">{booking.customer_type}</span>} />
                </div>
              </div>

              {/* Slot Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#1a5c2a]" /> Slot Info
                </h2>
                <div className="space-y-3 text-sm">
                  <InfoRow label="Date"       value={formatDate(booking.date)} />
                  <InfoRow label="Start Time" value={formatTime(booking.start_time)} />
                  <InfoRow label="End Time"   value={formatTime(booking.end_time)} />
                  <InfoRow label="Slot Price" value={<span className="font-bold text-[#16a34a]">₹{booking.price}</span>} />
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
              <h2 className="font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                <Users size={16} className="text-[#1a5c2a]" /> Booking Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <InfoRow label="Team Name"  value={booking.team_name} />
                <InfoRow label="Players"    value={booking.num_players} />
                <InfoRow label="Amount"     value={<span className="font-bold text-[#16a34a]">₹{booking.total_amount}</span>} />
                <InfoRow label="Notes"      value={booking.notes || '—'} />
              </div>
            </div>

            {/* Payment History */}
            {booking.payments?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                <h2 className="font-bold text-[#1a1a1a] mb-4">Payment History</h2>
                <table className="w-full text-sm">
                  <thead className="text-gray-500 text-xs">
                    <tr>
                      {['ID','Amount','Method','Status','Date'].map(h => (
                        <th key={h} className="text-left py-2 pr-4 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {booking.payments.map(p => (
                      <tr key={p.id}>
                        <td className="py-2 pr-4">#{p.id}</td>
                        <td className="py-2 pr-4 font-semibold text-[#16a34a]">₹{p.amount}</td>
                        <td className="py-2 pr-4 capitalize">{p.payment_method}</td>
                        <td className="py-2 pr-4"><StatusBadge status={p.payment_status} /></td>
                        <td className="py-2 pr-4 text-gray-500">{new Date(p.paid_at).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-[#1a1a1a] mb-4">Admin Actions</h2>
              <div className="flex flex-wrap gap-3">
                {booking.booking_status !== 'confirmed' && (
                  <button onClick={() => handleStatus('confirmed')} disabled={!!acting}
                    className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                    style={{ backgroundColor: '#16a34a' }}>
                    {acting === 'confirmed' ? <Spinner size="sm" color="white" /> : null}
                    ✓ Confirm Booking
                  </button>
                )}
                {booking.booking_status !== 'cancelled' && (
                  <button onClick={() => handleStatus('cancelled')} disabled={!!acting}
                    className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-2">
                    {acting === 'cancelled' ? <Spinner size="sm" color="white" /> : null}
                    ✗ Cancel Booking
                  </button>
                )}
                {booking.payment_status !== 'paid' && (
                  <button onClick={handleMarkPaid} disabled={!!acting}
                    className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-60 flex items-center gap-2">
                    {acting === 'paid' ? <Spinner size="sm" color="white" /> : null}
                    💳 Mark as Paid
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
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
