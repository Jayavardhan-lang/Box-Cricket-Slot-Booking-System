import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, RefreshCw, Trash2, CalendarDays, Clock, IndianRupee } from 'lucide-react'
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
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initForm)
  const [formErr, setFormErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [acting, setActing] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
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

  useEffect(() => {
    load()
  }, [filterDate])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.price) {
      setFormErr('Price is required')
      return
    }
    setSubmitting(true)
    setFormErr('')
    try {
      await axios.post(`${API_URL}/slots`, form)
      setSuccess('Slot created successfully')
      setModalOpen(false)
      setForm(initForm)
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
    <div className="flex min-h-screen bg-brand-dark text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">

        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-6 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white tracking-wide uppercase">SLOT CONTROL</h1>
            <p className="font-sans text-xs text-brand-greyMedium uppercase mt-1">Configure and manage scheduling inventory</p>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="bg-brand-greyDark border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary transition-all cursor-pointer font-sans"
              placeholder="Filter by date"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="font-heading font-extrabold text-[10px] text-brand-greyMedium hover:text-white uppercase tracking-wider cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              id="add-slot-btn"
              onClick={() => { setModalOpen(true); setFormErr(''); setForm(initForm) }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-heading font-bold text-[12px] tracking-wider rounded-xl hover:scale-105 transition-all shadow-[0_4px_12px_rgba(0,200,83,0.2)] cursor-pointer uppercase"
            >
              <Plus size={14} />
              <span>Add Slot</span>
            </button>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-black/45">
              <span className="font-accent text-xs text-brand-greyMedium tracking-wider uppercase">
                {slots.length} SLOT{slots.length !== 1 ? 'S' : ''} SCHEDULED
              </span>
              <button
                onClick={load}
                className="flex items-center gap-1.5 font-heading font-extrabold text-[10px] text-primary hover:text-primary-light uppercase tracking-wider cursor-pointer"
              >
                <RefreshCw size={10} />
                <span>REFRESH</span>
              </button>
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 animate-float-slow">📅</div>
                <h3 className="font-heading font-black text-sm text-white uppercase">No Slots Found</h3>
                <p className="font-sans text-xs text-brand-greyMedium mt-1">
                  {filterDate ? 'Try clearing the date filter selection.' : 'Add your first slot using the button above.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-brand-greyDark/40 text-brand-greyMedium text-[10px] font-accent font-bold tracking-widest uppercase border-b border-white/5">
                    <tr>
                      {['ID', 'Date', 'Start Time', 'End Time', 'Price', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {slots.map(s => (
                      <tr key={s.id} className="hover:bg-primary/5 transition-colors font-sans text-xs text-white/95">
                        <td className="px-6 py-4 font-bold text-primary">#{s.id}</td>
                        <td className="px-6 py-4 font-semibold">
                          {new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">{formatTime(s.start_time)}</td>
                        <td className="px-6 py-4 text-brand-greyMedium">{formatTime(s.end_time)}</td>
                        <td className="px-6 py-4 font-bold text-primary">₹{parseInt(s.price)}</td>
                        <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {s.status !== 'booked' && (
                              s.status === 'blocked' ? (
                                <button
                                  onClick={() => updateStatus(s.id, 'available')}
                                  disabled={!!acting}
                                  className="px-3.5 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold cursor-pointer uppercase"
                                >
                                  {acting === s.id + 'available' ? '...' : 'Unblock'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateStatus(s.id, 'blocked')}
                                  disabled={!!acting}
                                  className="px-3.5 py-1.5 rounded-lg bg-brand-greyDark border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-xs font-bold cursor-pointer uppercase"
                                >
                                  {acting === s.id + 'blocked' ? '...' : 'Block'}
                                </button>
                              )
                            )}
                            <button
                              onClick={() => deleteSlot(s.id)}
                              disabled={!!acting}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-error/10 border border-error/30 text-error hover:bg-error hover:text-white transition-all cursor-pointer"
                              title="Delete permanently"
                            >
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

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Slot">
          {formErr && <Alert type="error" message={formErr} onClose={() => setFormErr('')} />}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                MATCH DATE *
              </label>
              <input
                type="date"
                value={form.date}
                min={today}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                  START TIME *
                </label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  className="w-full bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer font-sans"
                />
              </div>
              <div>
                <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                  END TIME *
                </label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                  className="w-full bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                  PRICE (₹) *
                </label>
                <input
                  type="number"
                  value={form.price}
                  min={0}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. 1200"
                  className="w-full bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-sans"
                />
              </div>
              <div>
                <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                  INITIAL STATUS
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="available">Available</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3.5 border border-white/10 text-white hover:bg-white/5 font-heading font-extrabold text-[12px] tracking-wider rounded-xl transition-all cursor-pointer uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] py-3.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-heading font-extrabold text-[12px] tracking-wider rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,200,83,0.3)] cursor-pointer uppercase"
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" color="white" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>+ Create Slot</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}
