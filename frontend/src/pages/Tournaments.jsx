import { useState, useEffect } from 'react'
import axios from 'axios'
import { CalendarDays, Trophy, Users, IndianRupee, Star } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { API_URL } from '../config'

const initForm = { team_name: '', captain_name: '', phone: '', email: '', num_players: 11 }

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [regModal, setRegModal] = useState(null)
  const [form, setForm] = useState(initForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    axios.get(`${API_URL}/tournaments`)
      .then(r => setTournaments(r.data.data || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load tournaments'))
      .finally(() => setLoading(false))
  }, [])

  const openReg = (t) => {
    setRegModal(t)
    setForm(initForm)
    setErrors({})
    setSubmitError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.team_name.trim()) errs.team_name = 'Team name is required'
    if (!form.captain_name.trim()) errs.captain_name = 'Captain name is required'
    if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Valid 10-digit phone required'
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
      const { data } = await axios.post(`${API_URL}/tournaments/${regModal.id}/register`, form)
      setSuccess(`🎉 Registration confirmed! Your Registration ID is #${data.data.registrationId}`)
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
    onChange: e => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      setErrors(er => ({ ...er, [key]: '' }))
    },
  })

  // Status-specific configuration
  const statusConfig = {
    upcoming: { color: '#ff9100', label: 'UPCOMING', border: 'border-l-warning' },
    ongoing: { color: '#00c853', label: 'ONGOING', border: 'border-l-primary' },
    completed: { color: '#9e9e9e', label: 'COMPLETED', border: 'border-l-white/20' },
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-white pt-[70px]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center md:text-left flex flex-col items-center md:items-start">
          <span className="font-accent text-secondary tracking-[3px] text-xs font-bold uppercase block mb-2">
            ⚡ CHAMPIONSHIPS
          </span>
          <h1 className="font-display text-5xl sm:text-7xl text-white tracking-tight uppercase leading-none">
            TOURNAMENTS
          </h1>
          <div className="w-16 h-1 bg-primary mt-3 mb-4 rounded-full" />
          <p className="font-sans text-sm text-brand-greyMedium max-w-md">
            Register your team for upcoming cups, track tournament statuses, and battle for the final trophy.
          </p>
        </div>

        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={5000} />}
        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20 bg-brand-card border border-white/5 rounded-3xl">
            <div className="text-6xl mb-4 animate-float-slow">🏆</div>
            <h3 className="font-heading font-black text-lg text-white uppercase">No Tournaments Listed</h3>
            <p className="font-sans text-xs text-brand-greyMedium mt-1">Check back soon for new championship leagues.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tournaments.map(t => {
              const cfg = statusConfig[t.status] || statusConfig.upcoming
              const isFull = t.spots_remaining <= 0
              const isCompleted = t.status === 'completed'

              return (
                <div
                  key={t.id}
                  className={`bg-brand-card border-l-4 ${cfg.border} rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_8px_25px_rgba(0,0,0,0.4)] hover:scale-[1.01] transition-transform duration-300`}
                >
                  {/* Tournament Title Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="font-heading font-black text-xl text-white uppercase leading-tight">{t.name}</h3>
                      <span
                        style={{ backgroundColor: `${cfg.color}15`, color: cfg.color, borderColor: `${cfg.color}30` }}
                        className="text-[9px] font-accent font-black tracking-widest uppercase px-2.5 py-1 rounded-full border"
                      >
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-brand-greyMedium font-sans">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-primary" />
                        {new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users size={14} className="text-primary" />
                        {t.registrations_count} / {t.max_teams} Teams Joined
                      </span>
                    </div>
                  </div>

                  {/* Tournament Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-left min-w-[280px] border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                    <div>
                      <p className="font-accent text-[9px] text-brand-greyMedium tracking-wider uppercase mb-1">ENTRY FEE</p>
                      <p className="font-display text-2xl text-white flex items-center leading-none">
                        <IndianRupee size={14} className="text-primary mr-0.5" />
                        <span>{parseInt(t.entry_fee)}</span>
                      </p>
                    </div>
                    <div>
                      <p className="font-accent text-[9px] text-brand-greyMedium tracking-wider uppercase mb-1">SPOTS REMAINING</p>
                      {isFull ? (
                        <p className="font-heading font-black text-xs text-error mt-1 uppercase">FULL</p>
                      ) : (
                        <p className="font-display text-2xl text-primary leading-none">
                          {t.spots_remaining} <span className="font-accent text-xs">Pills</span>
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                      <p className="font-accent text-[9px] text-brand-greyMedium tracking-wider uppercase mb-1">CHAMPION</p>
                      <p className="font-heading font-bold text-xs text-secondary mt-1 flex items-center gap-1 uppercase">
                        <Trophy size={12} className="text-secondary shrink-0" />
                        🏆 PRIZE
                      </p>
                    </div>
                  </div>

                  {/* Action Registration Button */}
                  <div className="w-full md:w-auto flex items-center justify-end md:pl-4">
                    {isCompleted ? (
                      <button disabled className="w-full md:w-auto px-6 py-3 bg-white/5 text-white/30 font-heading font-black text-[12px] tracking-wider rounded-xl cursor-not-allowed uppercase border border-white/5">
                        COMPLETED
                      </button>
                    ) : isFull ? (
                      <button disabled className="w-full md:w-auto px-6 py-3 bg-white/5 text-error/40 font-heading font-black text-[12px] tracking-wider rounded-xl cursor-not-allowed uppercase border border-error/5">
                        REGISTRATION CLOSED
                      </button>
                    ) : (
                      <button
                        id={`register-tournament-${t.id}`}
                        onClick={() => openReg(t)}
                        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-heading font-extrabold text-[12px] tracking-wider rounded-xl hover:scale-105 transition-all shadow-[0_4px_12px_rgba(0,200,83,0.2)] cursor-pointer uppercase"
                      >
                        REGISTER TEAM
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Registration Modal */}
      <Modal isOpen={!!regModal} onClose={() => setRegModal(null)} title="REGISTER TEAM">
        {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}
        
        {regModal && (
          <div className="bg-primary/5 border border-primary/25 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-accent text-[10px] text-secondary tracking-widest uppercase font-bold">TOURNAMENT</p>
              <h4 className="font-display text-2xl text-white mt-1 uppercase">
                {regModal.name}
              </h4>
              <p className="font-sans text-xs text-white/50 mt-0.5">
                📅 Match Date: {new Date(regModal.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center text-3xl font-display text-primary">
              <IndianRupee size={22} className="text-primary mt-1" />
              <span>{parseInt(regModal.entry_fee)}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Name */}
          <div>
            <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
              TEAM NAME *
            </label>
            <input
              {...field('team_name')}
              placeholder="Your squad name"
              className={`w-full bg-brand-greyDark/50 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all
                ${errors.team_name ? 'border-error/55 focus:ring-error/50 bg-error/5' : 'border-white/10 focus:border-primary focus:ring-primary/50'}`}
            />
            {errors.team_name && <p className="text-error text-xs mt-1 font-sans">{errors.team_name}</p>}
          </div>

          {/* Captain Name */}
          <div>
            <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
              CAPTAIN'S FULL NAME *
            </label>
            <input
              {...field('captain_name')}
              placeholder="Team captain name"
              className={`w-full bg-brand-greyDark/50 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all
                ${errors.captain_name ? 'border-error/55 focus:ring-error/50 bg-error/5' : 'border-white/10 focus:border-primary focus:ring-primary/50'}`}
            />
            {errors.captain_name && <p className="text-error text-xs mt-1 font-sans">{errors.captain_name}</p>}
          </div>

          {/* Phone & Players Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                PHONE NUMBER *
              </label>
              <input
                {...field('phone')}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={`w-full bg-brand-greyDark/50 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all
                  ${errors.phone ? 'border-error/55 focus:ring-error/50 bg-error/5' : 'border-white/10 focus:border-primary focus:ring-primary/50'}`}
              />
              {errors.phone && <p className="text-error text-xs mt-1 font-sans">{errors.phone}</p>}
            </div>
            <div>
              <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                NUMBER OF PLAYERS
              </label>
              <input
                {...field('num_players')}
                type="number"
                min={6}
                max={22}
                className="w-full bg-brand-greyDark/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-sans"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
              EMAIL ADDRESS
            </label>
            <input
              {...field('email')}
              type="email"
              placeholder="captain@email.com"
              className="w-full bg-brand-greyDark/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
            />
          </div>

          {/* Action Row */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setRegModal(null)}
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
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>🏆 Confirm Registration</span>
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
