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
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPlan, setFilterPlan]     = useState('')
  const [viewModal, setViewModal]       = useState(null)
  const [acting, setActing]             = useState(null)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await axios.get(`${API_URL}/memberships`)
      setMemberships(data.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load memberships')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

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

  const planBadge = { basic: 'bg-green-100 text-green-700', premium: 'bg-yellow-100 text-yellow-700', corporate: 'bg-purple-100 text-purple-700' }

  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Membership Management</h1>
          <p className="text-gray-500 text-sm">{filtered.length} membership{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2a] bg-white">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2a] bg-white">
            <option value="">All Plans</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">💳</div>
                <p>No memberships found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['ID','Customer','Phone','Plan','Start','End','Status','Amount','Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-[#1a5c2a]">#{m.id}</td>
                        <td className="px-4 py-3 font-medium">{m.name}</td>
                        <td className="px-4 py-3 text-gray-500">{m.phone}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${planBadge[m.plan_name]}`}>
                            {m.plan_name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(m.start_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(m.end_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                        <td className="px-4 py-3 font-semibold text-[#16a34a]">₹{m.amount_paid}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => setViewModal(m)}
                              className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200">View</button>
                            {m.status === 'active' && (
                              <button onClick={() => expireMembership(m.id)} disabled={acting === m.id}
                                className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 disabled:opacity-60">
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

        {/* View Modal */}
        <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title={`Membership #${viewModal?.id}`}>
          {viewModal && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Customer', viewModal.name],
                  ['Phone', viewModal.phone],
                  ['Email', viewModal.email || '—'],
                  ['Type', viewModal.customer_type],
                  ['Plan', <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${planBadge[viewModal.plan_name]}`}>{viewModal.plan_name}</span>],
                  ['Status', <StatusBadge status={viewModal.status} />],
                  ['Start Date', new Date(viewModal.start_date).toLocaleDateString('en-IN')],
                  ['End Date', new Date(viewModal.end_date).toLocaleDateString('en-IN')],
                  ['Amount Paid', <span className="font-bold text-[#16a34a]">₹{viewModal.amount_paid}</span>],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">{label}</p>
                    <div className="font-semibold">{val}</div>
                  </div>
                ))}
              </div>
              {viewModal.status === 'active' && (
                <button onClick={() => expireMembership(viewModal.id)} disabled={acting === viewModal.id}
                  className="w-full py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-60 mt-4">
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
