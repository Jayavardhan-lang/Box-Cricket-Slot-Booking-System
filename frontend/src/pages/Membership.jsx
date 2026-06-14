import { useState } from 'react'
import axios from 'axios'
import { CheckCircle, Award, Sparkles, Building } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { API_URL } from '../config'

const plans = [
  {
    key: 'basic',
    name: 'BASIC CLUB',
    price: 999,
    badge: null,
    borderClass: 'border-white/10 hover:border-primary/50',
    bgClass: 'bg-brand-card',
    textClass: 'text-white',
    priceColorClass: 'text-primary',
    btnClass: 'border border-primary text-primary hover:bg-primary hover:text-white',
    features: ['4 free slots per month', 'Priority booking (2 days advance)', '10% member discount on extra slots'],
  },
  {
    key: 'premium',
    name: 'PREMIUM SQUAD',
    price: 1999,
    badge: '⚡ MOST POPULAR',
    borderClass: 'border-primary shadow-[0_0_35px_rgba(0,200,83,0.25)]',
    bgClass: 'bg-gradient-to-b from-[#0d3320] to-[#111111]',
    textClass: 'text-white',
    priceColorClass: 'text-secondary gold-shimmer-text',
    btnClass: 'bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white shadow-[0_4px_12px_rgba(0,200,83,0.3)]',
    features: ['10 free slots per month', 'Priority booking (5 days advance)', '20% member discount on extra slots', 'Tournament entry fee waiver (1 per month)'],
  },
  {
    key: 'corporate',
    name: 'CORPORATE LEAGUE',
    price: 4999,
    badge: '🏆 GOLD STANDARD',
    borderClass: 'border-secondary/30 hover:border-secondary',
    bgClass: 'bg-gradient-to-b from-[#1a1200] to-[#111111]',
    textClass: 'text-white',
    priceColorClass: 'text-secondary',
    btnClass: 'bg-gradient-to-r from-secondary to-secondary-dark text-black font-extrabold shadow-[0_4px_12px_rgba(255,215,0,0.25)]',
    features: ['Unlimited monthly play hours', 'Dedicated event account manager', '1 custom corporate tournament/mo', '30% discount on ground banners'],
  },
]

const initForm = { name: '', phone: '', email: '', plan_name: 'basic' }

