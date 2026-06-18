import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Shield } from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import GoogleLoginButton from './GoogleLoginButton'

const navLinks = [
  { to: '/', label: 'HOME' },
  { to: '/book-slot', label: 'BOOK SLOT' },
  { to: '/tournaments', label: 'TOURNAMENTS' },
  { to: '/membership', label: 'MEMBERSHIP' },
  { to: '/my-bookings', label: 'MY BOOKINGS' },
  { to: '/faq', label: 'FAQ' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinkClass = ({ isActive }) =>
    `transition-all duration-300 font-heading text-[13px] font-semibold tracking-[1.5px] py-2 border-b-2 ${
      isActive
        ? 'text-primary border-primary'
        : 'text-white/80 border-transparent hover:text-primary hover:border-primary'
    }`

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-[1000] h-[70px] flex items-center transition-all duration-300 ${
        scrolled
          ? 'bg-black/95 backdrop-blur-[20px] border-b border-primary/30 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
          : 'bg-black/90 backdrop-blur-[10px] border-b border-primary/20'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">

          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-3xl animate-bounce-slow">🏏</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display text-[28px] text-primary tracking-tight">EAGLE</span>
                <span className="font-display text-[28px] text-white tracking-tight">BOX CRICKET</span>
              </div>
              <span className="font-accent text-[10px] text-secondary tracking-[3px] leading-none mt-0.5">
                PLAY. WIN. REPEAT.
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/book-slot')}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-bold text-[13px] rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(0,200,83,0.3)] hover:shadow-[0_0_25px_rgba(0,200,83,0.6)] cursor-pointer"
            >
              BOOK NOW
            </button>

            <DesktopCustomerSection />

            <Link
              to="/admin/login"
              className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 hover:border-primary/50 text-white/60 hover:text-primary transition-all duration-300"
              title="Admin Panel"
            >
              <Shield size={14} />
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-primary hover:text-primary-light transition-all duration-200 p-1 cursor-pointer"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      <div
        style={{ backgroundColor: '#0a0a0a' }}
        className={`fixed inset-0 top-[70px] w-full h-[calc(100vh-70px)] z-[999] transition-all duration-300 md:hidden flex flex-col items-center justify-center gap-0 ${
          menuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `w-full text-center py-5 font-heading text-[20px] font-bold tracking-[2px] border-b border-white/10 transition-colors ${
                isActive ? 'text-primary' : 'text-white hover:text-primary hover:bg-white/5'
              }`
            }
            end={link.to === '/'}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}

        <div className="flex flex-col items-center gap-4 mt-8 px-6 w-full">
          <button
            onClick={() => {
              setMenuOpen(false)
              navigate('/book-slot')
            }}
            className="w-full max-w-xs px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-bold text-[15px] rounded-full shadow-[0_0_20px_rgba(0,200,83,0.4)] cursor-pointer hover:shadow-[0_0_30px_rgba(0,200,83,0.6)] transition-all"
          >
            BOOK A SLOT
          </button>

          <div className="w-full max-w-xs" onClick={() => setMenuOpen(false)}>
            <MobileCustomerSection />
          </div>

          <Link
            to="/admin/login"
            className="flex items-center gap-2 text-white/50 hover:text-primary font-accent text-sm tracking-[1.5px]"
            onClick={() => setMenuOpen(false)}
          >
            <Shield size={16} />
            ADMIN LOGIN
          </Link>
        </div>
      </div>
    </nav>
  )
}

function DesktopCustomerSection() {
  const { customer, logoutCustomer } = useCustomerAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (!customer) {
    return <GoogleLoginButton />
  }

  return (
    <div className="relative">
      <button
        id="customer-avatar-btn"
        onClick={() => setDropdownOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 hover:border-primary/40 transition-all duration-300 cursor-pointer"
      >
        {customer.picture ? (
          <img
            src={customer.picture}
            alt={customer.name}
            className="w-6 h-6 rounded-full object-cover border border-primary/50"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center text-xs text-primary font-bold">
            {customer.name?.[0]?.toUpperCase()}
          </div>
        )}
        <span className="font-heading font-bold text-[12px] text-white max-w-[100px] truncate">
          {customer.name.split(' ')[0]}
        </span>
        <svg
          className={`w-3 h-3 text-white/60 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <>

          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-60 bg-[#111] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
              {customer.picture ? (
                <img
                  src={customer.picture}
                  alt={customer.name}
                  className="w-10 h-10 rounded-full object-cover border border-primary/40 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold shrink-0">
                  {customer.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-heading font-bold text-white text-sm truncate">{customer.name}</p>
                <p className="font-sans text-[10px] text-white/50 truncate">{customer.email}</p>
              </div>
            </div>
            <button
              id="customer-logout-btn"
              onClick={() => { logoutCustomer(); setDropdownOpen(false) }}
              className="w-full text-left px-4 py-3 font-heading font-bold text-[12px] tracking-wider text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer uppercase"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function MobileCustomerSection() {
  const { customer, logoutCustomer } = useCustomerAuth()

  if (!customer) {
    return (
      <div className="w-full flex justify-center">
        <GoogleLoginButton />
      </div>
    )
  }

  return (
    <div className="w-full flex items-center justify-between px-3 py-3 bg-white/5 border border-white/10 rounded-2xl">
      <div className="flex items-center gap-3 min-w-0">
        {customer.picture ? (
          <img
            src={customer.picture}
            alt={customer.name}
            className="w-9 h-9 rounded-full border border-primary/40 object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold shrink-0">
            {customer.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-heading font-bold text-white text-sm truncate">{customer.name}</p>
          <p className="font-sans text-[10px] text-white/50 truncate">{customer.email}</p>
        </div>
      </div>
      <button
        onClick={logoutCustomer}
        className="shrink-0 ml-3 text-[11px] font-heading font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer uppercase"
      >
        Sign out
      </button>
    </div>
  )
}

export default Navbar
