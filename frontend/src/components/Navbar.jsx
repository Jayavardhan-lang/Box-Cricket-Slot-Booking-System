import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Shield } from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import LoginModal from './LoginModal'

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
  const [showLoginModal, setShowLoginModal] = useState(false)
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
        : 'text-white/85 border-transparent hover:text-primary hover:border-primary'
    }`

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 w-full z-[1000] h-[70px] flex items-center transition-all duration-300 ${
          scrolled
            ? 'bg-black/95 backdrop-blur-[20px] border-b border-primary/30 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
            : 'bg-black/90 backdrop-blur-[10px] border-b border-primary/20'
        }`}
      >
        {/* Main container with explicit left/right padding of 40px */}
        <div style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="flex items-center justify-between h-[70px]">

            {/* Logo — left */}
            <Link to="/" className="flex items-center gap-2 group" style={{ marginRight: '60px', flexShrink: 0 }}>
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

            {/* Nav links — center (hidden on mobile) */}
            <div className="hidden md:flex items-center" style={{ gap: '36px', flex: 1, justifyContent: 'center' }}>
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass} end={link.to === '/'}>
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right section — login or avatar (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-3" style={{ flexShrink: 0 }}>
              <DesktopCustomerSection onLoginClick={() => setShowLoginModal(true)} />

              {/* Admin icon - subtle */}
              <Link
                to="/admin/login"
                className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 hover:border-primary/50 text-white/60 hover:text-primary transition-all duration-300"
                title="Admin Panel"
              >
                <Shield size={14} />
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-primary hover:text-primary-light transition-all duration-200 p-1 cursor-pointer"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
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
            <div className="w-full max-w-xs" onClick={() => setMenuOpen(false)}>
              <MobileCustomerSection onLoginClick={() => { setMenuOpen(false); setShowLoginModal(true) }} />
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

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setShowLoginModal(false)}
      />
    </>
  )
}

function DesktopCustomerSection({ onLoginClick }) {
  const { customer, logoutCustomer } = useCustomerAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Not logged in — show minimal Login button
  if (!customer) {
    return (
      <button
        id="navbar-login-btn"
        onClick={onLoginClick}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '13px',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,1)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
      >
        Login
      </button>
    )
  }

  // Logged in — show avatar + dropdown
  return (
    <div className="relative">
      <button
        id="customer-avatar-btn"
        onClick={() => setDropdownOpen(o => !o)}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#00c853',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: '16px',
          fontFamily: 'Montserrat, sans-serif',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 0 0 2px rgba(0,200,83,0.3)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,200,83,0.5)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,200,83,0.3)' }}
        title={customer.name}
      >
        {customer.picture ? (
          <img src={customer.picture} alt={customer.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          customer.name?.[0]?.toUpperCase()
        )}
      </button>

      {dropdownOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-60 bg-[#111] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-20 overflow-hidden">
            {/* User info */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
              {customer.picture ? (
                <img src={customer.picture} alt={customer.name} className="w-10 h-10 rounded-full object-cover border border-primary/40 shrink-0" />
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

            {/* My Bookings */}
            <button
              onClick={() => { navigate('/my-bookings'); setDropdownOpen(false) }}
              className="w-full text-left px-4 py-3 font-heading font-bold text-[12px] tracking-wider text-white/80 hover:bg-white/5 hover:text-primary transition-colors cursor-pointer uppercase border-b border-white/5"
            >
              My Bookings
            </button>

            {/* Logout */}
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

function MobileCustomerSection({ onLoginClick }) {
  const { customer, logoutCustomer } = useCustomerAuth()

  if (!customer) {
    return (
      <button
        id="mobile-login-btn"
        onClick={onLoginClick}
        className="w-full max-w-xs px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-bold text-[15px] rounded-full shadow-[0_0_20px_rgba(0,200,83,0.4)] cursor-pointer hover:shadow-[0_0_30px_rgba(0,200,83,0.6)] transition-all"
      >
        🏏 LOGIN TO BOOK
      </button>
    )
  }

  return (
    <div className="w-full flex items-center justify-between px-3 py-3 bg-white/5 border border-white/10 rounded-2xl">
      <div className="flex items-center gap-3 min-w-0">
        {customer.picture ? (
          <img src={customer.picture} alt={customer.name} className="w-9 h-9 rounded-full border border-primary/40 object-cover shrink-0" />
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