export default function Membership() {
  const [modalPlan, setModalPlan] = useState(null)
  const [form, setForm] = useState(initForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [submitError, setSubmitError] = useState('')

  const openModal = (plan) => {
    setModalPlan(plan)
    setForm({ ...initForm, plan_name: plan.key })
    setErrors({})
    setSubmitError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim() || form.name.trim().length < 3) {
      errs.name = 'Name must be at least 3 characters'
    }
    if (!/^\d{10}$/.test(form.phone)) {
      errs.phone = 'Enter a valid 10-digit phone number'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const { data } = await axios.post(`${API_URL}/memberships`, form)
      setSuccess(`🎉 ${modalPlan.name} membership activated successfully! Valid for 30 days. Membership ID: #${data.data.membershipId}`)
      setModalPlan(null)
    } catch (e) {
      setSubmitError(e.response?.data?.message || 'Failed to create membership')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      setErrors(er => ({ ...er, [key]: '' }))
    },
  })

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-white pt-[70px]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-16">
        
        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="font-accent text-secondary tracking-[3px] text-xs font-bold uppercase block mb-2">
            ⚡ EXCLUSIVE BENEFITS
          </span>
          <h1 className="font-display text-5xl sm:text-7xl text-white tracking-tight uppercase leading-none">
            CHOOSE YOUR PLAN
          </h1>
          <div className="w-16 h-1 bg-primary mt-3 mb-4 rounded-full" />
          <p className="font-sans text-sm text-brand-greyMedium max-w-md">
            Save more, book in advance, and play on professional terms. Upgrade your cricket experience today.
          </p>
        </div>

        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={6000} />}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
          {plans.map((plan, i) => {
            const isPremium = plan.key === 'premium'
            return (
              <div
                key={plan.key}
                className={`relative rounded-3xl border-2 ${plan.borderClass} ${plan.bgClass} overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2
                  ${isPremium ? 'md:-mt-4 md:mb-4 scale-100 md:scale-[1.03] z-10' : ''}`}
              >
                {/* Popular / Standard Badge */}
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-secondary to-secondary-dark text-black font-accent font-black text-[9px] tracking-widest px-3 py-1.5 rounded-full uppercase">
                    {plan.badge}
                  </div>
                )}

                <div className="p-8 flex-1 flex flex-col">
                  {/* Icon Representation */}
                  <div className="mb-6">
                    {plan.key === 'basic' && <Award className="text-primary" size={36} />}
                    {plan.key === 'premium' && <Sparkles className="text-secondary" size={36} />}
                    {plan.key === 'corporate' && <Building className="text-secondary" size={36} />}
                  </div>

                  <h2 className="font-heading font-black text-xl text-white tracking-wide uppercase mb-3">{plan.name}</h2>
                  
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className={`font-display text-5xl sm:text-6xl ${plan.priceColorClass}`}>₹{plan.price.toLocaleString()}</span>
                    <span className="font-sans text-xs text-brand-greyMedium lowercase">/month</span>
                  </div>

                  <div className="w-full h-[1px] bg-white/5 mb-6" />

                  <ul className="space-y-4 flex-1">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3">
                        <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                        <span className="font-sans text-xs text-white/85 leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 pt-0">
                  <button
                    id={`membership-${plan.key}`}
                    onClick={() => openModal(plan)}
                    className={`w-full py-3.5 rounded-xl font-heading font-extrabold text-[12px] tracking-wider transition-all cursor-pointer uppercase ${plan.btnClass}`}
                  >
                    GET STARTED
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center font-sans text-xs text-brand-greyMedium mt-12 max-w-sm mx-auto leading-relaxed opacity-60">
          * Memberships are active for 30 days starting from date of payment. No automatic renewals. Prices include utility taxes.
        </p>
      </main>

      {/* Activation Form Modal */}
      <Modal isOpen={!!modalPlan} onClose={() => setModalPlan(null)} title="MEMBERSHIP SUBSCRIPTION">
        {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}
        
        {modalPlan && (
          <div className="bg-primary/5 border border-primary/25 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-accent text-[10px] text-secondary tracking-widest uppercase font-bold">MEMBERSHIP PLAN</p>
              <h4 className="font-display text-2xl text-white mt-1 uppercase">
                {modalPlan.name}
              </h4>
              <p className="font-sans text-xs text-white/50 mt-0.5">
                📅 Plan Validity: 30 days
              </p>
            </div>
            <div className="flex items-center text-3xl font-display text-primary">
              <IndianRupee size={22} className="text-primary mt-1" />
              <span>{parseInt(modalPlan.price)}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
              FULL NAME *
            </label>
            <input
              {...field('name')}
              placeholder="Your full name"
              className={`w-full bg-brand-greyDark border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all
                ${errors.name ? 'border-error/55 focus:ring-error/50 bg-error/5' : 'border-white/10 focus:border-primary focus:ring-primary/50'}`}
            />
            {errors.name && <p className="text-error text-xs mt-1 font-sans">{errors.name}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
              PHONE NUMBER *
            </label>
            <input
              {...field('phone')}
              placeholder="10-digit mobile number"
              maxLength={10}
              className={`w-full bg-brand-greyDark border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all
                ${errors.phone ? 'border-error/55 focus:ring-error/50 bg-error/5' : 'border-white/10 focus:border-primary focus:ring-primary/50'}`}
            />
            {errors.phone && <p className="text-error text-xs mt-1 font-sans">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block font-accent text-xs font-bold text-secondary tracking-[1.5px] uppercase mb-1.5">
              EMAIL ADDRESS
            </label>
            <input
              {...field('email')}
              type="email"
              placeholder="your@email.com"
              className="w-full bg-brand-greyDark border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
            />
          </div>

          {/* Action Row */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setModalPlan(null)}
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
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>💳 Activate Membership</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  )
}
