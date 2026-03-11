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

function getTriggerObject(t: TriggerDef): 'pet' | 'contact' | null {
  const text = (t.name + ' ' + t.id).toLowerCase()
  if (text.includes('pet')) return 'pet'
  if (text.includes('contact')) return 'contact'
  return null
}

interface Props {
  onSelect: (def: TriggerDef) => void
  onClose: () => void
  existingObject: 'pet' | 'contact' | null
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

export default function SelectTriggerPanel({ onSelect, onClose, existingObject }: Props) {
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
            <div className="dropdown-menu" style={{ position: 'absolute', top: '110%', left: 0, zIndex: 20 }}>
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
            <div className="dropdown-menu" style={{ position: 'absolute', top: '110%', left: 0, zIndex: 20 }}>
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

      <div className="panel-body">
        {!search && recentlyUsed.length > 0 && (
          <>
            <div className="list-section-title">Recently used</div>
            {recentlyUsed.map(def => (
              <TriggerRow
                key={def.id}
                def={def}
                disabled={isDisabled(def)}
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
  def, disabled, onClick, onDragStart
}: {
  def: TriggerDef
  disabled: boolean
  onClick: (def: TriggerDef) => void
  onDragStart: (e: React.DragEvent, def: TriggerDef) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null)

  const handleMouseEnter = () => {
    if (!disabled) return
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
          <div className="trigger-item-name">{def.name}</div>
          <div className="trigger-item-desc">{def.description}</div>
        </div>
        <div className="trigger-item-drag"><GripVertical size={14} /></div>
      </div>

      {tooltipPos && createPortal(
        <div style={{
          position: 'fixed', top: tooltipPos.top, left: tooltipPos.left, zIndex: 9999,
          background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16,
          padding: 24, width: 280,
          boxShadow: '0px 4px 6px rgba(27,27,27,0.04), 0px 10px 16px rgba(27,27,27,0.10)',
          pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1b1b1b', lineHeight: '24px' }}>
            Please delete existing triggers.
          </div>
          <div style={{ fontSize: 16, color: '#1b1b1b', lineHeight: '24px' }}>
            You can't mix trigger types in the same automation. To use this trigger, please delete the existing triggers first. Actions (like sending an email) can still target the pet's linked contact.
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
