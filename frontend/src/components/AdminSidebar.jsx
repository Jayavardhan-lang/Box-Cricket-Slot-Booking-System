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
  ShieldAlert
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
    `flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl font-heading text-[12px] font-extrabold tracking-wider transition-all duration-300 uppercase ${
      isActive
        ? 'bg-primary/15 text-primary border-r-4 border-primary shadow-[0_0_15px_rgba(0,200,83,0.1)]'
        : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`

  return (
    <aside className="w-64 min-h-screen bg-black border-r border-white/5 flex flex-col shadow-[4px_0_30px_rgba(0,0,0,0.5)] z-25">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-2 group">
          <span className="text-2xl animate-float-slow">🏏</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display text-[22px] text-primary tracking-tight">EAGLE</span>
              <span className="font-display text-[22px] text-white tracking-tight">BOX</span>
            </div>
            <span className="font-accent text-[9px] text-secondary tracking-[2px] leading-none mt-1">
              ADMIN CONTROL
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
        {sidebarLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} id={`sidebar-${label.toLowerCase()}`}>
            <Icon size={16} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Admin Session Info & Logout */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-3 bg-brand-card/45">
        <div className="px-2 py-1.5 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="font-accent text-[10px] text-brand-greyMedium tracking-wider uppercase">
            operator: eagleadmin
          </span>
        </div>
        <button
          id="sidebar-logout"
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-4.5 py-3 rounded-xl font-heading text-[12px] font-extrabold tracking-wider text-error/80 hover:bg-error/10 hover:text-error transition-all duration-300 uppercase cursor-pointer border border-error/20"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
