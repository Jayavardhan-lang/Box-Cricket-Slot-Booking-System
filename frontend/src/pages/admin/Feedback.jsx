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
        <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  )
}

export default function AdminFeedback() {
  const [feedbackData, setFeedbackData] = useState({ feedback: [], average_rating: 0 })
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
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
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Customer Feedback</h1>
          <p className="text-gray-500 text-sm">{feedback.length} total reviews</p>
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Average Rating */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-wrap items-center gap-6">
              <div className="text-center">
                <p className="text-6xl font-extrabold text-[#1a5c2a]">{avg.toFixed(1)}</p>
                <StarRating rating={Math.round(avg)} />
                <p className="text-gray-400 text-xs mt-1">Average Rating</p>
              </div>
              <div className="flex-1 space-y-2 min-w-48">
                {[5, 4, 3, 2, 1].map(n => {
                  const count = feedback.filter(f => f.rating === n).length
                  const pct   = feedback.length > 0 ? (count / feedback.length) * 100 : 0
                  return (
                    <div key={n} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-4">{n}★</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full bg-yellow-400 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-6">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-wrap gap-2">
              {['', '5', '4', '3', '2', '1'].map(r => (
                <button key={r}
                  onClick={() => setRatingFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors
                    ${ratingFilter === r ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  style={ratingFilter === r ? { backgroundColor: '#1a5c2a' } : {}}>
                  {r ? `${r}★` : 'All'}
                </button>
              ))}
            </div>

            {/* Feedback Cards */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">💬</div>
                <p>No feedback {ratingFilter ? `with ${ratingFilter}★ rating` : 'yet'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(f => (
                  <div key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-[#1a1a1a]">{f.customer_name}</p>
                        <p className="text-gray-400 text-xs">{f.phone} · Booking #{f.booking_id}</p>
                      </div>
                      <StarRating rating={f.rating} />
                    </div>
                    {f.comment && (
                      <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl p-3">{f.comment}</p>
                    )}
                    <p className="text-gray-300 text-xs mt-3">
                      {new Date(f.submitted_at).toLocaleString('en-IN')}
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
