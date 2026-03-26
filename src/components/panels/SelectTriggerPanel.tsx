import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import X from '@dtsl/icons/dist/icons/react/X'
import Search from '@dtsl/icons/dist/icons/react/Search'
import List from '@dtsl/icons/dist/icons/react/List'
import Filter from '@dtsl/icons/dist/icons/react/Filter'
import PlusCircle from '@dtsl/icons/dist/icons/react/PlusCircle'
import FileText from '@dtsl/icons/dist/icons/react/FileText'
import Calendar from '@dtsl/icons/dist/icons/react/Calendar'
import MessageSquare from '@dtsl/icons/dist/icons/react/MessageSquare'
import Phone from '@dtsl/icons/dist/icons/react/Phone'
import Mail from '@dtsl/icons/dist/icons/react/Mail'
import ShoppingBag from '@dtsl/icons/dist/icons/react/ShoppingBag'
import Gift from '@dtsl/icons/dist/icons/react/Gift'
import CheckSquare from '@dtsl/icons/dist/icons/react/CheckSquare'
import BarChart2 from '@dtsl/icons/dist/icons/react/BarChart2'
import CreditCard from '@dtsl/icons/dist/icons/react/CreditCard'
import Star from '@dtsl/icons/dist/icons/react/Star'
import Globe from '@dtsl/icons/dist/icons/react/Globe'
import Zap from '@dtsl/icons/dist/icons/react/Zap'
import GripVertical from '@dtsl/icons/dist/icons/react/GripVertical'
import ChevronDown from '@dtsl/icons/dist/icons/react/ChevronDown'
import type { TriggerDef } from '../../data'
import { AVAILABLE_TRIGGERS, TRIGGER_CATEGORIES } from '../../data'

const SECTOR_OPTIONS = [
  'Objects & CRM',
  'Sales activities',
  'Commerce & Product',
  'Marketing & Engagement',
  'Loyalty & Rewards',
  'Custom event',
]

const OBJECT_OPTIONS = ['Pet', 'Contact']

function matchesObject(t: TriggerDef, obj: string): boolean {
  const text = (t.name + ' ' + t.id).toLowerCase()
  return text.includes(obj.toLowerCase())
}

function getTriggerObject(t: TriggerDef): 'pet' | 'contact' {
  const text = (t.name + ' ' + t.id).toLowerCase()
  if (text.includes('pet')) return 'pet'
  return 'contact'
}

type EnrollmentInfo = {
  unit: string
  summary: string
  goodFor: string
  watchOut?: string
}

const ENROLLMENT: Record<string, EnrollmentInfo> = {
  petAddedManually:      { unit: '1 execution per pet', summary: 'Each new pet triggers an execution. A contact with 2 pets triggers this twice.', goodFor: 'Use when the action should be scoped to the pet record — the pet is the subject, its linked contact receives the actions.', watchOut: 'One contact can trigger multiple executions if they own several pets. Use a contact-based trigger if you want one execution per owner.' },
  petListMembership:     { unit: '1 execution per pet', summary: 'Each pet joining or leaving the list triggers an execution.', goodFor: 'Use when list membership is tracked at the pet level. Each pet entering or leaving the list is treated as an independent event.', watchOut: 'One contact can trigger multiple executions if several of their pets are on the list. Use a contact list trigger if you want one execution per owner.' },
  petFiltered:           { unit: '1 execution per pet', summary: 'Each pet matching your filter triggers an execution. An owner with 3 matching pets triggers this 3 times.', goodFor: 'Use when you need to act on each pet that matches a condition individually. The filter is evaluated at the pet level.', watchOut: 'One contact can trigger multiple executions if several of their pets match the filter. Use a contact filter trigger if you want one execution per owner.' },
  contactAddedManually:  { unit: '1 execution per contact', summary: 'Triggers once when a new contact is added to your database.', goodFor: 'Use when the event and the recipient are the same object — the contact both triggers the execution and receives the actions.' },
  contactListMembership: { unit: '1 execution per contact', summary: 'Triggers once per contact when they join or leave the selected list.', goodFor: 'Use when list membership is tracked at the contact level. Each contact entering or leaving the list is treated as an independent event.' },
  contactFiltered:       { unit: '1 execution per contact', summary: 'Triggers once per contact when they enter the filter or segment.', goodFor: 'Use when you need to act on contacts that match a condition. The filter is evaluated at the contact level — one execution per matching contact.' },
  formSubmitted:         { unit: '1 execution per contact', summary: 'Triggers once per contact each time they submit the selected form.', goodFor: 'Use when a form submission is the entry point. The contact who submits the form both triggers the execution and receives the actions.' },
  anniversary:           { unit: '1 execution per year', summary: 'Triggers once per year on the date set in the selected attribute.', goodFor: 'Use when you want to act on a recurring date tied to a contact attribute. The contact both triggers the execution and receives the actions.' },
  emailEngagement:       { unit: '1 execution per contact', summary: 'Triggers when a contact opens, clicks, bounces, or unsubscribes from an email.', goodFor: 'Use when email interaction is the entry point. The contact who engaged both triggers the execution and receives the actions.' },
  pushInteractions:      { unit: '1 execution per contact', summary: 'Triggers when a contact interacts with a push notification.', goodFor: 'Use when push interaction is the entry point. The contact who interacted both triggers the execution and receives the actions.' },
  convStarted:           { unit: '1 execution per contact', summary: 'Triggers once per contact each time a conversation is started.', goodFor: 'Use when a conversation opening is the entry point. The contact both triggers the execution and receives the actions.' },
  convEnded:             { unit: '1 execution per contact', summary: 'Triggers once per contact when a conversation is closed.', goodFor: 'Use when a conversation closing is the entry point. The contact both triggers the execution and receives the actions.' },
  dealCreated:           { unit: '1 execution per contact', summary: 'Triggers once per contact when a new deal is created.', goodFor: 'Use when deal creation is the entry point. The contact linked to the deal both triggers the execution and receives the actions.' },
  dealStageUpdated:      { unit: '1 execution per contact', summary: 'Triggers once per contact each time a deal moves to a new stage.', goodFor: 'Use when deal progression is the entry point. The contact linked to the deal both triggers the execution and receives the actions.' },
}

