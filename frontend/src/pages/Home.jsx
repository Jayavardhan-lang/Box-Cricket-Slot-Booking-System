import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { Zap, Star, ArrowDown } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import LoginModal from '../components/LoginModal'
import { useCustomerAuth } from '../context/CustomerAuthContext'
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

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const { customer } = useCustomerAuth()
  const [selectedDate, setSelectedDate] = useState(today)
  const [slots, setSlots] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(false)
  const [tournamentsLoading, setTournamentsLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

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

  const fetchTournaments = async () => {
    setTournamentsLoading(true)
    try {
      const { data } = await axios.get(`${API_URL}/tournaments`)

      const list = data.data || []
      const filtered = list.filter(t => t.status !== 'completed').slice(0, 3)
      setTournaments(filtered)
    } catch {
      setTournaments([])
    } finally {
      setTournamentsLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    fetchTournaments()
  }, [])

  // Show login modal if redirected here with showLogin state
  useEffect(() => {
    if (location.state?.showLogin) {
      setShowLoginModal(true)
      // Clear the state so refreshing doesn't re-open modal
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const handleBookSlotClick = () => {
    if (customer) {
      navigate('/book-slot')
    } else {
      setShowLoginModal(true)
    }
  }

  const available = slots.filter(s => s.status === 'available')

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-white pt-[70px]">
      <Navbar />

      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-turf-pattern px-4 py-16">

        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-[#0d2818]/60 to-brand-dark z-0" />

        <div className="absolute top-[20%] left-[10%] text-6xl opacity-15 animate-float-slow select-none hidden md:block">🏏</div>
        <div className="absolute bottom-[30%] right-[10%] text-7xl opacity-10 animate-float-medium select-none hidden md:block">🏆</div>
        <div className="absolute top-[15%] right-[20%] text-5xl opacity-5 animate-float-slow select-none hidden md:block">⚾</div>

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">

          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-5 py-2 mb-8 animate-pulse">
            <Zap size={14} className="text-secondary" />
            <span className="font-accent text-xs font-bold text-secondary tracking-[2px] uppercase">
              ⚡ HYDERABAD'S PREMIER BOX CRICKET VENUE
            </span>
          </div>

          {/* Main Display Heading */}
          <h1 className="leading-tight mb-8">
            <div className="font-display text-6xl sm:text-8xl md:text-[100px] text-white tracking-tight leading-none">
              BOOK YOUR
            </div>
            <div className="font-display text-6xl sm:text-8xl md:text-[100px] text-primary tracking-tight leading-none">
              CRICKET SLOT
            </div>
            <div className="font-display text-6xl sm:text-8xl md:text-[100px] gold-shimmer-text tracking-tight leading-none">
              INSTANTLY
            </div>
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-base sm:text-xl text-white/70 max-w-xl mb-10 leading-relaxed">
            No calls. No WhatsApp. Just pick your slot and play on our professional, high-density turf.
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 mb-12 py-4 border-y border-white/10 w-full max-w-2xl">
            <div className="text-center">
              <div className="font-display text-3xl sm:text-5xl text-primary">500+</div>
              <div className="font-accent text-[10px] sm:text-xs text-brand-greyMedium tracking-[1.5px] uppercase mt-1">
                Matches Played
              </div>
            </div>
            <div className="w-[1px] h-10 bg-secondary/35" />
            <div className="text-center">
              <div className="font-display text-3xl sm:text-5xl text-primary">50+</div>
              <div className="font-accent text-[10px] sm:text-xs text-brand-greyMedium tracking-[1.5px] uppercase mt-1">
                Teams Registered
              </div>
            </div>
            <div className="w-[1px] h-10 bg-secondary/35" />
            <div className="text-center">
              <div className="font-display text-3xl sm:text-5xl text-secondary">4.9★</div>
              <div className="font-accent text-[10px] sm:text-xs text-brand-greyMedium tracking-[1.5px] uppercase mt-1">
                Player Rating
              </div>
            </div>
          </div>

          {/* Single CTA Button */}
          <div className="flex justify-center" style={{ marginTop: '40px' }}>
            <button
              id="hero-book-slot-btn"
              onClick={handleBookSlotClick}
              style={{
                background: 'linear-gradient(135deg, #00c853, #1b5e20)',
                color: 'white',
                padding: '18px 48px',
                borderRadius: '50px',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,200,83,0.4)',
                transition: 'all 0.3s ease',
                minWidth: '220px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,200,83,0.6)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,200,83,0.4)'
              }}
            >
              🏏 {customer ? 'BOOK YOUR SLOT' : 'LOGIN TO BOOK'}
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-16 flex flex-col items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <span className="font-accent text-[10px] tracking-[3px] text-brand-greyMedium uppercase">
              SCROLL TO EXPLORE
            </span>
            <ArrowDown size={14} className="animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── 2. Quick Slot Checker ─────────────────────────────────────────── */}
      <section className="relative z-20 px-4 -mt-10 mb-16">
        <div className="max-w-4xl mx-auto bg-brand-card border border-primary/25 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] glow-green transition-all duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-6">
            <div>
              <h2 className="font-heading font-black text-secondary tracking-[2px] text-sm uppercase mb-1">
                CHECK AVAILABILITY
              </h2>
              <p className="font-sans text-xs text-brand-greyMedium">
                Find open times and book instantly without phone calls.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <input
                type="date"
                value={selectedDate}
                min={today}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-brand-greyDark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer font-sans"
              />
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-display text-4xl text-primary leading-none">{available.length}</span>
                  <div className="flex flex-col leading-none">
                    <span className="font-accent text-[11px] font-bold text-brand-greyMedium tracking-wider uppercase">
                      SLOTS OPEN
                    </span>
                    <span className="font-sans text-[10px] text-white/50">
                      on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Slots Row */}
          {!loading && slots.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {slots.map(slot => (
                <div
                  key={slot.id}
                  onClick={() => slot.status === 'available' && handleBookSlotClick()}
                  className={`rounded-xl p-3.5 text-center border-2 transition-all duration-300 relative overflow-hidden group
                    ${slot.status === 'available'
                      ? 'border-primary/40 bg-primary/5 cursor-pointer hover:border-primary hover:bg-primary/10 hover:scale-[1.03]'
                      : slot.status === 'booked'
                      ? 'border-red-500/20 bg-red-500/5 cursor-not-allowed opacity-50'
                      : 'border-white/5 bg-white/5 cursor-not-allowed opacity-40'}`}
                >
                  <p className="text-xs font-semibold text-white/95 font-sans">{formatTime(slot.start_time)}</p>
                  <p className="text-[10px] text-white/50 font-sans mt-0.5">{formatTime(slot.end_time)}</p>
                  <p className="text-[11px] font-accent font-bold mt-2 tracking-wider"
                    style={{ color: slot.status === 'available' ? '#00c853' : '#ff1744' }}>
                    {slot.status === 'available' ? `₹${slot.price}` : slot.status.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!loading && slots.length === 0 && (
            <p className="text-white/40 text-sm text-center py-6 font-sans">No slots configured for this date.</p>
          )}

          {available.length > 0 && (
            <button
              onClick={handleBookSlotClick}
              className="mt-6 w-full py-3 bg-primary text-white font-heading font-extrabold text-xs tracking-[1.5px] rounded-xl hover:bg-primary-light transition-all cursor-pointer uppercase shadow-[0_4px_15px_rgba(0,200,83,0.2)]"
            >
              {customer ? 'Book a Slot for This Date →' : 'Login to Book →'}
            </button>
          )}
        </div>
      </section>

      {/* ── 3. Features Section ────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gradient-to-b from-brand-dark to-[#050505]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-accent text-secondary tracking-[4px] text-xs font-bold uppercase block mb-3">
              ⚡ WHY CHOOSE EAGLE?
            </span>
            <h2 className="font-display text-5xl sm:text-6xl text-white tracking-tight">
              THE ULTIMATE CRICKET EXPERIENCE
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🏏', title: 'INSTANT BOOKING', desc: 'Secure your favorite slots in under 60 seconds. Quick confirmation.' },
              { icon: '✅', title: 'REAL-TIME SLOTS', desc: 'Live availability updates. What you see is exactly what is open.' },
              { icon: '🏆', title: 'WEEKLY TOURNAMENTS', desc: 'Register your squad, play high-stakes matches, and win prize pools.' },
              { icon: '👥', title: 'PREMIUM MEMBERSHIPS', desc: 'Join the club to get up to 30% discount on bookings and priority slots.' },
            ].map((f, i) => (
              <div
                key={i}
                className="glass-card glass-card-hover rounded-2xl p-8 hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-3xl mb-6 shadow-[0_0_15px_rgba(0,200,83,0.15)]">
                  {f.icon}
                </div>
                <h3 className="font-heading font-black text-white text-base tracking-wide mb-3 uppercase">
                  {f.title}
                </h3>
                <p className="font-sans text-xs text-brand-greyMedium leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Tournaments Preview Section ─────────────────────────────────── */}
      <section className="py-24 px-4 bg-[#0d2818] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-0" />
        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Text */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <span className="font-accent text-secondary tracking-[4px] text-xs font-bold uppercase mb-3">
              ⚡ LIVE & UPCOMING
            </span>
            <h2 className="font-display text-6xl sm:text-7xl text-white tracking-tight mb-4 leading-none">
              TOURNAMENTS
            </h2>
            <p className="font-sans text-sm text-white/70 mb-8 leading-relaxed max-w-sm">
              Showcase your talent in Hyderabad's most competitive box cricket leagues. Register your team and join the battle!
            </p>
            <button
              onClick={() => navigate('/tournaments')}
              className="px-6 py-3 bg-secondary hover:bg-secondary-dark text-black font-heading font-extrabold text-[12px] tracking-[1.5px] rounded-full hover:scale-105 transition-all cursor-pointer uppercase shadow-[0_0_20px_rgba(255,215,0,0.25)]"
            >
              SEE ALL TOURNAMENTS →
            </button>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4 w-full">
            {tournamentsLoading ? (
              <div className="py-12 flex justify-center"><Spinner /></div>
            ) : tournaments.length > 0 ? (
              tournaments.map(t => (
                <div
                  key={t.id}
                  className="bg-black/80 border-l-4 border-primary rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-l-secondary hover:scale-[1.02] transition-all duration-300"
                >
                  <div>
                    <h3 className="font-heading font-black text-white text-base uppercase">{t.name}</h3>
                    <p className="font-sans text-xs text-brand-greyMedium mt-1">
                      📅 Date: {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-left sm:text-right">
                      <p className="font-accent text-[10px] text-brand-greyMedium tracking-wider uppercase">ENTRY FEE</p>
                      <p className="font-display text-xl text-secondary">₹{t.entry_fee}</p>
                    </div>
                    <button
                      onClick={() => navigate('/tournaments')}
                      className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-heading font-bold text-[11px] tracking-wider rounded-lg cursor-pointer uppercase"
                    >
                      REGISTER
                    </button>
                  </div>
                </div>
              ))
            ) : (

              <>
                <div className="bg-black/80 border-l-4 border-primary rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-black text-white text-base uppercase">Eagle Summer Cup 2026</h3>
                    <p className="font-sans text-xs text-brand-greyMedium mt-1">📅 June 20, 2026</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-accent text-[10px] text-brand-greyMedium tracking-wider uppercase">ENTRY</p>
                      <p className="font-display text-xl text-secondary">₹500</p>
                    </div>
                    <button
                      onClick={() => navigate('/tournaments')}
                      className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-heading font-bold text-[11px] tracking-wider rounded-lg cursor-pointer uppercase"
                    >
                      REGISTER
                    </button>
                  </div>
                </div>
                <div className="bg-black/80 border-l-4 border-primary rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-black text-white text-base uppercase">Corporate Championship League</h3>
                    <p className="font-sans text-xs text-brand-greyMedium mt-1">📅 June 25, 2026</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-accent text-[10px] text-brand-greyMedium tracking-wider uppercase">ENTRY</p>
                      <p className="font-display text-xl text-secondary">₹1,000</p>
                    </div>
                    <button
                      onClick={() => navigate('/tournaments')}
                      className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-heading font-bold text-[11px] tracking-wider rounded-lg cursor-pointer uppercase"
                    >
                      REGISTER
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-brand-dark text-center">
        <div className="max-w-6xl mx-auto">
          <span className="font-accent text-secondary tracking-[4px] text-xs font-bold uppercase block mb-3">
            ⚡ REVIEWS
          </span>
          <h2 className="font-display text-5xl text-white tracking-tight mb-16 uppercase">
            WHAT PLAYERS SAY
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Karan Kumar', team: 'Smashers XI', text: '“The turf is premium quality and the lights are amazing for night matches. Real-time booking has made playing every week super easy!”', rating: 5 },
              { name: 'Sameer Naidu', team: 'Corporate Strikers', text: '“We use the corporate membership and it saves us a huge amount of money. The booking system is smooth and highly efficient.”', rating: 5 },
              { name: 'Ananya Rao', team: 'Weekend Warriors', text: '“Super friendly staff, great location, and booking slots is a breeze. Best box cricket in Hyderabad by far!”', rating: 5 },
            ].map((t, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 text-left hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} size={16} className="text-secondary fill-secondary" />
                    ))}
                  </div>
                  <p className="font-sans text-xs text-white/80 leading-relaxed mb-6 font-medium italic">
                    {t.text}
                  </p>
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-primary uppercase">{t.name}</h4>
                  <p className="font-accent text-[10px] text-brand-greyMedium tracking-wider uppercase mt-0.5">{t.team}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary-dark text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 z-0" />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="font-display text-5xl sm:text-7xl text-white tracking-tight mb-3">
            READY TO PLAY?
          </h2>
          <p className="font-sans text-base sm:text-lg text-white/90 mb-8 max-w-lg leading-relaxed">
            Reserve your slot online in under 60 seconds and experience top-tier box cricket.
          </p>
          <button
            onClick={handleBookSlotClick}
            className="px-10 py-4 bg-white hover:bg-brand-greyLight text-primary-dark font-heading font-extrabold text-[14px] tracking-[2px] rounded-full hover:scale-105 transition-all cursor-pointer uppercase shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          >
            {customer ? 'BOOK YOUR SLOT NOW →' : '🏏 LOGIN TO BOOK →'}
          </button>
        </div>
      </section>

      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false)
          navigate('/book-slot')
        }}
      />
    </div>
  )
}
