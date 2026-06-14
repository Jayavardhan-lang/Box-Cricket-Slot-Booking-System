import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, RefreshCw, Trash2 } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
import StatusBadge from '../../components/StatusBadge'
import { API_URL } from '../../config'

const today = new Date().toISOString().split('T')[0]

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':'); const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

const initForm = { date: today, start_time: '06:00', end_time: '07:00', price: '', status: 'available' }

export default function SlotManagement() {
  const [slots, setSlots]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [form, setForm]             = useState(initForm)
  const [formErr, setFormErr]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [acting, setActing]         = useState(null)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const url = filterDate ? `${API_URL}/slots?date=${filterDate}` : `${API_URL}/slots`
      const { data } = await axios.get(url)
      setSlots(data.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load slots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filterDate])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.price) { setFormErr('Price is required'); return }
    setSubmitting(true); setFormErr('')
    try {
      await axios.post(`${API_URL}/slots`, form)
      setSuccess('Slot created successfully')
      setModalOpen(false); setForm(initForm)
      load()
    } catch (e) {
      setFormErr(e.response?.data?.message || 'Failed to create slot')
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (id, status) => {
    setActing(id + status)
    try {
      await axios.put(`${API_URL}/slots/${id}`, { status })
      setSuccess(`Slot ${status === 'blocked' ? 'blocked' : 'unblocked'} successfully`)
      setSlots(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed')
    } finally {
      setActing(null)
    }
  }

  const deleteSlot = async (id) => {
    if (!window.confirm('Delete this slot permanently?')) return
    setActing('del' + id)
    try {
      await axios.delete(`${API_URL}/slots/${id}`)
      setSuccess('Slot deleted')
      setSlots(prev => prev.filter(s => s.id !== id))
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed')
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Slot Management</h1>
            <p className="text-gray-500 text-sm">Create, block, and manage cricket slots</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#1a5c2a]"
              placeholder="Filter by date" />
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="text-sm text-gray-400 hover:text-gray-600">Clear</button>
            )}
            <button
              id="add-slot-btn"
              onClick={() => { setModalOpen(true); setFormErr(''); setForm(initForm) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: '#1a5c2a' }}>
              <Plus size={16} /> Add Slot
            </button>
          </div>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
              <button onClick={load} className="text-xs text-[#1a5c2a] flex items-center gap-1 hover:underline">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            {slots.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📅</div>
                <p>No slots found. {filterDate ? 'Try clearing the date filter.' : 'Add your first slot.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['ID','Date','Start Time','End Time','Price','Status','Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {slots.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 font-bold text-[#1a5c2a]">#{s.id}</td>
                        <td className="px-5 py-3">{new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                        <td className="px-5 py-3 font-medium">{formatTime(s.start_time)}</td>
                        <td className="px-5 py-3 text-gray-500">{formatTime(s.end_time)}</td>
                        <td className="px-5 py-3 font-bold text-[#16a34a]">₹{s.price}</td>
                        <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1.5">
                            {s.status !== 'booked' && (
                              s.status === 'blocked' ? (
                                <button onClick={() => updateStatus(s.id, 'available')} disabled={!!acting}
                                  className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors disabled:opacity-60">
                                  {acting === s.id + 'available' ? '...' : 'Unblock'}
                                </button>
                              ) : (
                                <button onClick={() => updateStatus(s.id, 'blocked')} disabled={!!acting}
                                  className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors disabled:opacity-60">
                                  {acting === s.id + 'blocked' ? '...' : 'Block'}
                                </button>
                              )
                            )}
                            <button onClick={() => deleteSlot(s.id)} disabled={!!acting}
                              className="px-2.5 py-1 rounded-lg bg-red-100 text-red-600 text-xs hover:bg-red-200 transition-colors disabled:opacity-60">
                              <Trash2 size={13} />
                            </button>
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

        {/* Add Slot Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Slot">
          {formErr && <Alert type="error" message={formErr} onClose={() => setFormErr('')} />}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
              <input type="date" value={form.date} min={today}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time *</label>
                <input type="time" value={form.start_time}
                  onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Time *</label>
                <input type="time" value={form.end_time}
                  onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
                <input type="number" value={form.price} min={0}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. 1200"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a] bg-white">
                  <option value="available">Available</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#1a5c2a', flex: 2 }}>
                {submitting ? <><Spinner size="sm" color="white" />Creating...</> : '+ Create Slot'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}
