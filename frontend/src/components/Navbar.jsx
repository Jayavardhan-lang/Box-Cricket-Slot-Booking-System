import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Shield } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/book-slot', label: 'Book a Slot' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/membership', label: 'Membership' },
  { to: '/my-bookings', label: 'My Bookings' },
  { to: '/faq', label: 'FAQ' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinkClass = ({ isActive }) =>
    `transition-colors duration-200 font-medium text-sm ${
      isActive
        ? 'text-[#f5a623]'
        : 'text-white hover:text-[#f5a623]'
    }`

  return (
    <nav style={{ backgroundColor: '#1a5c2a' }} className="sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-white font-bold text-xl tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="text-2xl">🏏</span>
            <span>Eagle Box Cricket</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Admin Login Link (desktop) */}
          <div className="hidden md:flex items-center">
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-[#f5a623] transition-colors duration-200 border border-white/20 rounded-full px-3 py-1.5 hover:border-[#f5a623]/50"
            >
              <Shield size={12} />
              Admin
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white hover:text-[#f5a623] transition-colors duration-200 p-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{ backgroundColor: '#134520' }}
          className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-3"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navLinkClass}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-white/10">
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-[#f5a623] transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              <Shield size={12} />
              Admin Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
