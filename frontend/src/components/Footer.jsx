import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-black border-t border-primary/20 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group w-max">
              <span className="text-3xl">🏏</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-display text-[26px] text-primary tracking-tight">EAGLE</span>
                  <span className="font-display text-[26px] text-white tracking-tight">BOX CRICKET</span>
                </div>
                <span className="font-accent text-[9px] text-secondary tracking-[3px] leading-none mt-0.5">
                  PLAY. WIN. REPEAT.
                </span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Hyderabad's ultimate box cricket destination. Unleash your inner champion under standard stadium lights on our premium turf.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-extrabold text-[#ffd700] mb-6 uppercase tracking-wider text-[13px]">
              QUICK LINKS
            </h4>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
              {[
                { to: '/', label: 'Home' },
                { to: '/book-slot', label: 'Book a Slot' },
                { to: '/tournaments', label: 'Tournaments' },
                { to: '/membership', label: 'Membership' },
                { to: '/my-bookings', label: 'My Bookings' },
                { to: '/faq', label: 'FAQ Assistance' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/70 hover:text-primary transition-colors duration-200 text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-heading font-extrabold text-[#ffd700] mb-6 uppercase tracking-wider text-[13px]">
              CONTACT VENUE
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MapPin size={18} className="mt-0.5 text-primary shrink-0" />
                <span>Eagle Box Cricket Ground,<br />Hyderabad, Telangana 500001</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Mail size={18} className="text-primary shrink-0" />
                <span>info@eagleboxcricket.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Clock size={18} className="text-primary shrink-0" />
                <span>Open 6:00 AM – 11:00 PM, Daily</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs font-heading tracking-wider">
            © 2026 EAGLE BOX CRICKET. ALL RIGHTS RESERVED.
          </p>
          <p className="text-white/30 text-xs font-accent tracking-widest uppercase">
            Designed for champions 🏆
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
