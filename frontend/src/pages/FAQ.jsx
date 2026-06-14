import { useState, useRef, useEffect } from 'react'
import { Send, Bot } from 'lucide-react'
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
  const [input, setInput]       = useState('')
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
      { from: 'bot',  text: reply },
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
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#1a1a1a]">FAQ & Help Chat</h1>
          <p className="text-gray-500 mt-1">Ask our Eagle Assistant anything, or browse common questions below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div style={{ backgroundColor: '#1a5c2a' }} className="px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#f5a623] rounded-full flex items-center justify-center text-lg">🏏</div>
              <div>
                <p className="text-white font-semibold text-sm">Eagle Assistant</p>
                <p className="text-white/60 text-xs">Always online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ height: 360 }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.from === 'bot' && (
                    <div className="w-7 h-7 bg-[#1a5c2a] rounded-full flex items-center justify-center mr-2 shrink-0 text-sm">🏏</div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                      ${msg.from === 'user'
                        ? 'text-white rounded-br-none'
                        : 'bg-gray-100 text-[#1a1a1a] rounded-bl-none'}`}
                    style={msg.from === 'user' ? { backgroundColor: '#1a5c2a' } : {}}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-gray-100">
              {quickReplies.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#1a5c2a] text-[#1a5c2a] hover:bg-[#1a5c2a] hover:text-white transition-colors font-medium">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Type your question..."
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#1a5c2a] transition-colors"
              />
              <button
                id="chat-send"
                onClick={() => sendMessage(input)}
                className="px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#1a5c2a' }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Common Questions</h2>
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}

            <div style={{ backgroundColor: '#1a5c2a' }} className="rounded-2xl p-5 text-white mt-6">
              <h3 className="font-bold mb-2">Need more help?</h3>
              <p className="text-white/80 text-sm mb-3">Our team is available 6 AM – 9 PM daily</p>
              <div className="space-y-1 text-sm">
                <p>📞 +91-9876543210</p>
                <p>📱 WhatsApp: +91-9876543210</p>
                <p>📧 info@eagleboxcricket.com</p>
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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-sm text-[#1a1a1a] pr-4">{q}</span>
        <span className="text-[#1a5c2a] font-bold text-lg shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{a}</div>
      )}
    </div>
  )
}
