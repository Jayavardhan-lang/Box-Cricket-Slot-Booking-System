import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Download, TrendingUp } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import { API_URL } from '../../config'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Reports() {
  const [bookings, setBookings] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/bookings`),
      axios.get(`${API_URL}/slots`),
    ]).then(([bRes, sRes]) => {
      setBookings(bRes.data.data || [])
      setSlots(sRes.data.data || [])
    }).catch(e => {
      setError(e.response?.data?.message || 'Failed to load reports')
    }).finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const thisMonth = now.getMonth()
  const lastMonth = (now.getMonth() - 1 + 12) % 12
  const thisYear = now.getFullYear()
  const lastYear = lastMonth === 11 ? thisYear - 1 : thisYear

  const paid = bookings.filter(b => b.payment_status === 'paid')
  const thisMonthRev = paid.filter(b => {
    const d = new Date(b.booked_at)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).reduce((s, b) => s + parseFloat(b.total_amount || 0), 0)
  const lastMonthRev = paid.filter(b => {
    const d = new Date(b.booked_at)
    return d.getMonth() === lastMonth && d.getFullYear() === lastYear
  }).reduce((s, b) => s + parseFloat(b.total_amount || 0), 0)
  const totalRev = paid.reduce((s, b) => s + parseFloat(b.total_amount || 0), 0)

  // Group by date
  const byDate = useMemo(() => {
    const map = {}
    bookings.forEach(b => {
      const day = b.booked_at?.slice(0, 10)
      if (!day) return
      if (!map[day]) map[day] = { date: day, bookings: 0, revenue: 0 }
      map[day].bookings++
      if (b.payment_status === 'paid') map[day].revenue += parseFloat(b.total_amount || 0)
    })
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date))
  }, [bookings])

  // Occupancy
  const totalSlots = slots.length
  const bookedSlots = slots.filter(s => s.status === 'booked').length
  const occupancy = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0

  const exportCSV = () => {
    const headers = ['ID', 'Customer', 'Phone', 'Team', 'Date', 'Start Time', 'Amount', 'Status', 'Payment']
    const rows = bookings.map(b => [
      b.id, b.customer_name, b.phone, b.team_name,
      b.date, b.start_time, b.total_amount,
      b.booking_status, b.payment_status
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'bookings_report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const StatCard = ({ label, value, sub, color }) => (
    <div
      className="bg-brand-card rounded-2xl border border-white/5 p-6 shadow-lg flex flex-col justify-between"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div>
        <p className="font-accent text-[11px] text-brand-greyMedium tracking-wider uppercase mb-2">{label}</p>
        <p className="font-display text-4xl text-white tracking-wide leading-none">{value}</p>
      </div>
      {sub && <p className="font-sans text-[10px] text-brand-greyMedium mt-3 uppercase tracking-wider">{sub}</p>}
    </div>
  )

  return (
    <div className="flex min-h-screen bg-brand-dark text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-6 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white tracking-wide uppercase">ANALYTICS & REPORTS</h1>
            <p className="font-sans text-xs text-brand-greyMedium uppercase mt-1">Financial performance and arena occupancy stats</p>
          </div>
          <button
            id="export-csv-btn"
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-heading font-bold text-[12px] tracking-wider rounded-xl hover:scale-105 transition-all shadow-[0_4px_12px_rgba(0,200,83,0.2)] cursor-pointer uppercase"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Revenue Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <StatCard label="This Month Revenue" value={`₹${thisMonthRev.toLocaleString()}`} color="#00c853" />
              <StatCard label="Last Month Revenue" value={`₹${lastMonthRev.toLocaleString()}`} color="#ffd700" />
              <StatCard label="Total Revenue (All Time)" value={`₹${totalRev.toLocaleString()}`} sub={`from ${paid.length} paid bookings`} color="#ff6f00" />
            </div>

            {/* Occupancy Chart Section */}
            <div className="bg-brand-card border border-white/5 rounded-2xl p-6 mb-8 shadow-2xl">
              <h2 className="font-heading font-black text-xs text-secondary tracking-widest uppercase mb-6 flex items-center gap-2.5">
                <TrendingUp size={15} className="text-primary" />
                <span>SLOT OCCUPANCY RATIO</span>
              </h2>
              
              <div className="grid grid-cols-3 gap-6 text-left border-b border-white/5 pb-6 mb-6">
                <div>
                  <p className="font-accent text-[9px] text-brand-greyMedium tracking-wider uppercase mb-1">Total Scheduled</p>
                  <p className="font-display text-3xl text-white">{totalSlots} <span className="font-accent text-xs">Slots</span></p>
                </div>
                <div>
                  <p className="font-accent text-[9px] text-brand-greyMedium tracking-wider uppercase mb-1">Booked Active</p>
                  <p className="font-display text-3xl text-error">{bookedSlots} <span className="font-accent text-xs">Slots</span></p>
                </div>
                <div>
                  <p className="font-accent text-[9px] text-brand-greyMedium tracking-wider uppercase mb-1">Ratio</p>
                  <p className="font-display text-3xl text-primary">{occupancy}%</p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="bg-brand-greyDark rounded-full h-3.5 overflow-hidden border border-white/5">
                <div
                  className="h-3.5 rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 shadow-[0_0_15px_rgba(0,200,83,0.4)]"
                  style={{ width: `${occupancy}%` }}
                />
              </div>
            </div>

            {/* Revenue table by date */}
            <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-6 py-5 border-b border-white/5 bg-black/45">
                <h2 className="font-heading font-black text-xs text-secondary tracking-widest uppercase">REVENUE BY DATE</h2>
              </div>
              
              {byDate.length === 0 ? (
                <p className="text-center text-brand-greyMedium py-12 text-xs font-sans">No booking metrics recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-brand-greyDark/40 text-brand-greyMedium text-[10px] font-accent font-bold tracking-widest uppercase border-b border-white/5">
                      <tr>
                        {['Date', 'Bookings Count', 'Revenue Generated'].map(h => (
                          <th key={h} className="px-6 py-4 text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-sans text-white/95">
                      {byDate.map(row => (
                        <tr key={row.date} className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4 font-semibold">{formatDate(row.date)}</td>
                          <td className="px-6 py-4 font-bold text-white">{row.bookings}</td>
                          <td className="px-6 py-4 font-bold text-primary">₹{row.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
