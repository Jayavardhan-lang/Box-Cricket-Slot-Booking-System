import { useState } from 'react'
import axios from 'axios'
import { CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { API_URL } from '../config'

const plans = [
  {
    key: 'basic',
    name: 'Basic',
    price: 999,
    badge: null,
    borderColor: '#16a34a',
    bgClass: 'bg-white',
    textClass: 'text-[#1a1a1a]',
    btnClass: 'bg-[#1a5c2a] text-white hover:bg-[#134520]',
    features: ['4 free slots per month', 'Priority booking', '10% member discount'],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 1999,
    badge: 'POPULAR',
    borderColor: '#f5a623',
    bgClass: 'bg-white',
    textClass: 'text-[#1a1a1a]',
    btnClass: 'bg-[#f5a623] text-white hover:bg-[#d4891a]',
    features: ['10 free slots per month', 'Priority booking', '20% member discount', 'Tournament fee waiver'],
  },
  {
    key: 'corporate',
    name: 'Corporate',
    price: 4999,
    badge: null,
    borderColor: '#1a5c2a',
    bgClass: 'bg-[#1a5c2a]',
    textClass: 'text-white',
    btnClass: 'bg-white text-[#1a5c2a] hover:bg-gray-100',
    features: ['Unlimited slots', 'Dedicated account manager', 'Custom tournaments', '30% member discount'],
  },
]

const initForm = { name: '', phone: '', email: '', plan_name: 'basic' }

export default function Membership() {
  const [modalPlan, setModalPlan] = useState(null)
  const [form, setForm]           = useState(initForm)
  const [errors, setErrors]       = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]     = useState('')
  const [submitError, setSubmitError] = useState('')

  const openModal = (plan) => {
    setModalPlan(plan)
    setForm({ ...initForm, plan_name: plan.key })
    setErrors({}); setSubmitError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim() || form.name.trim().length < 3) errs.name = 'Name must be at least 3 characters'
    if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true); setSubmitError('')
    try {
      const { data } = await axios.post(`${API_URL}/memberships`, form)
      setSuccess(`🎉 ${modalPlan.name} membership activated! Valid for 30 days. ID: #${data.data.membershipId}`)
      setModalPlan(null)
    } catch (e) {
      setSubmitError(e.response?.data?.message || 'Failed to create membership')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })) },
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-3">Choose Your Membership Plan</h1>
          <p className="text-gray-500 text-lg">Save more, play more. Cancel anytime.</p>
        </div>

        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={6000} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={plan.key}
              style={{ borderColor: plan.borderColor }}
              className={`relative rounded-2xl border-2 shadow-lg overflow-hidden flex flex-col
                ${plan.bgClass} ${i === 1 ? 'md:-mt-4 md:mb-4 md:shadow-2xl scale-100 md:scale-105' : ''}`}
            >
              {plan.badge && (
                <div className="absolute top-4 right-4 bg-[#f5a623] text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <div className="p-7 flex-1">
                <h2 className={`text-xl font-bold mb-2 ${plan.textClass}`}>{plan.name}</h2>
                <div className={`flex items-baseline gap-1 mb-6 ${plan.textClass}`}>
                  <span className="text-4xl font-extrabold">₹{plan.price.toLocaleString()}</span>
                  <span className="text-sm opacity-70">/month</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5">
                      <CheckCircle size={16} className="text-[#16a34a] shrink-0 mt-0.5" />
                      <span className={`text-sm ${plan.bgClass === 'bg-[#1a5c2a]' ? 'text-white/80' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 pt-0">
                <button
                  id={`membership-${plan.key}`}
                  onClick={() => openModal(plan)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 ${plan.btnClass}`}
                >
                  Get Started →
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">
          All plans include a 30-day membership. No auto-renewal. Prices are inclusive of taxes.
        </p>
      </main>

      {/* Membership Form Modal */}
      <Modal isOpen={!!modalPlan} onClose={() => setModalPlan(null)} title={`${modalPlan?.name} Membership — ₹${modalPlan?.price}/mo`}>
        {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
            <input {...field('name')} placeholder="Your full name"
              className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
                ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
            <input {...field('phone')} placeholder="10-digit mobile number" maxLength={10}
              className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors
                ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#1a5c2a]'}`} />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-gray-400">(optional)</span></label>
            <input {...field('email')} type="email" placeholder="your@email.com"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a5c2a] transition-colors" />
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            ✅ Plan: <strong>{modalPlan?.name}</strong> | 
            ✅ Duration: <strong>30 days</strong> | 
            ✅ Amount: <strong>₹{modalPlan?.price}</strong>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalPlan(null)}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#1a5c2a', flex: 2 }}>
              {submitting ? <><Spinner size="sm" color="white" /> Processing...</> : '✅ Activate Membership'}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  )
}
