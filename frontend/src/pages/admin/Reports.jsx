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
  const [slots, setSlots]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

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
  const thisYear  = now.getFullYear()
  const lastYear  = lastMonth === 11 ? thisYear - 1 : thisYear

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
  const totalSlots  = slots.length
  const bookedSlots = slots.filter(s => s.status === 'booked').length
  const occupancy   = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0

  const exportCSV = () => {
    const headers = ['ID','Customer','Phone','Team','Date','Start Time','Amount','Status','Payment']
    const rows = bookings.map(b => [
      b.id, b.customer_name, b.phone, b.team_name,
      b.date, b.start_time, b.total_amount,
      b.booking_status, b.payment_status
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'bookings_report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const StatCard = ({ label, value, sub, color }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-3xl font-extrabold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Reports</h1>
            <p className="text-gray-500 text-sm">Revenue, occupancy, and booking analytics</p>
          </div>
          <button
            id="export-csv-btn"
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all"
            style={{ backgroundColor: '#1a5c2a' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Revenue Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <StatCard label="This Month Revenue" value={`₹${thisMonthRev.toLocaleString()}`} color="#16a34a" />
              <StatCard label="Last Month Revenue"  value={`₹${lastMonthRev.toLocaleString()}`} color="#d97706" />
              <StatCard label="Total Revenue (All Time)" value={`₹${totalRev.toLocaleString()}`} sub={`from ${paid.length} paid bookings`} color="#1a5c2a" />
            </div>

            {/* Occupancy */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
              <h2 className="font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-[#1a5c2a]" /> Slot Occupancy
              </h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-gray-400 text-xs mb-1">Total Slots</p><p className="text-2xl font-extrabold text-gray-700">{totalSlots}</p></div>
                <div><p className="text-gray-400 text-xs mb-1">Booked</p><p className="text-2xl font-extrabold text-red-500">{bookedSlots}</p></div>
                <div><p className="text-gray-400 text-xs mb-1">Occupancy</p><p className="text-2xl font-extrabold text-[#1a5c2a]">{occupancy}%</p></div>
              </div>
              <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${occupancy}%`, backgroundColor: '#1a5c2a' }} />
              </div>
            </div>

            {/* Revenue by Date */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-[#1a1a1a]">Revenue by Date</h2>
              </div>
              {byDate.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No booking data</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        {['Date','Bookings','Revenue'].map(h => <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {byDate.map(row => (
                        <tr key={row.date} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3">{formatDate(row.date)}</td>
                          <td className="px-5 py-3 font-semibold">{row.bookings}</td>
                          <td className="px-5 py-3 font-semibold text-[#16a34a]">₹{row.revenue.toLocaleString()}</td>
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
