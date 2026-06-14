import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import AdminSidebar from '../../components/AdminSidebar'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
import StatusBadge from '../../components/StatusBadge'
import { API_URL } from '../../config'

export default function MembershipManagement() {
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [viewModal, setViewModal] = useState(null)
  const [acting, setActing] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`${API_URL}/memberships`)
      setMemberships(data.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load memberships')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => memberships.filter(m => {
    return (!filterStatus || m.status === filterStatus) && (!filterPlan || m.plan_name === filterPlan)
  }), [memberships, filterStatus, filterPlan])

  const expireMembership = async (id) => {
    setActing(id)
    try {
      await axios.put(`${API_URL}/memberships/${id}`, { status: 'expired' })
      setSuccess('Membership marked as expired')
      setMemberships(prev => prev.map(m => m.id === id ? { ...m, status: 'expired' } : m))
      setViewModal(prev => prev ? { ...prev, status: 'expired' } : null)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update')
    } finally {
      setActing(null)
    }
  }

  // Plan styling map for badges
  const planBadge = {
    basic: 'bg-primary/10 text-primary border border-primary/20',
    premium: 'bg-secondary/10 text-secondary border border-secondary/20',
    corporate: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  }

  return (
    <div className="flex min-h-screen bg-brand-dark text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-6 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white tracking-wide uppercase">MEMBERSHIP CONTROL</h1>
            <p className="font-sans text-xs text-brand-greyMedium uppercase mt-1">
              {filtered.length} active and expired subscriptions
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 font-heading font-extrabold text-[10px] text-primary hover:text-primary-light uppercase tracking-wider cursor-pointer"
          >
            <RefreshCw size={10} className="mr-0.5" />
            <span>REFRESH</span>
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

        {/* Filters Panel */}
        <div className="bg-brand-card border border-primary/20 rounded-3xl p-5 mb-8 flex flex-wrap gap-4 shadow-xl">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none transition-all cursor-pointer font-sans"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={filterPlan}
            onChange={e => setFilterPlan(e.target.value)}
            className="bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none transition-all cursor-pointer font-sans"
          >
            <option value="">All Plans</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 animate-float-slow">💳</div>
                <h3 className="font-heading font-black text-sm text-white uppercase">No Memberships Found</h3>
                <p className="font-sans text-xs text-brand-greyMedium mt-1">Try resetting the status or plan filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-brand-greyDark/40 text-brand-greyMedium text-[10px] font-accent font-bold tracking-widest uppercase border-b border-white/5">
                    <tr>
                      {['ID', 'Customer', 'Phone', 'Plan', 'Start', 'End', 'Status', 'Amount', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-sans text-white/95">
                    {filtered.map(m => (
                      <tr key={m.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-primary">#{m.id}</td>
                        <td className="px-6 py-4 font-semibold uppercase">{m.name}</td>
                        <td className="px-6 py-4 text-brand-greyMedium">{m.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-accent font-black tracking-wider uppercase ${planBadge[m.plan_name]}`}>
                            {m.plan_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-brand-greyMedium whitespace-nowrap">
                          {new Date(m.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-brand-greyMedium whitespace-nowrap">
                          {new Date(m.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={m.status} /></td>
                        <td className="px-6 py-4 font-bold text-primary">₹{parseInt(m.amount_paid)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setViewModal(m)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-primary/20 hover:text-primary transition-all text-[11px] font-extrabold tracking-wider uppercase cursor-pointer"
                            >
                              View
                            </button>
                            {m.status === 'active' && (
                              <button
                                onClick={() => expireMembership(m.id)}
                                disabled={acting === m.id}
                                className="px-3 py-1.5 rounded-lg bg-error/15 border border-error/30 text-error hover:bg-error hover:text-white transition-all text-[11px] font-extrabold tracking-wider uppercase cursor-pointer"
                              >
                                {acting === m.id ? '...' : 'Expire'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Detail View Modal */}
        <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title={`MEMBERSHIP DETAILS — #${viewModal?.id}`}>
          {viewModal && (
            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['CUSTOMER', viewModal.name],
                  ['PHONE NUMBER', viewModal.phone],
                  ['EMAIL ADDRESS', viewModal.email || '—'],
                  ['CUSTOMER TYPE', <span className="capitalize">{viewModal.customer_type}</span>],
                  ['PLAN OPTED', <span className={`px-2.5 py-1 rounded-full text-[10px] font-accent font-black tracking-wider uppercase ${planBadge[viewModal.plan_name]}`}>{viewModal.plan_name}</span>],
                  ['STATUS', <StatusBadge status={viewModal.status} />],
                  ['ACTIVATION DATE', new Date(viewModal.start_date).toLocaleDateString('en-IN')],
                  ['EXPIRY DATE', new Date(viewModal.end_date).toLocaleDateString('en-IN')],
                  ['AMOUNT PAID', <span className="font-bold text-primary">₹{parseInt(viewModal.amount_paid)}</span>],
                ].map(([label, val]) => (
                  <div key={label} className="bg-brand-greyDark border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                    <p className="font-accent text-[9px] text-brand-greyMedium tracking-wider uppercase mb-1">{label}</p>
                    <div className="font-semibold text-white text-xs sm:text-sm">{val}</div>
                  </div>
                ))}
              </div>
              
              {viewModal.status === 'active' && (
                <button
                  onClick={() => expireMembership(viewModal.id)}
                  disabled={acting === viewModal.id}
                  className="w-full py-3.5 bg-error text-white font-heading font-extrabold text-[12px] tracking-wider rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 mt-4 cursor-pointer uppercase shadow-[0_4px_12px_rgba(255,23,68,0.2)]"
                >
                  {acting === viewModal.id ? 'Updating...' : 'Mark as Expired'}
                </button>
              )}
            </div>
          )}
        </Modal>
      </main>
    </div>
  )
}
