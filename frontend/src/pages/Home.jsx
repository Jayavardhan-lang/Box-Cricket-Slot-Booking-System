import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CalendarDays, CheckCircle, Trophy, Users, Zap, Clock } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { API_URL } from '../config'

const today = new Date().toISOString().split('T')[0]

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

const features = [
  { icon: '🏏', title: 'Online Booking',        desc: 'Book slots in seconds, anytime anywhere' },
  { icon: '✅', title: 'Instant Confirmation',  desc: 'Get your booking ID immediately' },
  { icon: '🏆', title: 'Tournaments',           desc: 'Join exciting tournaments & win prizes' },
  { icon: '👥', title: 'Memberships',           desc: 'Save big with monthly membership plans' },
]

export default function Home() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(today)
  const [slots, setSlots]               = useState([])
  const [loading, setLoading]           = useState(false)

  const fetchSlots = async (date) => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API_URL}/slots?date=${date}`)
      setSlots(data.data || [])
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSlots(selectedDate) }, [selectedDate])

  const available = slots.filter(s => s.status === 'available')

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        style={{ background: 'linear-gradient(135deg, #1a5c2a 0%, #2d7a3f 60%, #134520 100%)' }}
        className="relative overflow-hidden"
      >
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 bg-white translate-x-32 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 bg-white -translate-x-20 translate-y-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Zap size={14} className="text-[#f5a623]" />
            Now Open 6:00 AM – 9:00 PM Daily
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Book Your Box Cricket<br />
            <span className="text-[#f5a623]">Slot Instantly</span>
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            No calls. No WhatsApp. Just pick your slot and play.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              id="hero-book-btn"
              onClick={() => navigate('/book-slot')}
              className="px-8 py-3.5 bg-[#f5a623] hover:bg-[#d4891a] text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
            >
              🏏 Book Now
            </button>
            <button
              id="hero-tournaments-btn"
              onClick={() => navigate('/tournaments')}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/30 transition-all duration-200 text-lg"
            >
              🏆 View Tournaments
            </button>
          </div>
        </div>
      </section>

      {/* ── Quick Slot Checker ─────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-5 flex items-center gap-2">
              <CalendarDays size={22} className="text-[#1a5c2a]" />
              Quick Slot Checker
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
              <input
                id="home-date-picker"
                type="date"
                value={selectedDate}
                min={today}
                onChange={e => setSelectedDate(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a] transition-colors"
              />
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  <span className="text-2xl font-bold text-[#1a5c2a]">{available.length}</span>{' '}
                  slot{available.length !== 1 ? 's' : ''} available on{' '}
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              )}
            </div>

            {!loading && slots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {slots.map(slot => (
                  <div
                    key={slot.id}
                    onClick={() => slot.status === 'available' && navigate('/book-slot')}
                    className={`rounded-xl p-3 text-center border-2 transition-all duration-200
                      ${slot.status === 'available'
                        ? 'border-[#16a34a] bg-green-50 cursor-pointer hover:bg-green-100 hover:scale-105'
                        : slot.status === 'booked'
                        ? 'border-red-300 bg-red-50 cursor-not-allowed opacity-70'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'}`}
                  >
                    <p className="text-xs font-semibold text-gray-700">{formatTime(slot.start_time)}</p>
                    <p className="text-xs text-gray-500">{formatTime(slot.end_time)}</p>
                    <p className="text-xs font-bold mt-1"
                      style={{ color: slot.status === 'available' ? '#16a34a' : '#dc2626' }}>
                      {slot.status === 'available' ? `₹${slot.price}` : slot.status.toUpperCase()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!loading && slots.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No slots configured for this date.</p>
            )}

            {available.length > 0 && (
              <button
                onClick={() => navigate('/book-slot')}
                className="mt-5 w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: '#1a5c2a' }}
              >
                Book a Slot for This Date →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-10">
            Why Choose <span className="text-[#1a5c2a]">Eagle Box Cricket?</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-[#1a5c2a] bg-white hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">{f.icon}</div>
                <h3 className="font-bold text-[#1a1a1a] mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#f5a623' }} className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to Play?</h2>
          <p className="text-white/90 mb-6">Join hundreds of cricket enthusiasts who book with Eagle every week.</p>
          <button
            onClick={() => navigate('/book-slot')}
            className="px-8 py-3 bg-white text-[#1a5c2a] font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-md"
          >
            Book Your Slot Now →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
