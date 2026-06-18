import { useState, useEffect } from 'react'
import axios from 'axios'
import { CalendarDays, Clock, IndianRupee, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { API_URL } from '../config'
import { useCustomerAuth } from '../context/CustomerAuthContext'

const today = new Date().toISOString().split('T')[0]

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

function getPeriod(startTime) {
  if (!startTime) return 'DAY'
  const hour = parseInt(startTime.split(':')[0])
  if (hour < 12) return 'MORNING'
  if (hour < 16) return 'AFTERNOON'
  if (hour < 19) return 'EVENING'
  return 'NIGHT'
}

const initForm = {
  name: '', phone: '', email: '',
  team_name: '', num_players: 6,
  customer_type: 'player', notes: '',
}

export default function BookSlot() {
  const { customer } = useCustomerAuth()

  const [selectedDate, setSelectedDate] = useState(today)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [activeSlot, setActiveSlot] = useState(null)
  const [form, setForm] = useState(initForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [submitError, setSubmitError] = useState('')

  // Generate 7 days carousel
  const dateCarousel = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()
    const dayNum = d.getDate()
    dateCarousel.push({ dateStr, dayName, dayNum })
  }

  const fetchSlots = async (date) => {
    setLoading(true)
    setFetchError('')
    try {
      const { data } = await axios.get(`${API_URL}/slots?date=${date}`)
      setSlots(data.data || [])
    } catch (e) {
      setFetchError(e.response?.data?.message || 'Failed to load slots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots(selectedDate)
  }, [selectedDate])

  const openModal = (slot) => {
    setActiveSlot(slot)
    // Pre-fill name and email from Google profile if available
    setForm({
      ...initForm,
      name: customer?.name || '',
      email: customer?.email || '',
    })
    setErrors({})
    setSubmitError('')
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim() || form.name.trim().length < 3) {
      errs.name = 'Name must be at least 3 characters'
    }
    if (!/^\d{10}$/.test(form.phone)) {
      errs.phone = 'Enter a valid 10-digit phone number'
    }
    if (!form.team_name.trim() || form.team_name.trim().length < 3) {
      errs.team_name = 'Team name must be at least 3 characters'
    }
    if (form.num_players < 6 || form.num_players > 22) {
      errs.num_players = 'Players must be between 6 and 22'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const { data } = await axios.post(`${API_URL}/bookings`, {
        ...form,
        slot_id: activeSlot.id,
        num_players: parseInt(form.num_players),
      })
      setSuccessMsg(`🎉 BOOKING CONFIRMED! Your Booking ID is #${data.data.bookingId}`)
      setModalOpen(false)
      fetchSlots(selectedDate)
    } catch (e) {
      setSubmitError(e.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      setErrors(er => ({ ...er, [key]: '' }))
    },
  })

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-white pt-[70px]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center md:text-left flex flex-col items-center md:items-start">
          <span className="font-accent text-secondary tracking-[3px] text-xs font-bold uppercase block mb-2">
            ⚡ RESERVATIONS
          </span>
          <h1 className="font-display text-5xl sm:text-6xl text-white tracking-tight uppercase">
            BOOK A SLOT
          </h1>
          <div className="w-16 h-1 bg-primary mt-3 mb-4 rounded-full" />
          <p className="font-sans text-sm text-brand-greyMedium max-w-md">
            Select your match date and pick an available hourly slot below to reserve the turf.
          </p>
        </div>

        {successMsg && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="bg-primary/10 border-2 border-primary text-primary px-6 py-4 rounded-2xl flex items-center gap-4 animate-bounce-slow">
              <CheckCircle className="text-primary shrink-0" size={32} />
              <div>
                <h4 className="font-heading font-black text-lg text-white">BOOKING CONFIRMED!</h4>
                <p className="font-sans text-xs text-white/80 mt-1">{successMsg}</p>
                <p className="font-accent text-[10px] text-secondary tracking-wider uppercase mt-1">
                  * SHOW THIS ID AT THE VENUE COUNTER
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Date Selection Panel */}
        <div className="bg-brand-card border border-primary/20 rounded-3xl p-6 mb-12 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-secondary" size={20} />
              <h2 className="font-heading font-bold text-white text-sm tracking-wider uppercase">
                SELECT MATCH DATE
              </h2>
            </div>
            
            {/* Standard date picker fallback */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-greyMedium font-sans">Or Choose Date:</span>
              <input
                id="bookslot-date"
                type="date"
                value={selectedDate}
                min={today}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-brand-greyDark border border-white/10 rounded-xl px-4 py-1.5 text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/45 cursor-pointer font-sans"
              />
            </div>
          </div>

          {/* Date Pills Carousel */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {dateCarousel.map((item) => {
              const isActive = selectedDate === item.dateStr
              const isToday = item.dateStr === today
              return (
                <div
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-center select-none
                    ${isActive 
                      ? 'bg-gradient-to-b from-primary to-primary-dark border-primary shadow-[0_0_15px_rgba(0,200,83,0.3)] scale-105' 
                      : isToday 
                      ? 'border-secondary/40 bg-brand-greyDark hover:border-secondary' 
                      : 'border-white/5 bg-brand-greyDark/50 hover:border-white/20'}`}
                >
                  <span className={`font-accent text-[10px] tracking-wider font-bold mb-1 ${isActive ? 'text-white/80' : 'text-brand-greyMedium'}`}>
                    {item.dayName}
                  </span>
                  <span className="font-display text-2xl sm:text-3xl text-white">
                    {item.dayNum}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {fetchError && <Alert type="error" message={fetchError} />}

        {/* Available Slots Title */}
        <div className="flex items-center gap-2.5 mb-6 justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            <h3 className="font-heading font-black text-sm tracking-wider uppercase text-white">
              AVAILABLE SLOTS
            </h3>
          </div>
          <span className="font-accent text-[10px] text-brand-greyMedium tracking-wider uppercase">
            Updated in real-time
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : slots.length === 0 ? (
          <div className="text-center py-20 bg-brand-card border border-white/5 rounded-3xl">
            <div className="text-6xl mb-4 animate-float-slow">📅</div>
            <p className="font-heading font-black text-lg text-white uppercase">No Slots Scheduled</p>
            <p className="font-sans text-xs text-brand-greyMedium mt-1">Try selecting a different date from the panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map(slot => {
              const isAvailable = slot.status === 'available'
              const isBooked = slot.status === 'booked'
              const period = getPeriod(slot.start_time)

              return (
                <div
                  key={slot.id}
                  className={`rounded-2xl p-6 border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between
                    ${isAvailable 
                      ? 'border-primary/25 bg-brand-card hover:border-primary glow-green hover:-translate-y-1' 
                      : isBooked 
                      ? 'border-red-500/10 bg-red-500/5 opacity-55' 
                      : 'border-white/5 bg-black/40 opacity-40'}`}
                >
                  {/* Status Badge */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex flex-col">
                      <span className="font-accent text-[10px] text-secondary tracking-widest uppercase font-bold">
                        {period} PLAY
                      </span>
                      <div className="font-display text-2xl text-white mt-1 flex items-center gap-1.5 leading-none">
                        <Clock size={16} className="text-primary" />
                        {formatTime(slot.start_time)}
                      </div>
                      <span className="font-sans text-[11px] text-white/50 mt-1">
                        to {formatTime(slot.end_time)}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-accent font-black tracking-widest uppercase px-2.5 py-1 rounded-full border
                        ${isAvailable ? 'bg-primary/10 border-primary/30 text-primary' :
                          isBooked ? 'bg-red-500/10 border-red-500/30 text-error' :
                                    'bg-white/5 border-white/10 text-brand-greyMedium'}`}
                    >
                      {slot.status}
                    </span>
                  </div>

                  {/* Pricing / Booking Trigger */}
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center text-2xl font-display text-white">
                      <IndianRupee size={16} className="text-primary mt-0.5" />
                      <span className={isAvailable ? 'text-primary' : 'text-brand-greyMedium'}>
                        {parseInt(slot.price)}
                      </span>
                    </div>

                    {isAvailable ? (
                      <button
                        id={`book-slot-${slot.id}`}
                        onClick={() => openModal(slot)}
                        className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-heading font-extrabold text-[12px] tracking-wider rounded-xl hover:scale-105 transition-all shadow-[0_4px_12px_rgba(0,200,83,0.2)] cursor-pointer"
                      >
                        BOOK NOW
                      </button>
                    ) : isBooked ? (
                      <button disabled className="px-5 py-2.5 bg-white/5 text-white/40 font-heading font-black text-[11px] tracking-wider rounded-xl border border-white/5 cursor-not-allowed uppercase">
                        BOOKED
                      </button>
                    ) : (
                      <button disabled className="px-5 py-2.5 bg-white/5 text-white/30 font-heading font-black text-[11px] tracking-wider rounded-xl border border-white/5 cursor-not-allowed uppercase">
                        BLOCKED
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Booking Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="CONFIRM YOUR SLOT"
      >
        {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

        {activeSlot && (
          <div className="bg-primary/5 border border-primary/25 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-accent text-[10px] text-secondary tracking-widest uppercase font-bold">SELECTED SLOT</p>
              <h4 className="font-display text-2xl text-white mt-1">
                {formatTime(activeSlot.start_time)} – {formatTime(activeSlot.end_time)}
              </h4>
              <p className="font-sans text-xs text-white/50 mt-0.5">
                📅 Date: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center text-3xl font-display text-primary">
              <IndianRupee size={22} className="text-primary mt-1" />
              <span>{parseInt(activeSlot.price)}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
              FULL NAME *
            </label>
            <input
              {...field('name')}
              placeholder="Enter full name"
              className={`w-full bg-brand-greyDark border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all
                ${errors.name ? 'border-error/55 focus:ring-error/50 bg-error/5' : 'border-white/10 focus:border-primary focus:ring-primary/50'}`}
            />
            {errors.name && <p className="text-error text-xs mt-1 font-sans">{errors.name}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
              PHONE NUMBER *
            </label>
            <input
              {...field('phone')}
              placeholder="10-digit mobile number"
              maxLength={10}
              className={`w-full bg-brand-greyDark border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all
                ${errors.phone ? 'border-error/55 focus:ring-error/50 bg-error/5' : 'border-white/10 focus:border-primary focus:ring-primary/50'}`}
            />
            {errors.phone && <p className="text-error text-xs mt-1 font-sans">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
              EMAIL ADDRESS
            </label>
            <input
              {...field('email')}
              type="email"
              placeholder="your@email.com"
              className="w-full bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
            />
          </div>

          {/* Team Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                TEAM NAME *
              </label>
              <input
                {...field('team_name')}
                placeholder="Squad name"
                className={`w-full bg-brand-greyDark border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all
                  ${errors.team_name ? 'border-error/55 focus:ring-error/50 bg-error/5' : 'border-white/10 focus:border-primary focus:ring-primary/50'}`}
              />
              {errors.team_name && <p className="text-error text-xs mt-1 font-sans">{errors.team_name}</p>}
            </div>
            <div>
              <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                PLAYERS * <span className="text-[10px] text-white/45">(6–22)</span>
              </label>
              <input
                {...field('num_players')}
                type="number"
                min={6}
                max={22}
                className={`w-full bg-brand-greyDark border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all
                  ${errors.num_players ? 'border-error/55 focus:ring-error/50 bg-error/5' : 'border-white/10 focus:border-primary focus:ring-primary/50'}`}
              />
              {errors.num_players && <p className="text-error text-xs mt-1 font-sans">{errors.num_players}</p>}
            </div>
          </div>

          {/* Customer Type */}
          <div>
            <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
              CUSTOMER TYPE
            </label>
            <select
              {...field('customer_type')}
              className="w-full bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="player">Individual Player</option>
              <option value="team">Club Team</option>
              <option value="corporate">Corporate Entity</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
              SPECIAL INSTRUCTIONS
            </label>
            <textarea
              {...field('notes')}
              rows={2}
              placeholder="Need kit? Playing rule exceptions?"
              className="w-full bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-none transition-all"
            />
          </div>

          {/* Action Row */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 py-3.5 border border-white/10 text-white hover:bg-white/5 font-heading font-extrabold text-[12px] tracking-wider rounded-xl transition-all cursor-pointer uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] py-3.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-heading font-extrabold text-[12px] tracking-wider rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,200,83,0.3)] cursor-pointer uppercase"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" color="white" />
                  <span>Locking Slot...</span>
                </>
              ) : (
                <>
                  <span>🏏 Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  )
}
