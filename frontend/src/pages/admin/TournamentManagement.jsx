import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, RefreshCw, Users, Trophy, List, CalendarDays, IndianRupee } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tModal, setTModal] = useState(false)
  const [tForm, setTForm] = useState(initTForm)
  const [tSubmitting, setTSub] = useState(false)
  const [tFormErr, setTFormErr] = useState('')

  // Sub-modals
  const [regModal, setRegModal] = useState(null)
  const [regList, setRegList] = useState([])
  const [regLoading, setRegLoading] = useState(false)
  const [fixModal, setFixModal] = useState(null)
  const [fixtures, setFixtures] = useState([])
  const [fixLoading, setFixLoading] = useState(false)
  const [fForm, setFForm] = useState(initFForm)
  const [fSubmitting, setFSub] = useState(false)
  const [ptModal, setPtModal] = useState(null)
  const [points, setPoints] = useState([])
  const [ptLoading, setPtLoading] = useState(false)
  const [resultInput, setResultInput] = useState({})

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`${API_URL}/tournaments`)
      setTournaments(data.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load tournaments')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const createTournament = async (e) => {
    e.preventDefault()
    if (!tForm.name) {
      setTFormErr('Name is required')
      return
    }
    setTSub(true)
    setTFormErr('')
    try {
      await axios.post(`${API_URL}/tournaments`, tForm)
      setSuccess('Tournament created')
      setTModal(false)
      setTForm(initTForm)
      load()
    } catch (e) {
      setTFormErr(e.response?.data?.message || 'Failed')
    } finally {
      setTSub(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/tournaments/${id}`, { status })
      setTournaments(prev => prev.map(t => t.id === id ? { ...t, status } : t))
      setSuccess(`Tournament marked as ${status}`)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update')
    }
  }

  const openReg = async (t) => {
    setRegModal(t)
    setRegLoading(true)
    setRegList([])
    try {
      const { data } = await axios.get(`${API_URL}/tournaments/${t.id}/registrations`)
      setRegList(data.data || [])
    } catch {
      setRegList([])
    } finally {
      setRegLoading(false)
    }
  }

  const openFixtures = async (t) => {
    setFixModal(t)
    setFixLoading(true)
    setFixtures([])
    setFForm({ ...initFForm, tournament_id: t.id })
    try {
      const { data } = await axios.get(`${API_URL}/tournaments/${t.id}/fixtures`)
      setFixtures(data.data || [])
    } catch {
      setFixtures([])
    } finally {
      setFixLoading(false)
    }
  }

  const createFixture = async (e) => {
    e.preventDefault()
    setFSub(true)
    try {
      await axios.post(`${API_URL}/fixtures`, fForm)
      setSuccess('Fixture created')
      const { data } = await axios.get(`${API_URL}/tournaments/${fixModal.id}/fixtures`)
      setFixtures(data.data || [])
      setFForm({ ...initFForm, tournament_id: fixModal.id })
    } catch (e) {
      setError(e.response?.data?.message || 'Failed')
    } finally {
      setFSub(false)
    }
  }

  const updateResult = async (fId) => {
    const result = resultInput[fId]
    if (!result) {
      setError('Enter winner team name')
      return
    }
    try {
      await axios.put(`${API_URL}/fixtures/${fId}`, { result })
      setSuccess('Result updated & points recalculated')
      const { data } = await axios.get(`${API_URL}/tournaments/${fixModal.id}/fixtures`)
      setFixtures(data.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed')
    }
  }

  const openPoints = async (t) => {
    setPtModal(t)
    setPtLoading(true)
    setPoints([])
    try {
      const { data } = await axios.get(`${API_URL}/tournaments/${t.id}/points`)
      setPoints(data.data || [])
    } catch {
      setPoints([])
    } finally {
      setPtLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-dark text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-6 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white tracking-wide uppercase">TOURNAMENT CONTROL</h1>
            <p className="font-sans text-xs text-brand-greyMedium uppercase mt-1">Configure leagues, brackets, and track standings</p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={load}
              className="flex items-center gap-1.5 font-heading font-extrabold text-[10px] text-brand-greyMedium hover:text-white uppercase tracking-wider cursor-pointer"
            >
              <RefreshCw size={10} />
              <span>REFRESH</span>
            </button>
            <button
              onClick={() => { setTModal(true); setTFormErr('') }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-heading font-bold text-[12px] tracking-wider rounded-xl hover:scale-105 transition-all shadow-[0_4px_12px_rgba(0,200,83,0.2)] cursor-pointer uppercase"
            >
              <Plus size={14} />
              <span>Add Tournament</span>
            </button>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            {tournaments.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 animate-float-slow">🏆</div>
                <h3 className="font-heading font-black text-sm text-white uppercase">No Tournaments Listed</h3>
                <p className="font-sans text-xs text-brand-greyMedium mt-1">Get started by creating your first tournament.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-brand-greyDark/40 text-brand-greyMedium text-[10px] font-accent font-bold tracking-widest uppercase border-b border-white/5">
                    <tr>
                      {['ID', 'Name', 'Date', 'Fee', 'Teams', 'Registrations', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-sans text-white/95">
                    {tournaments.map(t => (
                      <tr key={t.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-primary">#{t.id}</td>
                        <td className="px-6 py-4 font-semibold uppercase">{t.name}</td>
                        <td className="px-6 py-4 text-brand-greyMedium whitespace-nowrap font-medium">
                          {new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">₹{parseInt(t.entry_fee)}</td>
                        <td className="px-6 py-4 text-brand-greyMedium font-medium">{t.max_teams}</td>
                        <td className="px-6 py-4 font-semibold text-white">{t.registrations_count} / {t.max_teams}</td>
                        <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap min-w-[200px]">
                            <button
                              onClick={() => openReg(t)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/85 hover:bg-primary/20 hover:text-primary transition-all font-heading font-extrabold tracking-wider text-[11px] uppercase cursor-pointer"
                            >
                              <Users size={11} className="inline mr-1" />
                              <span>Regs</span>
                            </button>
                            <button
                              onClick={() => openFixtures(t)}
                              className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all font-heading font-extrabold tracking-wider text-[11px] uppercase cursor-pointer"
                            >
                              <Trophy size={11} className="inline mr-1" />
                              <span>Fixtures</span>
                            </button>
                            <button
                              onClick={() => openPoints(t)}
                              className="px-3 py-1.5 rounded-lg bg-secondary/15 border border-secondary/20 text-secondary hover:bg-secondary hover:text-black transition-all font-heading font-extrabold tracking-wider text-[11px] uppercase cursor-pointer"
                            >
                              <List size={11} className="inline mr-1" />
                              <span>Standings</span>
                            </button>
                            {t.status === 'upcoming' && (
                              <button
                                onClick={() => updateStatus(t.id, 'ongoing')}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-[11px] tracking-wider uppercase cursor-pointer"
                              >
                                Start
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

        {/* Add Tournament Modal */}
        <Modal isOpen={tModal} onClose={() => setTModal(false)} title="Create League Tournament">
          {tFormErr && <Alert type="error" message={tFormErr} />}
          <form onSubmit={createTournament} className="space-y-4">
            <div>
              <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                TOURNAMENT NAME *
              </label>
              <input
                value={tForm.name}
                onChange={e => setTForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Summer Cup 2026"
                className="w-full bg-brand-greyDark/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-sans"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                  START DATE *
                </label>
                <input
                  type="date"
                  value={tForm.date}
                  min={today}
                  onChange={e => setTForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-brand-greyDark/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer font-sans"
                />
              </div>
              <div>
                <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                  ENTRY FEE (₹) *
                </label>
                <input
                  type="number"
                  value={tForm.entry_fee}
                  min={0}
                  onChange={e => setTForm(f => ({ ...f, entry_fee: e.target.value }))}
                  className="w-full bg-brand-greyDark/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                  MAX TEAMS
                </label>
                <input
                  type="number"
                  value={tForm.max_teams}
                  min={2}
                  onChange={e => setTForm(f => ({ ...f, max_teams: e.target.value }))}
                  className="w-full bg-brand-greyDark/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-sans"
                />
              </div>
              <div>
                <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
                  LEAGUE STATUS
                </label>
                <select
                  value={tForm.status}
                  onChange={e => setTForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setTModal(false)}
                className="flex-1 py-3.5 border border-white/10 text-white hover:bg-white/5 font-heading font-extrabold text-[12px] tracking-wider rounded-xl transition-all cursor-pointer uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={tSubmitting}
                className="flex-[2] py-3.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-heading font-extrabold text-[12px] tracking-wider rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,200,83,0.3)] cursor-pointer uppercase"
              >
                {tSubmitting ? (
                  <>
                    <Spinner size="sm" color="white" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>+ Create Tournament</span>
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Registrations Modal */}
        <Modal isOpen={!!regModal} onClose={() => setRegModal(null)} title={`REGISTRATIONS — ${regModal?.name}`} maxWidth="max-w-2xl">
          {regLoading ? <div className="flex justify-center py-8"><Spinner /></div> : (
            regList.length === 0 ? (
              <p className="text-center text-brand-greyMedium py-8 text-xs font-sans">No teams registered for this league yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-brand-greyDark/40 text-brand-greyMedium text-[10px] font-accent font-bold tracking-widest uppercase border-b border-white/5">
                    <tr>
                      {['#', 'Team', 'Captain', 'Phone', 'Payment', 'Date'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-sans text-white/90">
                    {regList.map((r, i) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 text-brand-greyMedium">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-white uppercase">{r.team_name}</td>
                        <td className="px-4 py-3">{r.captain_name}</td>
                        <td className="px-4 py-3 text-brand-greyMedium">{r.phone}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.payment_status} /></td>
                        <td className="px-4 py-3 text-brand-greyMedium">{new Date(r.registered_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </Modal>

        {/* Fixtures Modal */}
        <Modal isOpen={!!fixModal} onClose={() => setFixModal(null)} title={`BRACKET FIXTURES — ${fixModal?.name}`} maxWidth="max-w-2xl">
          {fixLoading ? <div className="flex justify-center py-8"><Spinner /></div> : (
            <>
              {/* Fixture Add Form */}
              <form onSubmit={createFixture} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 pb-6 border-b border-white/5">
                <input
                  value={fForm.team1}
                  onChange={e => setFForm(f => ({ ...f, team1: e.target.value }))}
                  placeholder="Team A Name"
                  className="bg-brand-greyDark/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-primary transition-all font-sans"
                />
                <input
                  value={fForm.team2}
                  onChange={e => setFForm(f => ({ ...f, team2: e.target.value }))}
                  placeholder="Team B Name"
                  className="bg-brand-greyDark/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-primary transition-all font-sans"
                />
                <input
                  type="date"
                  value={fForm.match_date}
                  onChange={e => setFForm(f => ({ ...f, match_date: e.target.value }))}
                  className="bg-brand-greyDark/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-all font-sans"
                />
                <button
                  type="submit"
                  disabled={fSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-heading font-extrabold text-[12px] tracking-wider uppercase shadow-[0_4px_12px_rgba(0,200,83,0.2)] cursor-pointer disabled:opacity-50"
                >
                  {fSubmitting ? '...' : '+ Add Match'}
                </button>
              </form>

              {/* Fixtures List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {fixtures.length === 0 ? (
                  <p className="text-brand-greyMedium text-xs text-center py-6 font-sans">No matches scheduled for this tournament yet.</p>
                ) : (
                  fixtures.map(f => (
                    <div key={f.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-brand-greyDark border border-white/5 rounded-2xl">
                      <div className="flex-1 min-w-[200px]">
                        <span className="font-heading font-extrabold text-xs text-white uppercase">{f.team1}</span>
                        <span className="text-secondary font-display px-2 text-sm">VS</span>
                        <span className="font-heading font-extrabold text-xs text-white uppercase">{f.team2}</span>
                        <p className="text-[10px] text-brand-greyMedium font-sans mt-1">
                          📅 {new Date(f.match_date).toLocaleDateString('en-IN')} @ {f.match_time || 'TBA'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusBadge status={f.status} />
                        {f.result && (
                          <span className="text-[11px] text-[#00e676] font-heading font-extrabold tracking-wide uppercase bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                            🏆 Winner: {f.result}
                          </span>
                        )}
                        {f.status !== 'completed' && (
                          <div className="flex gap-2">
                            <input
                              value={resultInput[f.id] || ''}
                              onChange={e => setResultInput(prev => ({ ...prev, [f.id]: e.target.value }))}
                              placeholder="Winner Team"
                              className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none w-32 focus:border-primary font-sans"
                            />
                            <button
                              onClick={() => updateResult(f.id)}
                              className="px-3 py-1 bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-bold text-[10px] tracking-wider rounded-lg cursor-pointer uppercase shadow-md"
                            >
                              Set Winner
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </Modal>

        {/* Points Table Modal */}
        <Modal isOpen={!!ptModal} onClose={() => setPtModal(null)} title={`LEAGUE STANDINGS — ${ptModal?.name}`} maxWidth="max-w-xl">
          {ptLoading ? <div className="flex justify-center py-8"><Spinner /></div> : (
            points.length === 0 ? (
              <p className="text-center text-brand-greyMedium py-8 text-xs font-sans">No points statistics computed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-brand-greyDark/40 text-brand-greyMedium text-[10px] font-accent font-bold tracking-widest uppercase border-b border-white/5">
                    <tr>
                      {['#', 'Team', 'P', 'W', 'L', 'Pts'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-sans text-white/95">
                    {points.map((p, i) => (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          i === 0 ? 'bg-secondary/15 text-secondary border-b border-secondary/30' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="px-4 py-3.5 text-brand-greyMedium font-bold">{i + 1}</td>
                        <td className="px-4 py-3.5 font-bold uppercase tracking-wide">{p.team_name}</td>
                        <td className="px-4 py-3.5 font-medium">{p.played}</td>
                        <td className="px-4 py-3.5 text-[#00e676] font-bold">{p.won}</td>
                        <td className="px-4 py-3.5 text-error font-bold">{p.lost}</td>
                        <td className="px-4 py-3.5 font-black text-secondary text-sm">{p.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </Modal>
      </main>
    </div>
  )
}
