import { useState, useRef, useEffect } from 'react'
import X from '@dtsl/icons/dist/icons/react/X'
import Send from '@dtsl/icons/dist/icons/react/Send'
import Zap from '@dtsl/icons/dist/icons/react/Zap'

interface Message {
  role: 'bot' | 'user'
  text: string
}

const SUGGESTIONS = [
  'Send a welcome email when a new pet is added',
  'Notify owners when their pet\'s birthday is coming up',
  'Follow up 7 days after a vet appointment',
]

const MOCK_REPLY = `Got it! Here's what I'd suggest:

**Trigger:** Pet added to list (new clients)
**Filter:** Dog, Age < 2 years, Breed ≠ Pit Bull
**Action:** Send email — "Welcome to VetinParis"

Want me to set this up on your canvas?`

interface Props {
  onClose: () => void
  onBuild: () => void
}

export default function AIChatPanel({ onClose, onBuild }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Hi! Describe the automation you want to build — I\'ll turn it into a workflow for you.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [offered, setOffered] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setMessages(prev => [...prev, { role: 'bot', text: MOCK_REPLY }])
      setOffered(true)
    }, 1400)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="ai-chat-panel">
      {/* Header */}
      <div className="ai-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="ai-chat-avatar">
            <Zap size={14} style={{ color: 'var(--brand-interactive)' }} />
          </div>
          <div>
            <div className="ai-chat-title">Build with AI</div>
            <div className="ai-chat-subtitle">Describe your automation</div>
          </div>
        </div>
        <button className="panel-close-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="ai-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-chat-bubble ${msg.role}`}>
            {msg.role === 'bot' && (
              <div className="ai-chat-bubble-avatar">
                <Zap size={11} style={{ color: 'var(--brand-interactive)' }} />
              </div>
            )}
            <div className="ai-chat-bubble-text">
              {msg.text.split('\n').map((line, j) => {
                const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                return (
                  <span key={j}>
                    {j > 0 && <br />}
                    <span dangerouslySetInnerHTML={{ __html: bold }} />
                  </span>
                )
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-chat-bubble bot">
            <div className="ai-chat-bubble-avatar">
              <Zap size={11} style={{ color: 'var(--brand-interactive)' }} />
            </div>
            <div className="ai-chat-bubble-text ai-chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        {offered && !loading && (
          <div style={{ display: 'flex', gap: 8, padding: '4px 0 8px' }}>
            <button className="ai-chat-action-btn" onClick={onBuild}>
              Set it up on canvas
            </button>
            <button className="ai-chat-action-btn ghost" onClick={() => {
              setMessages(prev => [...prev, { role: 'bot', text: 'Sure! Tell me more about what you\'d like to change.' }])
              setOffered(false)
            }}>
              Adjust it
            </button>
          </div>
        )}

        {messages.length === 1 && !loading && (
          <div style={{ padding: '4px 0 8px' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>Try an example</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} className="ai-chat-suggestion" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="ai-chat-input-area">
        <textarea
          ref={inputRef}
          className="ai-chat-textarea"
          placeholder="e.g. I want an automation that sends a welcome email to new dog owners..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        <button
          className="ai-chat-send-btn"
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
