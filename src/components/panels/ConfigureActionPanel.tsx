import { useState, useRef, useEffect } from 'react'
import { NaosButton, VARIANTS, COLORS } from '@dtsl/react/dist/components/NaosButton'
import X from '@dtsl/icons/dist/icons/react/X'
import Edit3 from '@dtsl/icons/dist/icons/react/Edit3'
import ChevronDown from '@dtsl/icons/dist/icons/react/ChevronDown'
import Plus from '@dtsl/icons/dist/icons/react/Plus'
import Info from '@dtsl/icons/dist/icons/react/Info'
import Check from '@dtsl/icons/dist/icons/react/Check'
import Mail from '@dtsl/icons/dist/icons/react/Mail'
import MessageSquare from '@dtsl/icons/dist/icons/react/MessageSquare'
import Phone from '@dtsl/icons/dist/icons/react/Phone'
import Zap from '@dtsl/icons/dist/icons/react/Zap'
import List from '@dtsl/icons/dist/icons/react/List'
import Settings from '@dtsl/icons/dist/icons/react/Settings'
import CheckSquare from '@dtsl/icons/dist/icons/react/CheckSquare'
import AlertTriangle from '@dtsl/icons/dist/icons/react/AlertTriangle'
import Users from '@dtsl/icons/dist/icons/react/Users'
import Calendar from '@dtsl/icons/dist/icons/react/Calendar'
import BarChart2 from '@dtsl/icons/dist/icons/react/BarChart2'
import Gift from '@dtsl/icons/dist/icons/react/Gift'
import type { ActionNode } from '../../types'

// ─── Data ───────────────────────────────────────────────────────────────────

const SENDER_EMAILS = ['noreply@vetinparis.com', 'hello@vetinparis.com', 'welcome@vetinparis.com', 'support@vetinparis.com']
const MOCK_USERS = ['Sophie Martin', 'Thomas Dupont', 'Léa Bernard', 'Antoine Rousseau']
const MOCK_AUTOMATIONS = ['Puppy welcome series', 'Vaccination reminder', 'Post-visit follow-up', 'Birthday campaign', 'Churn prevention']
const MOCK_ATTRS_CONTACT = ['First name', 'Last name', 'Email', 'Phone', 'City', 'Country', 'Subscription status', 'Score']
const MOCK_ATTRS_PET = ['Name', 'Type', 'Breed', 'Weight', 'Age', 'Vaccination date', 'Neutered']
const MOCK_LISTS = ['New client 2026', 'Puppy', 'Kitten', 'Fish']
const DELAY_UNITS = ['Minutes', 'Hours', 'Days', 'Weeks']
const WAIT_EVENTS = ['Email opened', 'Email clicked', 'Form submitted', 'Meeting booked', 'Page visited', 'Custom event']
const ATTR_OPS = ['Set to', 'Increment by', 'Clear value']
const CONDITION_FIELDS = ['Pet type', 'Pet age', 'Pet breed', 'Vaccination status', 'Weight', 'Email', 'City', 'Score']
const CONDITION_OPS = ['is', 'is not', 'contains', 'is greater than', 'is less than', 'is empty', 'is not empty']
const WHATSAPP_TEMPLATES = ['Welcome message', 'Appointment reminder', 'Vaccination alert', 'Invoice sent']
const WALLET_CAMPAIGNS = ['Summer loyalty', 'VIP card', 'Puppy club', 'Annual membership']
const WALLET_NOTIFS = ['Points earned', 'Tier upgraded', 'Reward available', 'Expiry reminder']
const MOCK_PIPELINES = [
  { label: 'Vet services', stages: ['Lead', 'Consultation booked', 'Consultation done', 'Follow-up', 'Closed'] },
  { label: 'Product sales', stages: ['Prospect', 'Demo', 'Proposal', 'Won', 'Lost'] },
]

// ─── Shared primitives ───────────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="action-section-title">
      {label}
      <button className="action-help-btn"><Info size={14} /></button>
    </div>
  )
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className="action-field-label">
      {label}
      {required && <span style={{ color: '#e00000', fontWeight: 700 }}>*</span>}
    </div>
  )
}

function TextInput({ placeholder, defaultValue, value, onChange }: {
  placeholder?: string; defaultValue?: string; value?: string; onChange?: (v: string) => void
}) {
  return (
    <div className="action-input-row">
      <input
        className="action-input"
        placeholder={placeholder}
        {...(value !== undefined ? { value, onChange: e => onChange?.(e.target.value) } : { defaultValue })}
      />
      <button className="action-braces-btn">{'{}'}</button>
    </div>
  )
}

function TextArea({ placeholder, defaultValue, rows = 4 }: { placeholder?: string; defaultValue?: string; rows?: number }) {
  return (
    <div style={{ border: '1px solid #e3e3e3', borderRadius: 8, overflow: 'hidden' }}>
      <textarea
        style={{
          width: '100%', border: 'none', outline: 'none', padding: '10px 16px',
          fontSize: 14, color: '#1b1b1b', resize: 'vertical', fontFamily: 'inherit',
          boxSizing: 'border-box', minHeight: rows * 24 + 20,
        }}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  )
}

