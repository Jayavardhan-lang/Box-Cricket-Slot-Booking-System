import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

function Footer() {
  return (
    <footer style={{ backgroundColor: '#1a5c2a' }} className="text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🏏</span>
              <div>
                <h3 className="font-bold text-lg leading-tight">Eagle Box Cricket</h3>
                <p className="text-white/60 text-xs">Your Premier Cricket Destination</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Experience the thrill of box cricket in state-of-the-art facilities.
              Book your slot online and play anytime!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[#f5a623] mb-4 uppercase tracking-wide text-sm">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/book-slot', label: 'Book a Slot' },
                { to: '/tournaments', label: 'Tournaments' },
                { to: '/membership', label: 'Membership Plans' },
                { to: '/my-bookings', label: 'My Bookings' },
                { to: '/faq', label: 'FAQ' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/70 hover:text-[#f5a623] transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-[#f5a623] mb-4 uppercase tracking-wide text-sm">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/70">
                <MapPin size={16} className="mt-0.5 text-[#f5a623] shrink-0" />
                <span>Eagle Box Cricket Ground,<br />Hyderabad, Telangana 500001</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Phone size={16} className="text-[#f5a623] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Mail size={16} className="text-[#f5a623] shrink-0" />
                <span>info@eagleboxcricket.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Clock size={16} className="text-[#f5a623] shrink-0" />
                <span>Open 6:00 AM – 11:00 PM, Daily</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/15 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-sm">
            © 2026 Eagle Box Cricket. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Designed with ❤️ for cricket lovers
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
