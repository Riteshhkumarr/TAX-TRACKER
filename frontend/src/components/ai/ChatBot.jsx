import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiCpu, FiUser, FiX, FiMessageSquare } from 'react-icons/fi'
import { aiService } from '../../services/api'

const INITIAL_MESSAGES = [
  {
    id: '1',
    role: 'bot',
    content: "👋 Hi! I'm your AI financial assistant. I can help you with tax questions, expense optimization, financial planning, and more. What would you like to know?",
    timestamp: new Date(),
  },
]

const SUGGESTIONS = [
  'How can I reduce my tax liability?',
  'What expenses are tax deductible?',
  'When are my quarterly tax payments due?',
  'How is my financial health?',
]

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

function ChatMessage({ message }) {
  const isBot = message.role === 'bot'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 self-end ${
        isBot
          ? 'bg-gradient-to-br from-primary to-secondary text-white'
          : 'bg-slate-200 dark:bg-dark-card text-slate-500'
      }`}>
        {isBot ? <FiCpu size={14} /> : <FiUser size={14} />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isBot
            ? 'bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-200 rounded-bl-sm'
            : 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-sm'
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  )
}

function ChatBot({ embedded = false }) {
  const [isOpen, setIsOpen] = useState(embedded)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await aiService.chat({ message: userMsg, history: messages.slice(-6) })
      const botReply = response.data?.reply || response.data?.message || "I'm processing your request. Please try again in a moment."
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'bot', content: botReply, timestamp: new Date() },
      ])
    } catch {
      // Demo response when API is not available
      const demoReplies = {
        'reduce': "Great question! Here are top ways to reduce your tax liability:\n\n1. Maximize retirement contributions (401k, IRA)\n2. Claim all eligible deductions (home office, business expenses)\n3. Tax-loss harvesting on investments\n4. Charitable contributions\n5. Health Savings Account (HSA) contributions",
        'deductible': "Common tax-deductible expenses include:\n\n• Business expenses (supplies, software, travel)\n• Home office deduction\n• Health insurance premiums\n• Mortgage interest\n• Charitable donations\n• Student loan interest",
        'quarterly': "2024 Quarterly Tax Payment Deadlines:\n\n• Q1: April 15, 2024\n• Q2: June 17, 2024\n• Q3: September 16, 2024\n• Q4: January 15, 2025",
        'health': "Based on your financial data, your score is 72/100 (Good). Key improvements: increase deductible expense tracking and diversify income sources.",
      }
      const key = Object.keys(demoReplies).find((k) => userMsg.toLowerCase().includes(k))
      const reply = key ? demoReplies[key] : "I'm your AI tax assistant! I can help with tax planning, expense categorization, deduction optimization, and financial insights. What specific question do you have?"
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'bot', content: reply, timestamp: new Date() },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const ChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <FiCpu size={14} className="text-white" />
            </div>
            <div className="bg-slate-100 dark:bg-dark-card rounded-2xl rounded-bl-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors border border-primary/20"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-dark-border">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your finances..."
            rows={1}
            className="flex-1 bg-slate-100 dark:bg-dark-card text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[42px] max-h-24"
            style={{ height: 'auto' }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  )

  if (embedded) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden" style={{ height: '500px' }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-dark-border bg-gradient-to-r from-primary to-secondary">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <FiCpu size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Financial Assistant</p>
            <p className="text-xs text-white/70">Always here to help</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
        <div style={{ height: 'calc(100% - 60px)' }}>
          <ChatContent />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl shadow-glow flex items-center justify-center z-40"
      >
        <FiMessageSquare size={22} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-dark-border z-40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-dark-border bg-gradient-to-r from-primary to-secondary shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <FiCpu size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Financial Assistant</p>
                <p className="text-xs text-white/70">Online</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-auto p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                <FiX size={16} />
              </button>
            </div>
            <ChatContent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBot
