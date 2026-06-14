import { useState } from 'react'
import axios from 'axios'
import { Search, Phone, Calendar, Users, IndianRupee, Clock, Trash } from 'lucide-react'
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
  const [phone, setPhone] = useState('')
  const [bookings, setBookings] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cancelling, setCancelling] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit phone number')
      return
    }
    setLoading(true)
    setError('')
    setSearched(false)
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
    <div className="min-h-screen flex flex-col bg-brand-dark text-white pt-[70px]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center sm:text-left flex flex-col items-center sm:items-start">
          <span className="font-accent text-secondary tracking-[3px] text-xs font-bold uppercase block mb-2">
            ⚡ MY ACCOUNT
          </span>
          <h1 className="font-display text-5xl sm:text-6xl text-white tracking-tight uppercase">
            MY BOOKINGS
          </h1>
          <div className="w-16 h-1 bg-primary mt-3 mb-4 rounded-full" />
          <p className="font-sans text-sm text-brand-greyMedium max-w-md">
            Enter the 10-digit mobile number used during booking to track your slot status.
          </p>
        </div>

        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={4000} />}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Phone Search Section */}
        <form
          onSubmit={handleSearch}
          className="bg-brand-card border border-primary/25 rounded-3xl p-6 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5)] glow-green transition-all duration-300 mb-10"
        >
          <h2 className="font-heading font-black text-secondary tracking-[2px] text-xs uppercase mb-4">
            FIND YOUR BOOKINGS
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <input
                id="mybookings-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter your 10-digit phone number"
                className="w-full pl-11 pr-4 py-3.5 bg-brand-greyDark/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-heading font-extrabold text-[12px] tracking-wider rounded-xl transition-all hover:scale-105 disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,200,83,0.2)] cursor-pointer uppercase"
            >
              {loading ? <Spinner size="sm" color="white" /> : <Search size={14} />}
              <span>SEARCH</span>
            </button>
          </div>
        </form>

        {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

        {!loading && searched && bookings.length === 0 && (
          <div className="text-center py-20 bg-brand-card border border-white/5 rounded-3xl">
            <div className="text-6xl mb-4 animate-float-slow">🏏</div>
            <h3 className="font-heading font-black text-lg text-white uppercase">No Bookings Found</h3>
            <p className="font-sans text-xs text-brand-greyMedium mt-1">No bookings match the phone number provided.</p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-accent text-xs text-brand-greyMedium tracking-wider uppercase">
                {bookings.length} BOOKING{bookings.length > 1 ? 'S' : ''} FOUND
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {bookings.map(b => (
                <div
                  key={b.id}
                  className="bg-brand-card border-l-4 border-primary rounded-2xl p-6 shadow-[0_8px_25px_rgba(0,0,0,0.4)] hover:scale-[1.01] transition-transform duration-300 flex flex-col justify-between"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                    <div>
                      <span className="font-accent text-[9px] text-brand-greyMedium tracking-widest uppercase font-bold">BOOKING ID</span>
                      <h3 className="font-display text-2xl text-primary mt-0.5">#{String(b.id).padStart(3, '0')}</h3>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="font-accent text-[9px] text-brand-greyMedium tracking-widest uppercase font-bold">SCHEDULED TIME</span>
                      <p className="font-heading font-bold text-sm text-white mt-0.5">{formatDate(b.date)}</p>
                      <p className="font-sans text-xs text-secondary mt-0.5">⏱ {formatTime(b.start_time)} – {formatTime(b.end_time)}</p>
                    </div>
                  </div>

                  {/* Booking Metadata */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans mb-6">
                    <div>
                      <p className="text-brand-greyMedium font-medium uppercase text-[10px] tracking-wider mb-1">TEAM NAME</p>
                      <p className="font-bold text-white text-sm">{b.team_name}</p>
                    </div>
                    <div>
                      <p className="text-brand-greyMedium font-medium uppercase text-[10px] tracking-wider mb-1">PLAYERS</p>
                      <p className="font-bold text-white text-sm flex items-center gap-1">
                        <Users size={12} className="text-primary" />
                        {b.num_players} Squad
                      </p>
                    </div>
                    <div>
                      <p className="text-brand-greyMedium font-medium uppercase text-[10px] tracking-wider mb-1">TOTAL AMOUNT</p>
                      <p className="font-bold text-primary text-sm flex items-center gap-0.5">
                        <IndianRupee size={12} />
                        {parseInt(b.total_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-brand-greyMedium font-medium uppercase text-[10px] tracking-wider mb-1">BOOKED ON</p>
                      <p className="font-semibold text-white text-xs">{new Date(b.booked_at).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Actions & Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                    <div className="flex gap-2 flex-wrap">
                      <StatusBadge status={b.booking_status} />
                      <StatusBadge status={b.payment_status} />
                    </div>
                    {b.booking_status === 'pending' && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancelling === b.id}
                        className="px-4 py-2 border border-error/30 text-error hover:bg-error hover:text-white transition-all duration-300 font-heading font-black text-[11px] tracking-wider rounded-xl disabled:opacity-50 flex items-center gap-1.5 cursor-pointer uppercase"
                      >
                        {cancelling === b.id ? <Spinner size="sm" color="white" /> : <Trash size={12} />}
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