function SimpleDropdown({ value, options, onChange, placeholder }: {
  value: string; options: string[]; onChange: (v: string) => void; placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="action-select" style={{ cursor: 'pointer' }} onClick={() => setOpen(v => !v)}>
        <span style={{ flex: 1, color: value ? '#1b1b1b' : '#696969', fontSize: 14 }}>
          {value || placeholder || 'Select…'}
        </span>
        <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
      </div>
      {open && (
        <div className="dropdown-menu" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20 }}>
          {options.map(opt => (
            <div
              key={opt}
              className={`dropdown-option ${value === opt ? 'selected' : ''}`}
              onClick={() => { onChange(opt); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              {opt}
              {value === opt && <Check size={13} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MultiDropdown({ value, options, onChange, placeholder }: {
  value: string[]; options: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="multi-select-wrapper" style={{ cursor: 'pointer' }} onClick={() => setOpen(v => !v)}>
        {value.length === 0
          ? <span style={{ fontSize: 13, color: '#9ca3af' }}>{placeholder ?? 'Select…'}</span>
          : value.map(v => (
            <div key={v} className="selected-chip">
              {v}
              <button onClick={e => { e.stopPropagation(); toggle(v) }}><X size={10} /></button>
            </div>
          ))
        }
        <div className="multi-select-clear">
          {value.length > 0 && <button onClick={e => { e.stopPropagation(); onChange([]) }}><X size={13} /></button>}
          <ChevronDown size={14} />
        </div>
      </div>
      {open && (
        <div className="multi-dropdown" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20 }}>
          {options.map(opt => (
            <div
              key={opt}
              className={`multi-dropdown-option ${value.includes(opt) ? 'checked' : ''}`}
              onClick={e => { e.stopPropagation(); toggle(opt) }}
            >
              <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} onClick={e => e.stopPropagation()} />
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DurationInput({ value, unit, onValueChange, onUnitChange, units }: {
  value: number; unit: string; onValueChange: (v: number) => void; onUnitChange: (u: string) => void; units: string[]
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ flex: '0 0 80px', border: '1px solid #e3e3e3', borderRadius: 8 }}>
        <input
          type="number" min={1} value={value}
          onChange={e => onValueChange(Math.max(1, Number(e.target.value)))}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 16, fontWeight: 600, textAlign: 'center', padding: '10px 8px', background: 'transparent' }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <SimpleDropdown value={unit} options={units} onChange={onUnitChange} />
      </div>
    </div>
  )
}

// ─── Action bodies ───────────────────────────────────────────────────────────

function SendEmailBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [sender, setSender] = useState('')
  const [subject, setSubject] = useState('Welcome to VetinParis, {{contact.firstName}}!')

  useEffect(() => {
    onConfig({ subject, sender })
  }, [subject, sender])

  return (
    <>
      <div className="action-panel-section">
        <SectionTitle label="Content" />
        <FieldLabel label="Message" required />
        <div className="action-message-card">
          <div className="action-message-illus">
            <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
              <rect x="20" y="8" width="110" height="124" rx="4" fill="#f3f4f6" />
              <rect x="30" y="18" width="90" height="50" rx="3" fill="#d1fae5" />
              <rect x="30" y="76" width="60" height="6" rx="2" fill="#e5e7eb" />
              <rect x="30" y="88" width="90" height="6" rx="2" fill="#e5e7eb" />
              <rect x="30" y="100" width="75" height="6" rx="2" fill="#e5e7eb" />
              <rect x="30" y="112" width="50" height="12" rx="6" fill="#d1fae5" />
              <circle cx="158" cy="44" r="16" fill="#d1fae5" />
              <path d="M152 60 Q158 72 164 60" stroke="#0d9488" strokeWidth="2" fill="none" />
              <path d="M142 80 Q158 88 174 80" stroke="#0d9488" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ fontSize: 14, color: '#1b1b1b', textAlign: 'center', margin: '0 0 16px' }}>
            Select an existing message or create a new one.
          </p>
          <button className="add-message-btn">
            <Plus size={14} /> Add message <ChevronDown size={14} />
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="action-event-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1b1b1b' }}>What event data to display?</span>
              <button className="action-help-btn"><Info size={14} /></button>
            </div>
            <p style={{ fontSize: 14, color: '#696969', margin: '0 0 12px', lineHeight: '20px' }}>
              If your email has event variables, select the event data to display.
            </p>
            <div className="action-select" style={{ cursor: 'default' }}>
              <span style={{ color: '#696969', flex: 1, fontSize: 14 }}>The email doesn't have event variables</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="action-panel-divider" />

      <div className="action-panel-section">
        <SectionTitle label="Subject" />
        <FieldLabel label="Subject line" required />
        <TextInput value={subject} onChange={setSubject} />
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="Preview text" />
          <TextInput defaultValue="Your new furry family member is in good hands." />
        </div>
      </div>

      <div className="action-panel-divider" />

      <div className="action-panel-section">
        <SectionTitle label="Sender" />
        <FieldLabel label="Email address" required />
        <SimpleDropdown value={sender} options={SENDER_EMAILS} onChange={setSender} />
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="Sender name" />
          <div className="action-select">
            <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }} defaultValue="VetinParis" />
          </div>
        </div>
      </div>

      <div className="action-panel-divider" />

      <div className="action-panel-section">
        <SectionTitle label="Additional settings" />
        <p style={{ fontSize: 14, color: '#1b1b1b', lineHeight: '24px', margin: '0 0 16px' }}>
          Manage additional settings such as sending time, tracking, subscription, and more.
        </p>
        <NaosButton variant={VARIANTS.SECONDARY} color={COLORS.PRIMARY} size="medium" label="Edit settings" />
      </div>
    </>
  )
}

function SendSmsBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [message, setMessage] = useState('')
  const [charCount, setCharCount] = useState(0)
  const MAX = 160

  useEffect(() => {
    onConfig({ message })
  }, [message])

  return (
    <>
      <div className="action-panel-section">
        <SectionTitle label="Message" />
        <FieldLabel label="Sender name" required />
        <div className="action-input-row">
          <input className="action-input" defaultValue="VetinParis" maxLength={11} />
        </div>
        <p style={{ fontSize: 12, color: '#696969', margin: '6px 0 0' }}>Max 11 characters. Alphanumeric only.</p>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <FieldLabel label="Message" required />
            <span style={{ fontSize: 12, color: charCount > MAX ? '#e00000' : '#696969' }}>{charCount}/{MAX}</span>
          </div>
          <div style={{ border: '1px solid #e3e3e3', borderRadius: 8 }}>
            <textarea
              style={{
                width: '100%', border: 'none', outline: 'none', padding: '10px 16px',
                fontSize: 14, color: '#1b1b1b', resize: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box', height: 100,
              }}
              placeholder="Hello {{contact.firstName}}, your appointment is confirmed."
              value={message}
              onChange={e => { setMessage(e.target.value); setCharCount(e.target.value.length) }}
            />
            <div style={{ borderTop: '1px solid #e3e3e3', padding: '6px 16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="action-braces-btn" style={{ border: 'none' }}>{'{}'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="action-panel-divider" />

      <div className="action-panel-section">
        <SectionTitle label="Test & preview" />
        <FieldLabel label="Test phone number" />
        <div className="action-input-row">
          <input className="action-input" placeholder="+33 6 12 34 56 78" />
        </div>
        <div style={{ marginTop: 12 }}>
          <NaosButton variant={VARIANTS.SECONDARY} color={COLORS.PRIMARY} size="medium" label="Send test SMS" />
        </div>
      </div>
    </>
  )
}

function SendPushBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    onConfig({ title, body })
  }, [title, body])

  return (
    <>
      <div className="action-panel-section">
        <SectionTitle label="Content" />
        <FieldLabel label="Title" required />
        <TextInput value={title} onChange={setTitle} placeholder="New message from VetinParis" />
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="Message" required />
          <div style={{ border: '1px solid #e3e3e3', borderRadius: 8, overflow: 'hidden' }}>
            <textarea
              style={{
                width: '100%', border: 'none', outline: 'none', padding: '10px 16px',
                fontSize: 14, color: '#1b1b1b', resize: 'vertical', fontFamily: 'inherit',
                boxSizing: 'border-box', minHeight: 3 * 24 + 20,
              }}
              placeholder="Your pet's appointment is confirmed for tomorrow at 10:00 AM."
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="URL / deep link" />
          <div className="action-input-row">
            <input className="action-input" placeholder="https://app.vetinparis.com/appointments" />
          </div>
        </div>
      </div>

      <div className="action-panel-divider" />

      <div className="action-panel-section">
        <SectionTitle label="Delivery" />
        <FieldLabel label="Mobile application" required />
        <SimpleDropdown value="" options={['VetinParis iOS & Android', 'VetinParis iOS only', 'VetinParis Android only']} onChange={() => {}} placeholder="Select app…" />
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="Badge count" />
          <SimpleDropdown value="" options={['Increment by 1', 'Set to 0', 'No change']} onChange={() => {}} placeholder="Select…" />
        </div>
      </div>
    </>
  )
}

function SendWhatsAppBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [template, setTemplate] = useState('')
  const [lang, setLang] = useState('')

  useEffect(() => {
    onConfig({ template, lang })
  }, [template, lang])

  return (
    <>
      <div className="action-panel-section">
        <SectionTitle label="Template" />
        <FieldLabel label="Message template" required />
        <SimpleDropdown value={template} options={WHATSAPP_TEMPLATES} onChange={setTemplate} placeholder="Select a template…" />
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="Language" required />
          <SimpleDropdown value={lang} options={['French', 'English', 'Spanish', 'German', 'Portuguese']} onChange={setLang} />
        </div>
      </div>

      {template && (
        <>
          <div className="action-panel-divider" />
          <div className="action-panel-section">
            <SectionTitle label="Variables" />
            <p style={{ fontSize: 14, color: '#696969', marginBottom: 16, lineHeight: '20px' }}>
              Map template variables to contact attributes.
            </p>
            {['{{1}} First name', '{{2}} Appointment date'].map((label, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <FieldLabel label={label} />
                <TextInput defaultValue={i === 0 ? '{{contact.firstName}}' : '{{event.appointmentDate}}'} />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="action-panel-divider" />

      <div className="action-panel-section">
        <SectionTitle label="Recipient" />
        <FieldLabel label="Phone number source" required />
        <SimpleDropdown value="Contact phone" options={['Contact phone', 'Pet owner phone', 'Custom attribute']} onChange={() => {}} />
      </div>
    </>
  )
}

function TimeDelayBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [amount, setAmount] = useState(1)
  const [unit, setUnit] = useState('Days')

  useEffect(() => {
    onConfig({ amount, unit })
  }, [amount, unit])

  return (
    <div className="action-panel-section">
      <SectionTitle label="Delay" />
      <p style={{ fontSize: 14, color: '#696969', marginBottom: 16, lineHeight: '20px' }}>
        Contacts will wait for the specified duration before moving to the next step.
      </p>
      <FieldLabel label="Duration" required />
      <DurationInput value={amount} unit={unit} onValueChange={setAmount} onUnitChange={setUnit} units={DELAY_UNITS} />
      <div style={{ marginTop: 16, padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, fontSize: 13, color: '#0369a1' }}>
        Contacts will wait <strong>{amount} {unit.toLowerCase()}</strong> before continuing.
      </div>
    </div>
  )
}

function WaitUntilEventBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [event, setEvent] = useState('')
  const [timeout, setTimeoutVal] = useState(7)
  const [timeoutUnit, setTimeoutUnit] = useState('Days')

  useEffect(() => {
    onConfig({ event, timeout, timeoutUnit })
  }, [event, timeout, timeoutUnit])

  return (
    <>
      <div className="action-panel-section">
        <SectionTitle label="Event condition" />
        <FieldLabel label="Wait until this event occurs" required />
        <SimpleDropdown value={event} options={WAIT_EVENTS} onChange={setEvent} placeholder="Select an event…" />
      </div>

      <div className="action-panel-divider" />

      <div className="action-panel-section">
        <SectionTitle label="Maximum wait time" />
        <p style={{ fontSize: 14, color: '#696969', marginBottom: 16, lineHeight: '20px' }}>
          If the event doesn't occur in time, contacts exit via the timeout path.
        </p>
        <DurationInput value={timeout} unit={timeoutUnit} onValueChange={setTimeoutVal} onUnitChange={setTimeoutUnit} units={DELAY_UNITS} />
      </div>
    </>
  )
}

interface Condition { field: string; operator: string; value: string }

function ConditionalSplitBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [conditions, setConditions] = useState<Condition[]>([{ field: 'Pet type', operator: 'is', value: 'Dog' }])
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND')

  useEffect(() => {
    onConfig({ conditions, logic })
  }, [conditions, logic])

  const update = (i: number, c: Condition) => setConditions(prev => prev.map((x, j) => j === i ? c : x))
  const remove = (i: number) => setConditions(prev => prev.filter((_, j) => j !== i))
  const showValue = (op: string) => op && !['is empty', 'is not empty'].includes(op)

  return (
    <>
      <div className="action-panel-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionTitle label="Branch A — conditions" />
          {conditions.length > 1 && (
            <div style={{ display: 'flex', gap: 4 }}>
              {(['AND', 'OR'] as const).map(l => (
                <button key={l} onClick={() => setLogic(l)} style={{
                  padding: '3px 10px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: '1px solid', cursor: 'pointer',
                  background: logic === l ? '#6358DE' : '#fff', color: logic === l ? '#fff' : '#696969',
                  borderColor: logic === l ? '#6358DE' : '#e3e3e3',
                }}>
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {conditions.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SimpleDropdown value={c.field} options={CONDITION_FIELDS} onChange={v => update(i, { ...c, field: v })} placeholder="Select attribute…" />
              <SimpleDropdown value={c.operator} options={CONDITION_OPS} onChange={v => update(i, { ...c, operator: v })} placeholder="Select operator…" />
              {showValue(c.operator) && (
                <div className="action-input-row">
                  <input className="action-input" value={c.value} onChange={e => update(i, { ...c, value: e.target.value })} placeholder="Enter value…" />
                </div>
              )}
            </div>
            <button onClick={() => remove(i)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#696969', padding: '10px 4px', flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>
        ))}

        <button
          onClick={() => setConditions(c => [...c, { field: '', operator: '', value: '' }])}
          style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', color: '#6358DE', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 0' }}
        >
          <Plus size={14} /> Add condition
        </button>
      </div>

      <div className="action-panel-divider" />

      <div className="action-panel-section">
        <div className="action-section-title" style={{ marginBottom: 8 }}>Branch B — all others</div>
        <div style={{ padding: '12px 16px', background: '#f9fafb', border: '1px dashed #e3e3e3', borderRadius: 8, fontSize: 13, color: '#696969' }}>
          Contacts who don't match Branch A will follow this path.
        </div>
      </div>
    </>
  )
}

function PercentageSplitBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [splitA, setSplitA] = useState(50)

  useEffect(() => {
    onConfig({ splitA })
  }, [splitA])
  const splitB = 100 - splitA

  return (
    <div className="action-panel-section">
      <SectionTitle label="Split distribution" />
      <p style={{ fontSize: 14, color: '#696969', marginBottom: 20, lineHeight: '20px' }}>
        Contacts are randomly distributed between two branches.
      </p>

      <div style={{ height: 24, borderRadius: 12, overflow: 'hidden', display: 'flex', marginBottom: 20 }}>
        <div style={{ width: `${splitA}%`, background: '#6358DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{splitA}%</span>
        </div>
        <div style={{ flex: 1, background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{splitB}%</span>
        </div>
      </div>

      <input type="range" min={5} max={95} value={splitA} onChange={e => setSplitA(Number(e.target.value))}
        style={{ width: '100%', marginBottom: 20, accentColor: '#6358DE' }} />

      <div style={{ display: 'flex', gap: 12 }}>
        {[{ label: 'Branch A', value: splitA, color: '#6358DE' }, { label: 'Branch B', value: splitB, color: '#a78bfa' }].map(b => (
          <div key={b.label} style={{ flex: 1, padding: '12px 16px', background: '#fafafa', border: `1px solid ${b.color}`, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#696969', fontWeight: 600 }}>{b.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: b.color }}>{b.value}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UpdateAttributeBody({ isPet, onConfig }: { isPet: boolean; onConfig: (c: Record<string, any>) => void }) {
  const [attr, setAttr] = useState('')
  const [op, setOp] = useState('')

  useEffect(() => {
    onConfig({ attr, op })
  }, [attr, op])

  return (
    <div className="action-panel-section">
      <SectionTitle label="Attribute update" />
      <FieldLabel label="Attribute" required />
      <SimpleDropdown value={attr} options={isPet ? MOCK_ATTRS_PET : MOCK_ATTRS_CONTACT} onChange={setAttr} placeholder="Select attribute…" />
      <div style={{ marginTop: 16 }}>
        <FieldLabel label="Operation" required />
        <SimpleDropdown value={op} options={ATTR_OPS} onChange={setOp} />
      </div>
      {op !== 'Clear value' ? (
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="New value" required />
          <TextInput placeholder="Enter value or {{variable}}" />
        </div>
      ) : (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
          This will set the attribute to null for all contacts entering this step.
        </div>
      )}
    </div>
  )
}

function ListUpdateBody({ isPet, onConfig }: { isPet: boolean; onConfig: (c: Record<string, any>) => void }) {
  const [action_, setAction_] = useState('')
  const [lists, setLists] = useState<string[]>([])

  useEffect(() => {
    onConfig({ action: action_, lists })
  }, [action_, lists])

  return (
    <div className="action-panel-section">
      <SectionTitle label="List membership" />
      <FieldLabel label="Action" required />
      <SimpleDropdown value={action_} options={['Add to list', 'Remove from list']} onChange={setAction_} />
      <div style={{ marginTop: 16 }}>
        <FieldLabel label={isPet ? 'Pet lists' : 'Contact lists'} required />
        <MultiDropdown value={lists} options={MOCK_LISTS} onChange={setLists} placeholder="Select lists…" />
      </div>
    </div>
  )
}

function CreateTaskBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [priority, setPriority] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueVal, setDueVal] = useState(3)
  const [dueUnit, setDueUnit] = useState('Days')

  useEffect(() => {
    onConfig({ priority, assignee, dueVal, dueUnit })
  }, [priority, assignee, dueVal, dueUnit])

  return (
    <>
      <div className="action-panel-section">
        <SectionTitle label="Task details" />
        <FieldLabel label="Title" required />
        <TextInput placeholder="Follow up with {{contact.firstName}}" />
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="Description" />
          <TextArea placeholder="Add context about this task…" rows={3} />
        </div>
      </div>

      <div className="action-panel-divider" />

      <div className="action-panel-section">
        <SectionTitle label="Assignment & priority" />
        <FieldLabel label="Assign to" required />
        <SimpleDropdown value={assignee} options={MOCK_USERS} onChange={setAssignee} placeholder="Select team member…" />
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="Priority" />
          <SimpleDropdown value={priority} options={['Low', 'Medium', 'High', 'Urgent']} onChange={setPriority} />
        </div>
      </div>

      <div className="action-panel-divider" />

      <div className="action-panel-section">
        <SectionTitle label="Due date" />
        <p style={{ fontSize: 14, color: '#696969', marginBottom: 12, lineHeight: '20px' }}>
          Relative to when the contact enters this step.
        </p>
        <DurationInput value={dueVal} unit={dueUnit} onValueChange={setDueVal} onUnitChange={setDueUnit} units={['Hours', 'Days', 'Weeks']} />
      </div>
    </>
  )
}

function AssignUserBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [mode, setMode] = useState('')
  const [user, setUser] = useState('')
  const [pool, setPool] = useState<string[]>([])

  useEffect(() => {
    onConfig({ mode, user, pool })
  }, [mode, user, pool])

  return (
    <div className="action-panel-section">
      <SectionTitle label="Assignment" />
      <FieldLabel label="Assignment mode" required />
      <SimpleDropdown value={mode} options={['Specific user', 'Round robin', 'Workload balanced']} onChange={setMode} placeholder="Select mode…" />
      {mode === 'Specific user' && (
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="Team member" required />
          <SimpleDropdown value={user} options={MOCK_USERS} onChange={setUser} placeholder="Select team member…" />
        </div>
      )}
      {(mode === 'Round robin' || mode === 'Workload balanced') && (
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="Team members pool" />
          <MultiDropdown value={pool} options={MOCK_USERS} onChange={setPool} placeholder="Select team members…" />
        </div>
      )}
    </div>
  )
}

function DeleteBody({ isPet, onConfig }: { isPet: boolean; onConfig: (c: Record<string, any>) => void }) {
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    onConfig({})
  }, [])

  return (
    <div className="action-panel-section">
      <div style={{ padding: 16, background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <AlertTriangle size={18} style={{ color: '#e00000', flexShrink: 0 }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1b1b1b' }}>Irreversible action</span>
        </div>
        <p style={{ fontSize: 14, color: '#696969', margin: 0, lineHeight: '20px' }}>
          The {isPet ? 'pet' : 'contact'} will be permanently deleted from your database. This cannot be undone.
        </p>
      </div>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
        <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} style={{ marginTop: 2 }} />
        <span style={{ fontSize: 14, color: '#1b1b1b', lineHeight: '20px' }}>
          I understand that deleting {isPet ? 'pets' : 'contacts'} is irreversible and cannot be recovered.
        </span>
      </label>
    </div>
  )
}

function BlocklistBody({ isPet, onConfig }: { isPet: boolean; onConfig: (c: Record<string, any>) => void }) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    onConfig({ reason })
  }, [reason])

  return (
    <div className="action-panel-section">
      <SectionTitle label="Blocklist settings" />
      <p style={{ fontSize: 14, color: '#696969', marginBottom: 16, lineHeight: '20px' }}>
        The {isPet ? 'pet' : 'contact'} will no longer receive marketing communications.
      </p>
      <FieldLabel label="Reason" />
      <SimpleDropdown
        value={reason}
        options={['Spam complaint', 'Unsubscribe request', 'User request (GDPR)', 'Manual blocklist', 'Hard bounce']}
        onChange={setReason}
        placeholder="Select a reason…"
      />
    </div>
  )
}

function DealManagementBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [dealAction, setDealAction] = useState('')
  const [pipeline, setPipeline] = useState('')
  const [stage, setStage] = useState('')

  useEffect(() => {
    onConfig({ dealAction, pipeline, stage })
  }, [dealAction, pipeline, stage])
  const stages = pipeline ? (MOCK_PIPELINES.find(p => p.label === pipeline)?.stages ?? []) : []

  return (
    <div className="action-panel-section">
      <SectionTitle label="Deal action" />
      <FieldLabel label="Action type" required />
      <SimpleDropdown value={dealAction} options={['Create deal', 'Update deal stage', 'Update deal value', 'Delete deal']} onChange={setDealAction} />
      <div style={{ marginTop: 16 }}>
        <FieldLabel label="Pipeline" required />
        <SimpleDropdown value={pipeline} options={MOCK_PIPELINES.map(p => p.label)} onChange={v => { setPipeline(v); setStage('') }} />
      </div>
      {dealAction !== 'Delete deal' && (
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="Stage" required />
          <SimpleDropdown value={stage} options={stages} onChange={setStage} placeholder="Select stage…" />
        </div>
      )}
      {(dealAction === 'Create deal' || dealAction === 'Update deal value') && (
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="Deal value (€)" />
          <div className="action-input-row">
            <input className="action-input" type="number" placeholder="0.00" />
          </div>
        </div>
      )}
    </div>
  )
}

function AssignPetBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  useEffect(() => {
    onConfig({})
  }, [])

  return (
    <div className="action-panel-section">
      <SectionTitle label="Association" />
      <p style={{ fontSize: 14, color: '#696969', marginBottom: 16, lineHeight: '20px' }}>
        The pet from the trigger will be associated with a contact in your database.
      </p>
      <FieldLabel label="Match pet to contact by" required />
      <SimpleDropdown value="Owner email" options={['Owner email', 'Owner phone', 'Pet ID', 'Custom attribute']} onChange={() => {}} />
    </div>
  )
}

function StartAutomationBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [automation, setAutomation] = useState('')

  useEffect(() => {
    onConfig({ automation })
  }, [automation])

  return (
    <div className="action-panel-section">
      <SectionTitle label="Target automation" />
      <p style={{ fontSize: 14, color: '#696969', marginBottom: 16, lineHeight: '20px' }}>
        Contacts will be enrolled in the selected automation when they reach this step.
      </p>
      <FieldLabel label="Automation" required />
      <SimpleDropdown value={automation} options={MOCK_AUTOMATIONS} onChange={setAutomation} placeholder="Select automation…" />
      <div style={{ marginTop: 16 }}>
        <FieldLabel label="Entry mode" />
        <SimpleDropdown value="" options={['Add at the start', 'Add after the last completed step']} onChange={() => {}} placeholder="Select…" />
      </div>
    </div>
  )
}

function GoToStepBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [step, setStep] = useState('')

  useEffect(() => {
    onConfig({ step })
  }, [step])
  const STEPS = ['Step 1 — Send an email', 'Step 2 — Time delay', 'Step 3 — Conditional split']

  return (
    <div className="action-panel-section">
      <SectionTitle label="Target step" />
      <p style={{ fontSize: 14, color: '#696969', marginBottom: 16, lineHeight: '20px' }}>
        Contacts will jump to the selected step in this automation.
      </p>
      <FieldLabel label="Step" required />
      <SimpleDropdown value={step} options={STEPS} onChange={setStep} placeholder="Select step…" />
    </div>
  )
}

function WalletBody({ actionId, onConfig }: { actionId: string; onConfig: (c: Record<string, any>) => void }) {
  const [campaign, setCampaign] = useState('')
  const [notif, setNotif] = useState('')

  useEffect(() => {
    onConfig({ campaign, notif })
  }, [campaign, notif])
  const showCampaign = actionId !== 'sendWalletNotification'
  const showNotif = actionId !== 'moveToWalletCampaign'

  return (
    <div className="action-panel-section">
      <SectionTitle label="Wallet configuration" />
      {showCampaign && (
        <>
          <FieldLabel label="Wallet campaign" required />
          <SimpleDropdown value={campaign} options={WALLET_CAMPAIGNS} onChange={setCampaign} placeholder="Select campaign…" />
        </>
      )}
      {showNotif && (
        <div style={{ marginTop: showCampaign ? 16 : 0 }}>
          <FieldLabel label="Notification template" required />
          <SimpleDropdown value={notif} options={WALLET_NOTIFS} onChange={setNotif} placeholder="Select template…" />
        </div>
      )}
    </div>
  )
}

function UpdateCompanyBody({ onConfig }: { onConfig: (c: Record<string, any>) => void }) {
  const [attr, setAttr] = useState('')
  const [op, setOp] = useState('')

  useEffect(() => {
    onConfig({ attr, op })
  }, [attr, op])

  return (
    <div className="action-panel-section">
      <SectionTitle label="Company attribute update" />
      <FieldLabel label="Attribute" required />
      <SimpleDropdown value={attr} options={['Name', 'Industry', 'Size', 'Website', 'Country', 'Revenue']} onChange={setAttr} placeholder="Select attribute…" />
      <div style={{ marginTop: 16 }}>
        <FieldLabel label="Operation" required />
        <SimpleDropdown value={op} options={ATTR_OPS} onChange={setOp} />
      </div>
      {op !== 'Clear value' && (
        <div style={{ marginTop: 16 }}>
          <FieldLabel label="New value" required />
          <TextInput placeholder="Enter value or {{variable}}" />
        </div>
      )}
    </div>
  )
}

// ─── Header icon ─────────────────────────────────────────────────────────────

function HeaderIcon({ actionId, iconColor, iconBg }: { actionId: string; iconColor: string; iconBg: string }) {
  const s = { color: iconColor, width: 16, height: 16 }
  let icon: React.ReactNode
  if (actionId === 'sendEmail') icon = <Mail style={s} />
  else if (actionId === 'sendSms') icon = <MessageSquare style={s} />
  else if (actionId === 'sendPushNotification') icon = <Zap style={s} />
  else if (actionId === 'sendWhatsapp') icon = <Phone style={s} />
  else if (actionId.includes('List') || actionId.includes('list')) icon = <List style={s} />
  else if (actionId.includes('Attribute') || actionId.includes('attribute')) icon = <Settings style={s} />
  else if (actionId === 'createTask') icon = <CheckSquare style={s} />
  else if (actionId === 'dealManagement') icon = <BarChart2 style={s} />
  else if (actionId.includes('delete') || actionId.includes('Delete') || actionId.includes('blocklist') || actionId.includes('Blocklist')) icon = <AlertTriangle style={s} />
  else if (actionId.includes('assign') || actionId.includes('Assign')) icon = <Users style={s} />
  else if (actionId.includes('Wallet') || actionId.includes('wallet')) icon = <Gift style={s} />
  else if (actionId === 'timeDelay' || actionId === 'waitUntilEvent') icon = <Calendar style={s} />
  else icon = <List style={s} />

  return (
    <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
  )
}

// ─── Router ──────────────────────────────────────────────────────────────────

function ActionBody({ action, onConfig }: { action: ActionNode; onConfig: (c: Record<string, any>) => void }) {
  const { actionId } = action
  if (actionId === 'sendEmail') return <SendEmailBody onConfig={onConfig} />
  if (actionId === 'sendSms') return <SendSmsBody onConfig={onConfig} />
  if (actionId === 'sendPushNotification') return <SendPushBody onConfig={onConfig} />
  if (actionId === 'sendWhatsapp') return <SendWhatsAppBody onConfig={onConfig} />
  if (actionId === 'timeDelay') return <TimeDelayBody onConfig={onConfig} />
  if (actionId === 'waitUntilEvent') return <WaitUntilEventBody onConfig={onConfig} />
  if (actionId === 'conditionalSplit') return <ConditionalSplitBody onConfig={onConfig} />
  if (actionId === 'percentageSplit') return <PercentageSplitBody onConfig={onConfig} />
  if (actionId === 'updateContactAttribute') return <UpdateAttributeBody isPet={false} onConfig={onConfig} />
  if (actionId === 'updatePetAttribute') return <UpdateAttributeBody isPet={true} onConfig={onConfig} />
  if (actionId === 'contactListUpdate') return <ListUpdateBody isPet={false} onConfig={onConfig} />
  if (actionId === 'petListUpdate') return <ListUpdateBody isPet={true} onConfig={onConfig} />
  if (actionId === 'createTask') return <CreateTaskBody onConfig={onConfig} />
  if (actionId === 'assignUserToContact') return <AssignUserBody onConfig={onConfig} />
  if (actionId === 'assignPetToContact') return <AssignPetBody onConfig={onConfig} />
  if (actionId === 'deleteContact') return <DeleteBody isPet={false} onConfig={onConfig} />
  if (actionId === 'deletePet') return <DeleteBody isPet={true} onConfig={onConfig} />
  if (actionId === 'blocklistContact') return <BlocklistBody isPet={false} onConfig={onConfig} />
  if (actionId === 'blocklistPet') return <BlocklistBody isPet={true} onConfig={onConfig} />
  if (actionId === 'dealManagement') return <DealManagementBody onConfig={onConfig} />
  if (actionId === 'startAnotherAutomation') return <StartAutomationBody onConfig={onConfig} />
  if (actionId === 'goToAnotherStep') return <GoToStepBody onConfig={onConfig} />
  if (actionId === 'moveToWalletCampaign' || actionId === 'sendWalletNotification' || actionId === 'moveToWalletAndNotify') return <WalletBody actionId={actionId} onConfig={onConfig} />
  if (actionId === 'updateCompanyAttribute') return <UpdateCompanyBody onConfig={onConfig} />
  return (
    <div className="action-panel-section">
      <SectionTitle label="Configuration" />
      <p style={{ fontSize: 14, color: '#696969', lineHeight: '20px' }}>Configure the <strong>{action.name}</strong> step.</p>
      <div style={{ marginTop: 16 }}>
        <FieldLabel label="Target" />
        <SimpleDropdown value="" options={['Contact', 'Pet owner']} onChange={() => {}} placeholder="Select target…" />
      </div>
    </div>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────

interface Props {
  action: ActionNode
  onSave: (id: string, config: Record<string, any>) => void
  onCancel: (id: string) => void
}

export default function ConfigureActionPanel({ action, onSave, onCancel }: Props) {
  const configRef = useRef<Record<string, any>>({})
  const handleConfig = (c: Record<string, any>) => { configRef.current = c }

  return (
    <div className="side-panel">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <HeaderIcon actionId={action.actionId} iconColor={action.iconColor} iconBg={action.iconBg} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="panel-title">{action.name}</span>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#696969', display: 'flex', padding: 0 }}>
                <Edit3 size={13} />
              </button>
            </div>
            <div className="panel-subtitle">Step ID #XX</div>
          </div>
        </div>
        <button className="panel-close-btn" onClick={() => onCancel(action.id)}><X size={16} /></button>
      </div>

      <div className="panel-body" style={{ padding: 0 }}>
        <ActionBody action={action} onConfig={handleConfig} />
      </div>

      <div className="panel-footer">
        <NaosButton variant={VARIANTS.TERTIARY} color={COLORS.PRIMARY} size="medium" label="Cancel" onClick={() => onCancel(action.id)} />
        <NaosButton variant={VARIANTS.PRIMARY} color={COLORS.PRIMARY} size="medium" label="Save" onClick={() => onSave(action.id, configRef.current)} />
      </div>
    </div>
  )
}
