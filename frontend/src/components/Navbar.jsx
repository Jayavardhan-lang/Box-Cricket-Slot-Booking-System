import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Shield } from 'lucide-react'

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
          
          {/* Left Section: Logo */}
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

          {/* Center Section: Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Section: CTA & Admin */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/book-slot')}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-bold text-[13px] rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(0,200,83,0.3)] hover:shadow-[0_0_25px_rgba(0,200,83,0.6)] cursor-pointer"
            >
              BOOK NOW
            </button>
            <Link
              to="/admin/login"
              className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 hover:border-primary/50 text-white/60 hover:text-primary transition-all duration-300"
              title="Admin Panel"
            >
              <Shield size={14} />
            </Link>
          </div>

          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-primary hover:text-primary-light transition-all duration-200 p-1 cursor-pointer"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 top-[70px] w-full h-[calc(100vh-70px)] bg-black/98 backdrop-blur-[20px] transition-all duration-300 md:hidden flex flex-col items-center justify-center gap-8 ${
          menuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="font-heading text-[22px] font-bold tracking-[2px] text-white hover:text-primary transition-colors"
            end={link.to === '/'}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        <button
          onClick={() => {
            setMenuOpen(false)
            navigate('/book-slot')
          }}
          className="mt-4 px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-bold text-[15px] rounded-full shadow-[0_0_20px_rgba(0,200,83,0.3)] cursor-pointer"
        >
          BOOK A SLOT
        </button>
        <Link
          to="/admin/login"
          className="flex items-center gap-2 text-white/50 hover:text-primary font-accent text-sm tracking-[1.5px] mt-4"
          onClick={() => setMenuOpen(false)}
        >
          <Shield size={16} />
          ADMIN LOGIN
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
