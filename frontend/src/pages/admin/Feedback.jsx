import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import AdminSidebar from '../../components/AdminSidebar'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import { API_URL } from '../../config'

function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`text-sm sm:text-base ${i < rating ? 'text-secondary font-bold' : 'text-white/5'}`}>★</span>
      ))}
    </div>
  )
}

export default function AdminFeedback() {
  const [feedbackData, setFeedbackData] = useState({ feedback: [], average_rating: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')

  useEffect(() => {
    axios.get(`${API_URL}/feedback`)
      .then(r => setFeedbackData(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load feedback'))
      .finally(() => setLoading(false))
  }, [])

  const { feedback, average_rating } = feedbackData

  const filtered = useMemo(() => {
    if (!ratingFilter) return feedback
    return feedback.filter(f => f.rating === parseInt(ratingFilter))
  }, [feedback, ratingFilter])

  const avg = parseFloat(average_rating) || 0

  return (
    <div className="flex min-h-screen bg-brand-dark text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">

        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-6 mb-8">
          <div>
            <h1 className="font-display text-4xl text-white tracking-wide uppercase">CUSTOMER FEEDBACK</h1>
            <p className="font-sans text-xs text-brand-greyMedium uppercase mt-1">{feedback.length} total reviews collected</p>
          </div>
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>

            <div className="bg-brand-card border border-white/5 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
              <div className="text-center md:border-r border-white/5 md:pr-8 md:min-w-[150px]">
                <p className="font-display text-6xl text-primary leading-none mb-1">{avg.toFixed(1)}</p>
                <div className="flex justify-center mb-2">
                  <StarRating rating={Math.round(avg)} />
                </div>
                <p className="font-accent text-[10px] text-brand-greyMedium tracking-wider uppercase">Average Rating</p>
              </div>

              <div className="flex-1 w-full space-y-2.5">
                {[5, 4, 3, 2, 1].map(n => {
                  const count = feedback.filter(f => f.rating === n).length
                  const pct = feedback.length > 0 ? (count / feedback.length) * 100 : 0
                  return (
                    <div key={n} className="flex items-center gap-3">
                      <span className="font-accent text-[10px] text-brand-greyMedium w-4 font-bold">{n}★</span>
                      <div className="flex-1 bg-brand-greyDark rounded-full h-2 overflow-hidden border border-white/5">
                        <div
                          className="h-2 rounded-full bg-secondary transition-all"
                          style={{ width: `${pct}%`, boxShadow: '0 0 8px rgba(255,215,0,0.3)' }}
                        />
                      </div>
                      <span className="font-sans text-[10px] text-brand-greyMedium w-6 text-right font-medium">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-brand-card border border-white/5 rounded-2xl p-4 mb-6 flex flex-wrap gap-2.5 shadow-xl">
              {['', '5', '4', '3', '2', '1'].map(r => (
                <button
                  key={r}
                  onClick={() => setRatingFilter(r)}
                  className={`px-4 py-2 rounded-xl font-heading font-extrabold text-[11px] tracking-wider transition-all cursor-pointer uppercase border
                    ${ratingFilter === r 
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white border-primary shadow-[0_4px_12px_rgba(0,200,83,0.2)]' 
                      : 'bg-brand-greyDark/50 text-brand-greyMedium border-white/10 hover:border-white/20 hover:text-white'}`}
                >
                  {r ? `${r} ★` : 'All Reviews'}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-brand-card border border-white/5 rounded-2xl">
                <div className="text-6xl mb-4 animate-float-slow">💬</div>
                <h3 className="font-heading font-black text-sm text-white uppercase">No Feedback Found</h3>
                <p className="font-sans text-xs text-brand-greyMedium mt-1">
                  {ratingFilter ? `No reviews fit the ${ratingFilter}★ filter criteria.` : 'No comments received.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map(f => (
                  <div key={f.id} className="bg-brand-card border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="font-heading font-black text-xs text-white uppercase">{f.customer_name}</p>
                          <p className="font-sans text-[10px] text-brand-greyMedium mt-0.5">
                            {f.phone} • Booking #{f.booking_id}
                          </p>
                        </div>
                        <StarRating rating={f.rating} />
                      </div>

                      {f.comment && (
                        <p className="font-sans text-xs text-white/80 leading-relaxed bg-brand-greyDark/60 border border-white/5 rounded-xl p-3.5 italic">
                          "{f.comment}"
                        </p>
                      )}
                    </div>

                    <p className="font-accent text-[9px] text-brand-greyMedium tracking-wider uppercase mt-4">
                      Submitted on: {new Date(f.submitted_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
