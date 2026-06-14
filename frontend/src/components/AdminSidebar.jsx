import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Trophy,
  CreditCard,
  BarChart3,
  MessageSquare,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const sidebarLinks = [
  { to: '/admin/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/admin/slots',       label: 'Slots',         icon: CalendarDays },
  { to: '/admin/bookings',    label: 'Bookings',      icon: BookOpen },
  { to: '/admin/tournaments', label: 'Tournaments',   icon: Trophy },
  { to: '/admin/memberships', label: 'Memberships',   icon: CreditCard },
  { to: '/admin/reports',     label: 'Reports',       icon: BarChart3 },
  { to: '/admin/feedback',    label: 'Feedback',      icon: MessageSquare },
]

function AdminSidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-[#f5a623] text-white shadow-md'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`

  return (
    <aside
      style={{ backgroundColor: '#1a5c2a' }}
      className="w-64 min-h-screen flex flex-col shadow-xl"
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/15">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏏</span>
          <div>
            <h2 className="text-white font-bold text-base leading-tight">Eagle Box Cricket</h2>
            <p className="text-white/50 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {sidebarLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} id={`sidebar-${label.toLowerCase()}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/15">
        <button
          id="sidebar-logout"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-red-600/80 hover:text-white transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
