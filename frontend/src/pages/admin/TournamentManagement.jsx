import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, RefreshCw, Users, Trophy, List } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
import StatusBadge from '../../components/StatusBadge'
import { API_URL } from '../../config'

const today = new Date().toISOString().split('T')[0]
const initTForm = { name: '', date: today, entry_fee: 0, max_teams: 8, status: 'upcoming' }
const initFForm = { tournament_id: '', team1: '', team2: '', match_date: today, match_time: '10:00' }

export default function TournamentManagement() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [tModal, setTModal]     = useState(false)
  const [tForm, setTForm]       = useState(initTForm)
  const [tSubmitting, setTSub]  = useState(false)
  const [tFormErr, setTFormErr] = useState('')

  // Sub-modals
  const [regModal, setRegModal]       = useState(null)
  const [regList, setRegList]         = useState([])
  const [regLoading, setRegLoading]   = useState(false)
  const [fixModal, setFixModal]       = useState(null)
  const [fixtures, setFixtures]       = useState([])
  const [fixLoading, setFixLoading]   = useState(false)
  const [fForm, setFForm]             = useState(initFForm)
  const [fSubmitting, setFSub]        = useState(false)
  const [ptModal, setPtModal]         = useState(null)
  const [points, setPoints]           = useState([])
  const [ptLoading, setPtLoading]     = useState(false)
  const [resultInput, setResultInput] = useState({})

  const load = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await axios.get(`${API_URL}/tournaments`)
      setTournaments(data.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load tournaments')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const createTournament = async (e) => {
    e.preventDefault()
    if (!tForm.name) { setTFormErr('Name is required'); return }
    setTSub(true); setTFormErr('')
    try {
      await axios.post(`${API_URL}/tournaments`, tForm)
      setSuccess('Tournament created'); setTModal(false); setTForm(initTForm); load()
    } catch (e) { setTFormErr(e.response?.data?.message || 'Failed') }
    finally { setTSub(false) }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/tournaments/${id}`, { status })
      setTournaments(prev => prev.map(t => t.id === id ? { ...t, status } : t))
      setSuccess(`Tournament marked as ${status}`)
    } catch (e) { setError(e.response?.data?.message || 'Failed to update') }
  }

  const openReg = async (t) => {
    setRegModal(t); setRegLoading(true); setRegList([])
    try {
      const { data } = await axios.get(`${API_URL}/tournaments/${t.id}/registrations`)
      setRegList(data.data || [])
    } catch { setRegList([]) }
    finally { setRegLoading(false) }
  }

  const openFixtures = async (t) => {
    setFixModal(t); setFixLoading(true); setFixtures([])
    setFForm({ ...initFForm, tournament_id: t.id })
    try {
      const { data } = await axios.get(`${API_URL}/tournaments/${t.id}/fixtures`)
      setFixtures(data.data || [])
    } catch { setFixtures([]) }
    finally { setFixLoading(false) }
  }

  const createFixture = async (e) => {
    e.preventDefault(); setFSub(true)
    try {
      await axios.post(`${API_URL}/fixtures`, fForm)
      setSuccess('Fixture created')
      const { data } = await axios.get(`${API_URL}/tournaments/${fixModal.id}/fixtures`)
      setFixtures(data.data || [])
      setFForm({ ...initFForm, tournament_id: fixModal.id })
    } catch (e) { setError(e.response?.data?.message || 'Failed') }
    finally { setFSub(false) }
  }

  const updateResult = async (fId) => {
    const result = resultInput[fId]
    if (!result) { setError('Enter winner team name'); return }
    try {
      await axios.put(`${API_URL}/fixtures/${fId}`, { result })
      setSuccess('Result updated & points recalculated')
      const { data } = await axios.get(`${API_URL}/tournaments/${fixModal.id}/fixtures`)
      setFixtures(data.data || [])
    } catch (e) { setError(e.response?.data?.message || 'Failed') }
  }

  const openPoints = async (t) => {
    setPtModal(t); setPtLoading(true); setPoints([])
    try {
      const { data } = await axios.get(`${API_URL}/tournaments/${t.id}/points`)
      setPoints(data.data || [])
    } catch { setPoints([]) }
    finally { setPtLoading(false) }
  }

  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Tournament Management</h1>
            <p className="text-gray-500 text-sm">Create and manage cricket tournaments</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="flex items-center gap-1.5 text-sm text-[#1a5c2a] hover:underline font-medium">
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={() => { setTModal(true); setTFormErr('') }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm hover:opacity-90"
              style={{ backgroundColor: '#1a5c2a' }}>
              <Plus size={16} /> Add Tournament
            </button>
          </div>
        </div>

        {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {tournaments.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🏆</div><p>No tournaments yet</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      {['ID','Name','Date','Fee','Teams','Registrations','Status','Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tournaments.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-[#1a5c2a]">#{t.id}</td>
                        <td className="px-4 py-3 font-medium max-w-40">{t.name}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                        </td>
                        <td className="px-4 py-3">₹{t.entry_fee}</td>
                        <td className="px-4 py-3">{t.max_teams}</td>
                        <td className="px-4 py-3">{t.registrations_count}/{t.max_teams}</td>
                        <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            <button onClick={() => openReg(t)} className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200">
                              <Users size={11} className="inline mr-1" />Regs
                            </button>
                            <button onClick={() => openFixtures(t)} className="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200">
                              <Trophy size={11} className="inline mr-1" />Fixtures
                            </button>
                            <button onClick={() => openPoints(t)} className="px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 text-xs font-semibold hover:bg-yellow-200">
                              <List size={11} className="inline mr-1" />Points
                            </button>
                            {t.status === 'upcoming' && (
                              <button onClick={() => updateStatus(t.id, 'ongoing')} className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200">Start</button>
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

        {/* Add Tournament Modal */}
        <Modal isOpen={tModal} onClose={() => setTModal(false)} title="Add Tournament">
          {tFormErr && <Alert type="error" message={tFormErr} />}
          <form onSubmit={createTournament} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tournament Name *</label>
              <input value={tForm.name} onChange={e => setTForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Summer Cup 2026"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                <input type="date" value={tForm.date} min={today} onChange={e => setTForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Entry Fee (₹)</label>
                <input type="number" value={tForm.entry_fee} min={0} onChange={e => setTForm(f => ({ ...f, entry_fee: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Max Teams</label>
                <input type="number" value={tForm.max_teams} min={2} onChange={e => setTForm(f => ({ ...f, max_teams: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select value={tForm.status} onChange={e => setTForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a] bg-white">
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setTModal(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={tSubmitting} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#1a5c2a', flex: 2 }}>
                {tSubmitting ? <><Spinner size="sm" color="white" />Creating...</> : '+ Create Tournament'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Registrations Modal */}
        <Modal isOpen={!!regModal} onClose={() => setRegModal(null)} title={`Registrations — ${regModal?.name}`} maxWidth="max-w-2xl">
          {regLoading ? <div className="flex justify-center py-8"><Spinner /></div> : (
            regList.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No teams registered yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-gray-500 text-xs uppercase"><tr>
                  {['#','Team','Captain','Phone','Payment','Date'].map(h => <th key={h} className="text-left py-2 pr-4">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {regList.map((r, i) => (
                    <tr key={r.id}>
                      <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                      <td className="py-2 pr-4 font-medium">{r.team_name}</td>
                      <td className="py-2 pr-4">{r.captain_name}</td>
                      <td className="py-2 pr-4 text-gray-500">{r.phone}</td>
                      <td className="py-2 pr-4"><StatusBadge status={r.payment_status} /></td>
                      <td className="py-2 pr-4 text-gray-400">{new Date(r.registered_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </Modal>

        {/* Fixtures Modal */}
        <Modal isOpen={!!fixModal} onClose={() => setFixModal(null)} title={`Fixtures — ${fixModal?.name}`} maxWidth="max-w-2xl">
          {fixLoading ? <div className="flex justify-center py-8"><Spinner /></div> : (
            <>
              <form onSubmit={createFixture} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 pb-5 border-b border-gray-100">
                <input value={fForm.team1} onChange={e => setFForm(f => ({ ...f, team1: e.target.value }))} placeholder="Team 1"
                  className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2a]" />
                <input value={fForm.team2} onChange={e => setFForm(f => ({ ...f, team2: e.target.value }))} placeholder="Team 2"
                  className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2a]" />
                <input type="date" value={fForm.match_date} onChange={e => setFForm(f => ({ ...f, match_date: e.target.value }))}
                  className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2a]" />
                <button type="submit" disabled={fSubmitting} className="px-3 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#1a5c2a' }}>
                  {fSubmitting ? '...' : '+ Add'}
                </button>
              </form>
              <div className="space-y-3">
                {fixtures.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No fixtures added yet</p> :
                  fixtures.map(f => (
                    <div key={f.id} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="font-semibold text-sm flex-1">{f.team1} <span className="text-gray-400">vs</span> {f.team2}</span>
                      <StatusBadge status={f.status} />
                      {f.result && <span className="text-xs text-green-700 font-medium">Winner: {f.result}</span>}
                      {f.status !== 'completed' && (
                        <div className="flex gap-2">
                          <input value={resultInput[f.id] || ''} onChange={e => setResultInput(prev => ({ ...prev, [f.id]: e.target.value }))}
                            placeholder="Winner team name"
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none w-36" />
                          <button onClick={() => updateResult(f.id)}
                            className="px-3 py-1 rounded-lg text-white text-xs font-semibold hover:opacity-90"
                            style={{ backgroundColor: '#16a34a' }}>Set Result</button>
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>
            </>
          )}
        </Modal>

        {/* Points Table Modal */}
        <Modal isOpen={!!ptModal} onClose={() => setPtModal(null)} title={`Points Table — ${ptModal?.name}`} maxWidth="max-w-xl">
          {ptLoading ? <div className="flex justify-center py-8"><Spinner /></div> : (
            points.length === 0 ? <p className="text-center text-gray-400 py-8">No points recorded yet</p> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>{['#','Team','P','W','L','Pts'].map(h => <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {points.map((p, i) => (
                    <tr key={p.id} className={i === 0 ? 'bg-yellow-50' : ''}>
                      <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2.5 font-semibold">{p.team_name}</td>
                      <td className="px-3 py-2.5 text-gray-500">{p.played}</td>
                      <td className="px-3 py-2.5 text-green-600">{p.won}</td>
                      <td className="px-3 py-2.5 text-red-500">{p.lost}</td>
                      <td className="px-3 py-2.5 font-extrabold text-[#1a5c2a]">{p.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </Modal>
      </main>
    </div>
  )
}
