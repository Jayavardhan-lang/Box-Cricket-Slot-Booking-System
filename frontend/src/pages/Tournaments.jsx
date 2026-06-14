import { useState, useEffect } from 'react'
import axios from 'axios'
import { CalendarDays, Trophy, Users, IndianRupee } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { API_URL } from '../config'

const initForm = { team_name: '', captain_name: '', phone: '', email: '', num_players: 11 }

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [regModal, setRegModal]       = useState(null)
  const [form, setForm]               = useState(initForm)
  const [errors, setErrors]           = useState({})
  const [submitting, setSubmitting]   = useState(false)
  const [success, setSuccess]         = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    axios.get(`${API_URL}/tournaments`)
      .then(r => setTournaments(r.data.data || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load tournaments'))
      .finally(() => setLoading(false))
  }, [])

  const openReg = (t) => { setRegModal(t); setForm(initForm); setErrors({}); setSubmitError('') }

  const validate = () => {
    const errs = {}
    if (!form.team_name.trim())    errs.team_name    = 'Team name is required'
    if (!form.captain_name.trim()) errs.captain_name = 'Captain name is required'
    if (!/^\d{10}$/.test(form.phone)) errs.phone     = 'Valid 10-digit phone required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true); setSubmitError('')
    try {
      const { data } = await axios.post(`${API_URL}/tournaments/${regModal.id}/register`, form)
      setSuccess(`🎉 Registration confirmed! Registration ID: #${data.data.registrationId}`)
      setRegModal(null)
      // Update spots
      setTournaments(prev => prev.map(t =>
        t.id === regModal.id
          ? { ...t, registrations_count: t.registrations_count + 1, spots_remaining: t.spots_remaining - 1 }
          : t
      ))
    } catch (e) {
      setSubmitError(e.response?.data?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })) },
  })

  const statusColor = { upcoming: '#d97706', ongoing: '#16a34a', completed: '#6b7280' }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1a1a1a]">Upcoming Tournaments</h1>
          <p className="text-gray-500 mt-1">Register your team and compete for glory!</p>
        </div>

        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={5000} />}
        {error   && <Alert type="error"   message={error} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-lg font-medium">No tournaments available right now</p>
            <p className="text-sm mt-1">Check back soon for upcoming events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div style={{ backgroundColor: '#1a5c2a' }} className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-white font-bold text-lg leading-tight">{t.name}</h3>
                    <span style={{ backgroundColor: statusColor[t.status] || '#6b7280' }}
                      className="text-white text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-2">
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays size={15} className="text-[#1a5c2a]" />
                    {new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IndianRupee size={15} className="text-[#1a5c2a]" />
                    Entry Fee: <span className="font-bold text-[#1a1a1a]">₹{t.entry_fee}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={15} className="text-[#1a5c2a]" />
                    {t.registrations_count}/{t.max_teams} teams
                    {t.spots_remaining > 0
                      ? <span className="text-green-600 font-semibold ml-1">({t.spots_remaining} spots left)</span>
                      : <span className="text-red-500 font-semibold ml-1">(Full)</span>}
                  </div>

                  <button
                    id={`register-tournament-${t.id}`}
                    onClick={() => openReg(t)}
                    disabled={t.spots_remaining <= 0 || t.status === 'completed'}
                    className="w-full mt-2 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#1a5c2a' }}
                  >
                    {t.spots_remaining <= 0 ? '🚫 Tournament Full' : t.status === 'completed' ? 'Completed' : '🏏 Register Team'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Registration Modal */}
      <Modal isOpen={!!regModal} onClose={() => setRegModal(null)} title={`Register for ${regModal?.name}`}>
        {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name *</label>
            <input {...field('team_name')} placeholder="Your team name"
              className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
                ${errors.team_name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'}`} />
            {errors.team_name && <p className="text-red-500 text-xs mt-1">{errors.team_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Captain Name *</label>
            <input {...field('captain_name')} placeholder="Team captain's full name"
              className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
                ${errors.captain_name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'}`} />
            {errors.captain_name && <p className="text-red-500 text-xs mt-1">{errors.captain_name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
              <input {...field('phone')} placeholder="10-digit number" maxLength={10}
                className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
                  ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'}`} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Players</label>
              <input {...field('num_players')} type="number" min={6} max={22}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-gray-400">(optional)</span></label>
            <input {...field('email')} type="email" placeholder="team@email.com"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a] transition-colors" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setRegModal(null)}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#1a5c2a', flex: 2 }}>
              {submitting ? <><Spinner size="sm" color="white" /> Registering...</> : '🏆 Confirm Registration'}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  )
}
