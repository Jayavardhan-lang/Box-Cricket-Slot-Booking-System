import { useState, useRef, useEffect } from 'react'
import { Send, Bot, Phone, Mail, Clock, ShieldCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const BOT_RESPONSES = [
  {
    keywords: ['book', 'how to book', 'booking'],
    reply: "To book a slot, visit the Book Slot page, pick a date and available slot, fill the form and confirm. You'll get a Booking ID instantly! 🎉",
  },
  {
    keywords: ['timing', 'timings', 'hours', 'time', 'open'],
    reply: 'Slots available 6AM–9PM daily. Morning 6AM–10AM, Evening 4PM–9PM 🕐',
  },
  {
    keywords: ['price', 'cost', 'charge', 'fee', 'rate', 'pricing'],
    reply: 'Morning (6–10AM): ₹800–1000 | Evening (4–6PM): ₹1200 | Night (6–9PM): ₹1500 💰',
  },
  {
    keywords: ['cancel', 'cancellation', 'refund'],
    reply: 'Cancel from My Bookings page. Enter your phone number, find your booking, click Cancel. Only pending bookings can be cancelled.',
  },
  {
    keywords: ['tournament', 'tournaments', 'compete', 'register'],
    reply: 'We have exciting upcoming tournaments! Visit Tournaments page to register your team 🏆',
  },
  {
    keywords: ['membership', 'plan', 'subscribe', 'member'],
    reply: 'Plans: Basic ₹999, Premium ₹1999, Corporate ₹4999/month. Visit Membership page! 👥',
  },
  {
    keywords: ['contact', 'whatsapp', 'phone', 'help', 'support', 'call'],
    reply: '📱 WhatsApp: +91-9876543210 | 📞 Call: +91-9876543210 | Open 6AM–9PM daily',
  },
]

const quickReplies = ['How to book?', 'Timings', 'Pricing', 'Cancel Booking', 'Contact Us']

const getReply = (text) => {
  const lower = text.toLowerCase()
  for (const r of BOT_RESPONSES) {
    if (r.keywords.some(k => lower.includes(k))) return r.reply
  }
  return "I didn't understand that. Please contact us: WhatsApp +91-9876543210 😊"
}

const initMessages = [{ from: 'bot', text: "Hi! I'm Eagle Assistant 🏏 How can I help you today?" }]

export default function FAQ() {
  const [messages, setMessages] = useState(initMessages)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text) => {
    const userMsg = text.trim()
    if (!userMsg) return
    const reply = getReply(userMsg)
    setMessages(prev => [
      ...prev,
      { from: 'user', text: userMsg },
      { from: 'bot', text: reply },
    ])
    setInput('')
  }

  const faqs = [
    { q: 'How do I book a slot?', a: 'Visit Book a Slot, select a date, choose an available time slot, fill in your details, and confirm. You get an instant Booking ID!' },
    { q: 'What are the slot timings?', a: 'We offer slots from 6:00 AM to 9:00 PM daily. Morning slots (6–10 AM), Evening slots (4–9 PM).' },
    { q: 'Can I cancel my booking?', a: 'Yes! Go to My Bookings, enter your phone number, find your booking, and click Cancel. Only pending bookings can be cancelled.' },
    { q: 'How many players can play?', a: 'Each slot supports 6 to 22 players. Box cricket is typically played with 6 or 8 players per side.' },
    { q: 'Is there a membership plan?', a: 'Yes! We offer Basic (₹999), Premium (₹1999), and Corporate (₹4999) monthly plans with discounts and free slots.' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-white pt-[70px]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-16">

        <div className="mb-12 text-center md:text-left flex flex-col items-center md:items-start">
          <span className="font-accent text-secondary tracking-[3px] text-xs font-bold uppercase block mb-2">
            ⚡ SUPPORT
          </span>
          <h1 className="font-display text-5xl sm:text-6xl text-white tracking-tight uppercase leading-none">
            FAQ & HELP CENTER
          </h1>
          <div className="w-16 h-1 bg-primary mt-3 mb-4 rounded-full" />
          <p className="font-sans text-sm text-brand-greyMedium max-w-md">
            Ask our automated Eagle Assistant for instant booking guidance or read through our frequently asked questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          <div className="bg-brand-card border border-primary/20 rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden h-[580px]">

            <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black/30 border border-white/20 rounded-full flex items-center justify-center text-xl shadow-[0_0_10px_rgba(0,0,0,0.3)]">
                  🏏
                </div>
                <div>
                  <p className="font-heading font-black text-white text-sm tracking-wide uppercase">EAGLE ASSISTANT</p>
                  <p className="font-accent text-[10px] text-white/70 tracking-wider flex items-center gap-1.5 uppercase mt-0.5">
                    <span className="w-2 h-2 bg-[#00e676] rounded-full animate-ping" />
                    Always Online
                  </p>
                </div>
              </div>
              <ShieldCheck className="text-secondary opacity-80" size={20} />
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-black/40">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {msg.from === 'bot' && (
                    <div className="w-7 h-7 bg-primary/15 border border-primary/20 rounded-full flex items-center justify-center text-xs shrink-0 select-none">
                      🏏
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed font-sans shadow-md
                      ${msg.from === 'user'
                        ? 'bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-none'
                        : 'bg-brand-greyDark border border-white/5 text-white/90 rounded-bl-none'}`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 flex gap-2 overflow-x-auto border-t border-white/5 bg-brand-card">
              {quickReplies.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] font-accent font-bold tracking-wider px-3.5 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all cursor-pointer shrink-0 uppercase"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 flex gap-3 bg-brand-card">
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Type your question..."
                className="flex-1 bg-brand-greyDark border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-sans"
              />
              <button
                id="chat-send"
                onClick={() => sendMessage(input)}
                className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-light text-white transition-all shadow-[0_4px_12px_rgba(0,200,83,0.2)] cursor-pointer"
              >
                <Send size={15} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading font-black text-secondary text-sm tracking-[2px] uppercase mb-4">
              COMMON QUESTIONS
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>

            <div className="bg-gradient-to-b from-[#0d2818] to-brand-card border border-primary/20 rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.3)] mt-8">
              <h3 className="font-heading font-black text-white tracking-wide text-sm uppercase mb-3">
                📞 NEED DIRECT ASSISTANCE?
              </h3>
              <p className="font-sans text-xs text-brand-greyMedium mb-4 leading-relaxed">
                Our operations team is available from 6:00 AM to 9:00 PM daily to assist with field issues or custom tournaments.
              </p>
              <div className="space-y-3 font-sans text-xs text-white/90">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-primary" />
                  <span>Call Support: <strong>+91 98765 43210</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary" />
                  <span>WhatsApp Help: <strong>+91 98765 43210</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-primary" />
                  <span>Email: <strong>info@eagleboxcricket.com</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-white/5 transition-colors cursor-pointer select-none"
      >
        <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wide pr-4">{q}</span>
        <span className="text-primary font-display text-2xl leading-none shrink-0">{open ? '−' : '+'}</span>
      </button>
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? 'max-h-[200px] border-t border-white/5 p-6 bg-black/20' : 'max-h-0'
        }`}
      >
        <p className="font-sans text-xs text-brand-greyMedium leading-relaxed">{a}</p>
      </div>
    </div>
  )
}