function getEnrollment(def: TriggerDef): EnrollmentInfo {
  if (ENROLLMENT[def.id]) return ENROLLMENT[def.id]
  const isPet = getTriggerObject(def) === 'pet'
  return {
    unit: isPet ? '1 execution per pet' : '1 execution per contact',
    summary: isPet
      ? 'Each matching pet triggers an execution. An owner with multiple pets triggers this multiple times.'
      : 'Triggers once per contact when the condition is met.',
    goodFor: isPet
      ? 'Use when the action should be scoped to the pet record. The pet is the subject, its linked contact receives the actions.'
      : 'Use when the event and the recipient are the same object — the contact both triggers the execution and receives the actions.',
  }
}

interface Props {
  onSelect: (def: TriggerDef) => void
  onClose: () => void
  existingObject: 'pet' | 'contact' | null
  lockedWithNoTriggers?: boolean
  onResetObjectType?: () => void
}

function TriggerIcon({ iconType, color }: { iconType: TriggerDef['iconType']; color: string }) {
  const s = { color, width: 14, height: 14 }
  switch (iconType) {
    case 'list': return <List style={s} />
    case 'circle': return <PlusCircle style={s} />
    case 'filter': return <Filter style={s} />
    case 'form': return <FileText style={s} />
    case 'calendar': return <Calendar style={s} />
    case 'message': return <MessageSquare style={s} />
    case 'phone': return <Phone style={s} />
    case 'mail': return <Mail style={s} />
    case 'shopping': return <ShoppingBag style={s} />
    case 'gift': return <Gift style={s} />
    case 'check': return <CheckSquare style={s} />
    case 'chart': return <BarChart2 style={s} />
    case 'credit': return <CreditCard style={s} />
    case 'star': return <Star style={s} />
    case 'globe': return <Globe style={s} />
    case 'zap': return <Zap style={s} />
    default: return <List style={s} />
  }
}

