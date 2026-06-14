import { useState } from 'react'
import axios from 'axios'
import { Search, Phone } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import StatusBadge from '../components/StatusBadge'
import { API_URL } from '../config'

function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

export default function MyBookings() {
  const [phone, setPhone]       = useState('')
  const [bookings, setBookings] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [cancelling, setCancelling] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(phone)) { setError('Enter a valid 10-digit phone number'); return }
    setLoading(true); setError(''); setSearched(false)
    try {
      const { data } = await axios.get(`${API_URL}/bookings/phone/${phone}`)
      setBookings(data.data || [])
      setSearched(true)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This cannot be undone.')) return
    setCancelling(id)
    try {
      await axios.put(`${API_URL}/bookings/${id}/status`, { status: 'cancelled' })
      setSuccess('Booking cancelled successfully.')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: 'cancelled' } : b))
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-2">My Bookings</h1>
        <p className="text-gray-500 mb-8">Enter your phone number to view your booking history</p>

        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={4000} />}
        {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}

        {/* Phone Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="mybookings-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter your 10-digit phone number"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5c2a] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#1a5c2a' }}
            >
              {loading ? <Spinner size="sm" color="white" /> : <Search size={16} />}
              Search
            </button>
          </div>
        </form>

        {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

        {!loading && searched && bookings.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🏏</div>
            <p className="text-lg font-medium">No bookings found for this number</p>
            <p className="text-sm mt-1">Try booking a slot from the Book a Slot page</p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-medium">{bookings.length} booking{bookings.length > 1 ? 's' : ''} found</p>
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Booking</p>
                    <p className="font-extrabold text-[#1a5c2a] text-lg">#{b.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Date & Time</p>
                    <p className="font-semibold text-sm text-gray-700">{formatDate(b.date)}</p>
                    <p className="text-xs text-gray-500">{formatTime(b.start_time)} – {formatTime(b.end_time)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Team</p>
                    <p className="font-semibold">{b.team_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Players</p>
                    <p className="font-semibold">{b.num_players}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Amount</p>
                    <p className="font-semibold text-[#16a34a]">₹{b.total_amount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Booked On</p>
                    <p className="font-semibold">{new Date(b.booked_at).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2 flex-wrap">
                    <StatusBadge status={b.booking_status} />
                    <StatusBadge status={b.payment_status} />
                  </div>
                  {b.booking_status === 'pending' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={cancelling === b.id}
                      className="px-4 py-2 rounded-xl text-white text-sm font-semibold bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {cancelling === b.id ? <Spinner size="sm" color="white" /> : null}
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
