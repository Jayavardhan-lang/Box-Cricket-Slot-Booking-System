import { useState, useEffect } from 'react'
import axios from 'axios'
import { CalendarDays, Users, Clock, IndianRupee } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { API_URL } from '../config'

const today = new Date().toISOString().split('T')[0]

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

const initForm = {
  name: '', phone: '', email: '',
  team_name: '', num_players: 6,
  customer_type: 'player', notes: '',
}

export default function BookSlot() {
  const [selectedDate, setSelectedDate] = useState(today)
  const [slots, setSlots]               = useState([])
  const [loading, setLoading]           = useState(false)
  const [fetchError, setFetchError]     = useState('')

  const [modalOpen, setModalOpen]   = useState(false)
  const [activeSlot, setActiveSlot] = useState(null)
  const [form, setForm]             = useState(initForm)
  const [errors, setErrors]         = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [submitError, setSubmitError] = useState('')

  const fetchSlots = async (date) => {
    setLoading(true); setFetchError('')
    try {
      const { data } = await axios.get(`${API_URL}/slots?date=${date}`)
      setSlots(data.data || [])
    } catch (e) {
      setFetchError(e.response?.data?.message || 'Failed to load slots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSlots(selectedDate) }, [selectedDate])

  const openModal = (slot) => {
    setActiveSlot(slot); setForm(initForm)
    setErrors({}); setSubmitError(''); setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim() || form.name.trim().length < 3) errs.name = 'Name must be at least 3 characters'
    if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number'
    if (!form.team_name.trim() || form.team_name.trim().length < 3) errs.team_name = 'Team name must be at least 3 characters'
    if (form.num_players < 6 || form.num_players > 22) errs.num_players = 'Players must be between 6 and 22'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true); setSubmitError('')
    try {
      const { data } = await axios.post(`${API_URL}/bookings`, {
        ...form, slot_id: activeSlot.id,
        num_players: parseInt(form.num_players),
      })
      setSuccessMsg(`🎉 Booking Confirmed! Your Booking ID is #${data.data.bookingId}`)
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
    onChange: e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })) },
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1a1a1a]">Book a Cricket Slot</h1>
          <p className="text-gray-500 mt-1">Pick a date and choose your preferred time slot</p>
        </div>

        {successMsg && (
          <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} autoClose={6000} />
        )}

        {/* Date Picker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8 flex flex-wrap items-center gap-4">
          <CalendarDays size={20} className="text-[#1a5c2a]" />
          <label className="font-semibold text-gray-700">Select Date:</label>
          <input
            id="bookslot-date"
            type="date"
            value={selectedDate}
            min={today}
            onChange={e => setSelectedDate(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#1a5c2a] transition-colors"
          />
          {!loading && (
            <span className="text-sm text-gray-500">
              {slots.filter(s => s.status === 'available').length} available slots
            </span>
          )}
        </div>

        {fetchError && <Alert type="error" message={fetchError} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : slots.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-lg font-medium">No slots available for this date</p>
            <p className="text-sm mt-1">Try a different date</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {slots.map(slot => {
              const isAvailable = slot.status === 'available'
              const isBooked    = slot.status === 'booked'
              return (
                <div
                  key={slot.id}
                  className={`rounded-2xl p-5 border-2 transition-all duration-200 shadow-sm
                    ${isAvailable ? 'border-[#16a34a] bg-white hover:shadow-md' :
                      isBooked    ? 'border-red-300 bg-red-50/50' :
                                    'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#1a1a1a] font-bold text-lg">
                        <Clock size={16} className="text-[#1a5c2a]" />
                        {formatTime(slot.start_time)}
                      </div>
                      <p className="text-sm text-gray-400 ml-5">to {formatTime(slot.end_time)}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full
                        ${isAvailable ? 'bg-green-100 text-green-700' :
                          isBooked    ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-500'}`}
                    >
                      {slot.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-2xl font-extrabold mb-4"
                    style={{ color: isAvailable ? '#16a34a' : '#9ca3af' }}>
                    <IndianRupee size={20} />
                    {slot.price}
                  </div>

                  {isAvailable ? (
                    <button
                      id={`book-slot-${slot.id}`}
                      onClick={() => openModal(slot)}
                      className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                      style={{ backgroundColor: '#16a34a' }}
                    >
                      Book Now
                    </button>
                  ) : isBooked ? (
                    <button disabled className="w-full py-2.5 rounded-xl bg-gray-200 text-gray-500 font-semibold text-sm cursor-not-allowed">
                      Already Booked
                    </button>
                  ) : (
                    <button disabled className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 font-semibold text-sm cursor-not-allowed">
                      Not Available
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Book Slot — ${activeSlot ? formatTime(activeSlot.start_time) + ' to ' + formatTime(activeSlot.end_time) : ''}`}
      >
        {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

        {activeSlot && (
          <div className="bg-green-50 rounded-xl p-4 mb-5 flex items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-green-800">{formatTime(activeSlot.start_time)} – {formatTime(activeSlot.end_time)}</p>
              <p className="text-xl font-extrabold text-[#16a34a]">₹{activeSlot.price}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
            <input {...field('name')} placeholder="Your full name"
              className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
                ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
            <input {...field('phone')} placeholder="10-digit mobile number" maxLength={10}
              className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
                ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'}`} />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-gray-400">(optional)</span></label>
            <input {...field('email')} type="email" placeholder="your@email.com"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a] transition-colors" />
          </div>

          {/* Team + Players */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name *</label>
              <input {...field('team_name')} placeholder="Team name"
                className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
                  ${errors.team_name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'}`} />
              {errors.team_name && <p className="text-red-500 text-xs mt-1">{errors.team_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Players * <span className="text-gray-400">(6–22)</span></label>
              <input {...field('num_players')} type="number" min={6} max={22}
                className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
                  ${errors.num_players ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'}`} />
              {errors.num_players && <p className="text-red-500 text-xs mt-1">{errors.num_players}</p>}
            </div>
          </div>

          {/* Customer Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Type</label>
            <select {...field('customer_type')}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a] bg-white transition-colors">
              <option value="player">Individual Player</option>
              <option value="team">Team</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes <span className="text-gray-400">(optional)</span></label>
            <textarea {...field('notes')} rows={2} placeholder="Any special requests..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a] resize-none transition-colors" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#1a5c2a', flex: 2 }}>
              {submitting ? <><Spinner size="sm" color="white" /> Booking...</> : '🏏 Confirm Booking'}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  )
}