export default function SelectTriggerPanel({ onSelect, onClose, existingObject, lockedWithNoTriggers, onResetObjectType }: Props) {
  const [search, setSearch] = useState('')
  const [activeSector, setActiveSector] = useState('All')
  const [activeObject, setActiveObject] = useState(
    existingObject ? existingObject.charAt(0).toUpperCase() + existingObject.slice(1) : 'All'
  )
  const [sectorOpen, setSectorOpen] = useState(false)
  const [objectOpen, setObjectOpen] = useState(false)


  const searchLower = search.toLowerCase()
  const activeFilterCount = (activeSector !== 'All' ? 1 : 0) + (activeObject !== 'All' ? 1 : 0)

  const isDisabled = (def: TriggerDef) => {
    if (!existingObject) return false
    return getTriggerObject(def) !== existingObject
  }

  const filteredCategories = TRIGGER_CATEGORIES
    .filter(cat => activeSector === 'All' || cat.name === activeSector)
    .map(cat => ({
      ...cat,
      triggers: cat.triggers.filter(t => {
        const matchesSearch = !searchLower ||
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
        const matchesObj = activeObject === 'All' || matchesObject(t, activeObject)
        return matchesSearch && matchesObj
      }).sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter(cat => cat.triggers.length > 0)

  const recentlyUsed = AVAILABLE_TRIGGERS.filter(t => {
    if (!t.recentlyUsed) return false
    if (search && !t.name.toLowerCase().includes(searchLower)) return false
    if (activeSector !== 'All' && t.category !== activeSector) return false
    if (activeObject !== 'All' && !matchesObject(t, activeObject)) return false
    return true
  })

  const totalFiltered = filteredCategories.reduce((n, c) => n + c.triggers.length, 0)

  const handleClick = (def: TriggerDef) => {
    if (!isDisabled(def)) onSelect(def)
  }

  const handleDragStart = (e: React.DragEvent, def: TriggerDef) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'trigger', def }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const clearFilters = () => { setActiveSector('All'); setActiveObject('All') }

  return (
    <div className="side-panel" onClick={() => { setSectorOpen(false); setObjectOpen(false) }}>
      <div className="panel-header">
        <span className="panel-title">Select a trigger</span>
        <button className="panel-close-btn" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            placeholder="Search triggers"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="filter-chips-row" onClick={e => e.stopPropagation()}>
        <button
          className={`chip-filter ${activeSector === 'All' && activeObject === 'All' ? 'active' : ''}`}
          onClick={clearFilters}
        >
          All triggers
        </button>

        {/* Sector dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className={`chip-filter ${activeSector !== 'All' ? 'active' : ''}`}
            onClick={() => { setSectorOpen(v => !v); setObjectOpen(false) }}
          >
            {activeSector !== 'All' ? activeSector : 'Sector'}
            <ChevronDown size={12} style={{ transform: sectorOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {sectorOpen && (
            <div className="dropdown-menu" style={{ position: 'absolute', top: '110%', left: 0, right: 'auto', minWidth: 'max-content', zIndex: 20 }}>
              <div
                className={`dropdown-option ${activeSector === 'All' ? 'selected' : ''}`}
                onClick={() => { setActiveSector('All'); setSectorOpen(false) }}
              >
                All sectors
              </div>
              {SECTOR_OPTIONS.map(opt => (
                <div
                  key={opt}
                  className={`dropdown-option ${activeSector === opt ? 'selected' : ''}`}
                  onClick={() => { setActiveSector(opt); setSectorOpen(false) }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Object dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className={`chip-filter ${activeObject !== 'All' ? 'active' : ''}`}
            onClick={() => { setObjectOpen(v => !v); setSectorOpen(false) }}
          >
            {activeObject !== 'All' ? activeObject : 'Object'}
            <ChevronDown size={12} style={{ transform: objectOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {objectOpen && (
            <div className="dropdown-menu" style={{ position: 'absolute', top: '110%', left: 0, right: 'auto', minWidth: 'max-content', zIndex: 20 }}>
              <div
                className={`dropdown-option ${activeObject === 'All' ? 'selected' : ''}`}
                onClick={() => { setActiveObject('All'); setObjectOpen(false) }}
              >
                All objects
              </div>
              {OBJECT_OPTIONS.map(opt => (
                <div
                  key={opt}
                  className={`dropdown-option ${activeObject === opt ? 'selected' : ''}`}
                  onClick={() => { setActiveObject(opt); setObjectOpen(false) }}
                >
                  <span>{opt}</span>
                  {opt === 'Pet' && (
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 6 }}>Custom · linked to Contact</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {activeFilterCount > 0 && (
          <>
            <span className="filter-count">{totalFiltered} results · {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}</span>
            <span className="clear-filters" onClick={clearFilters}>Clear filters</span>
          </>
        )}
      </div>

      {lockedWithNoTriggers && existingObject && (
        <div style={{
          margin: '12px 16px 12px', padding: '10px 12px',
          background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 8,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95' }}>
            This automation is locked to {existingObject === 'pet' ? 'Pet' : 'Contact'} triggers
          </div>
          <div style={{ fontSize: 12, color: '#5b21b6', lineHeight: '17px' }}>
            Your steps are configured for {existingObject === 'pet' ? 'Pet' : 'Contact'}-based data. Adding a different trigger type would break those steps.
          </div>
          <button
            onClick={onResetObjectType}
            style={{
              alignSelf: 'flex-start', fontSize: 12, fontWeight: 500,
              color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
            }}
          >
            Reset and clear all steps
          </button>
        </div>
      )}

      <div className="panel-body">
        {!search && recentlyUsed.length > 0 && (
          <>
            <div className="list-section-title">Recently used</div>
            {recentlyUsed.map(def => (
              <TriggerRow
                key={def.id}
                def={def}
                disabled={isDisabled(def)}
                existingObject={existingObject}
                onClick={handleClick}
                onDragStart={handleDragStart}
              />
            ))}
          </>
        )}

        {filteredCategories.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#696969', fontSize: 14 }}>
            No triggers match your filters.
          </div>
        ) : (
          filteredCategories.map(cat => (
            <div key={cat.name}>
              <div className="list-section-title">{cat.name}</div>
              {cat.triggers.map(def => (
                <TriggerRow
                  key={def.id}
                  def={def}
                  disabled={isDisabled(def)}
                  existingObject={existingObject}
                  onClick={handleClick}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function TriggerRow({
  def, disabled, existingObject, onClick, onDragStart
}: {
  def: TriggerDef
  disabled: boolean
  existingObject: 'pet' | 'contact' | null
  onClick: (def: TriggerDef) => void
  onDragStart: (e: React.DragEvent, def: TriggerDef) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null)
  const obj = getTriggerObject(def)
  const enrollment = getEnrollment(def)

  const handleMouseEnter = () => {
    const rect = ref.current?.getBoundingClientRect()
    if (rect) setTooltipPos({ top: rect.top, left: rect.right + 12 })
  }

  return (
    <div ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={() => setTooltipPos(null)}>
      <div
        className="trigger-item"
        draggable={!disabled}
        onDragStart={e => !disabled && onDragStart(e, def)}
        onClick={() => onClick(def)}
        style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer', pointerEvents: 'auto' }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 6, flexShrink: 0,
          background: def.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <TriggerIcon iconType={def.iconType} color={def.iconColor} />
        </div>
        <div className="trigger-item-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="trigger-item-name">{def.name}</div>
            <span className={`trigger-object-badge trigger-object-badge--${obj}`}>{obj === 'pet' ? 'Pet' : 'Contact'}</span>
          </div>
          <div className="trigger-item-desc">{def.description}</div>
        </div>
        <div className="trigger-item-drag"><GripVertical size={14} /></div>
      </div>

      {tooltipPos && createPortal(
        <div style={{
          position: 'fixed', top: tooltipPos.top, left: tooltipPos.left, zIndex: 9999,
          background: '#fff', border: '1px solid #e3e3e3', borderRadius: 12,
          padding: 14, width: 260,
          boxShadow: '0px 4px 6px rgba(27,27,27,0.04), 0px 10px 16px rgba(27,27,27,0.10)',
          pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {disabled ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1b1b1b' }}>Incompatible trigger type</div>
              <div style={{ fontSize: 12, color: '#696969', lineHeight: '18px' }}>
                This automation is locked to {existingObject === 'pet' ? 'Pet' : 'Contact'} triggers. All triggers in the same automation must operate on the same object type.
              </div>
            </>
          ) : (
            <>
              {/* Flow */}
              {obj === 'pet' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="trigger-object-badge trigger-object-badge--pet" style={{ fontSize: 11 }}>Pet</span>
                    <span style={{ fontSize: 11, color: '#c0bfbf' }}>→</span>
                    <span className="trigger-object-badge trigger-object-badge--contact" style={{ fontSize: 11 }}>Owner (contact)</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', paddingLeft: 2 }}>triggers execution · delivers actions to owner</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="trigger-object-badge trigger-object-badge--contact" style={{ fontSize: 11, alignSelf: 'flex-start' }}>Contact</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>triggers execution & receives actions</span>
                </div>
              )}
              <div style={{ fontSize: 11, color: '#696969', fontWeight: 500 }}>{enrollment.unit}</div>
              <div style={{ fontSize: 12, color: '#1b1b1b', lineHeight: '17px' }}>{enrollment.summary}</div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#696969', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Good for</div>
                <div style={{ fontSize: 12, color: '#1b1b1b', lineHeight: '17px' }}>{enrollment.goodFor}</div>
              </div>
              {enrollment.watchOut && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Watch out</div>
                  <div style={{ fontSize: 12, color: '#1b1b1b', lineHeight: '17px' }}>{enrollment.watchOut}</div>
                </div>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
