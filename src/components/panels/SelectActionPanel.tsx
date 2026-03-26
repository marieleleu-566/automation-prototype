import { useState } from 'react'
import X from '@dtsl/icons/dist/icons/react/X'
import Search from '@dtsl/icons/dist/icons/react/Search'
import List from '@dtsl/icons/dist/icons/react/List'
import Settings from '@dtsl/icons/dist/icons/react/Settings'
import Mail from '@dtsl/icons/dist/icons/react/Mail'
import Split from '@dtsl/icons/dist/icons/react/Split'
import Percent from '@dtsl/icons/dist/icons/react/Percent'
import Clock from '@dtsl/icons/dist/icons/react/Clock'
import Zap from '@dtsl/icons/dist/icons/react/Zap'
import GripVertical from '@dtsl/icons/dist/icons/react/GripVertical'
import Trash2 from '@dtsl/icons/dist/icons/react/Trash2'
import Smartphone from '@dtsl/icons/dist/icons/react/Smartphone'
import Bell from '@dtsl/icons/dist/icons/react/Bell'
import CheckSquare from '@dtsl/icons/dist/icons/react/CheckSquare'
import DollarSign from '@dtsl/icons/dist/icons/react/DollarSign'
import CreditCard from '@dtsl/icons/dist/icons/react/CreditCard'
import User from '@dtsl/icons/dist/icons/react/User'
import Loader from '@dtsl/icons/dist/icons/react/Loader'
import MessageCircle from '@dtsl/icons/dist/icons/react/MessageCircle'
import Briefcase from '@dtsl/icons/dist/icons/react/Briefcase'
import Xcircle from '@dtsl/icons/dist/icons/react/Xcircle'
import GitBranch from '@dtsl/icons/dist/icons/react/GitBranch'
import CornerDownRight from '@dtsl/icons/dist/icons/react/CornerDownRight'
import ChevronDown from '@dtsl/icons/dist/icons/react/ChevronDown'
import type { ActionDef } from '../../data'
import { AVAILABLE_ACTIONS } from '../../data'

const SECTOR_OPTIONS = ['Rules', 'Objects & CRM', 'Marketing & Engagement', 'Sales activity', 'Loyalty & Rewards', 'Workflow']
const OBJECT_OPTIONS = ['Pet', 'Contact', 'Company']

const MOST_USED_IDS = new Set([
  'sendEmail', 'sendSms', 'conditionalSplit', 'timeDelay',
  'contactListUpdate', 'updateContactAttribute', 'waitUntilEvent',
])

function matchesObject(name: string, obj: string): boolean {
  return name.toLowerCase().includes(obj.toLowerCase())
}

const PET_ACTION_IDS = new Set(['petListUpdate', 'updatePetAttribute', 'deletePet', 'blocklistPet', 'assignPetToContact'])
const CONTACT_ACTION_IDS = new Set(['contactListUpdate', 'updateContactAttribute', 'deleteContact', 'blocklistContact', 'assignUserToContact'])
const COMPANY_ACTION_IDS = new Set(['updateCompanyAttribute'])

function getActionObject(id: string): 'pet' | 'contact' | 'company' | null {
  if (PET_ACTION_IDS.has(id)) return 'pet'
  if (CONTACT_ACTION_IDS.has(id)) return 'contact'
  if (COMPANY_ACTION_IDS.has(id)) return 'company'
  return null
}

function ActionBadge({ object }: { object: 'pet' | 'contact' | 'company' }) {
  const styles: Record<string, React.CSSProperties> = {
    pet: { background: '#FFF1F2', color: '#F43F5E' },
    contact: { background: '#EEF2FF', color: '#4F46E5' },
    company: { background: '#F0FDF4', color: '#16A34A' },
  }
  const labels = { pet: 'Pet', contact: 'Contact', company: 'Company' }
  return (
    <span style={{
      fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 20,
      flexShrink: 0, ...styles[object],
    }}>
      {labels[object]}
    </span>
  )
}

interface Props {
  onSelect: (def: ActionDef) => void
  onClose: () => void
}

function ActionIcon({ id, color }: { id: string; color: string }) {
  const s = { color, width: 16, height: 16 }
  switch (id) {
    case 'conditionalSplit': return <Split style={s} />
    case 'percentageSplit': return <Percent style={s} />
    case 'waitUntilEvent': return <Loader style={s} />
    case 'timeDelay': return <Clock style={s} />
    case 'petListUpdate': return <List style={s} />
    case 'contactListUpdate': return <List style={s} />
    case 'updateContactAttribute': return <Settings style={s} />
    case 'updatePetAttribute': return <Settings style={s} />
    case 'deletePet': return <Trash2 style={s} />
    case 'deleteContact': return <Trash2 style={s} />
    case 'blocklistContact': return <Xcircle style={s} />
    case 'blocklistPet': return <Xcircle style={s} />
    case 'assignPetToContact': return <User style={s} />
    case 'assignUserToContact': return <User style={s} />
    case 'updateCompanyAttribute': return <Briefcase style={s} />
    case 'sendEmail': return <Mail style={s} />
    case 'sendSms': return <Smartphone style={s} />
    case 'sendPushNotification': return <Bell style={s} />
    case 'sendWhatsapp': return <MessageCircle style={s} />
    case 'createTask': return <CheckSquare style={s} />
    case 'dealManagement': return <DollarSign style={s} />
    case 'moveToWalletCampaign': return <CreditCard style={s} />
    case 'sendWalletNotification': return <CreditCard style={s} />
    case 'moveToWalletAndNotify': return <CreditCard style={s} />
    case 'startAnotherAutomation': return <GitBranch style={s} />
    case 'goToAnotherStep': return <CornerDownRight style={s} />
    default: return <Zap style={s} />
  }
}

function ActionCard({ def, onSelect, onDragStart }: {
  def: ActionDef
  onSelect: (def: ActionDef) => void
  onDragStart: (e: React.DragEvent, def: ActionDef) => void
}) {
  return (
    <div
      className="action-item"
      draggable
      onDragStart={e => onDragStart(e, def)}
      onClick={() => onSelect(def)}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 2, flexShrink: 0,
        background: def.iconBg === 'transparent' ? '#e4f2ff' : def.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <ActionIcon id={def.id} color={def.iconColor} />
      </div>
      <span className="action-item-name" style={{ flex: 1 }}>{def.name}</span>
      {getActionObject(def.id) && <ActionBadge object={getActionObject(def.id)!} />}
      <div className="action-item-drag"><GripVertical size={14} /></div>
    </div>
  )
}

export default function SelectActionPanel({ onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [mostUsed, setMostUsed] = useState(false)
  const [activeSector, setActiveSector] = useState('All')
  const [activeObject, setActiveObject] = useState('All')
  const [sectorOpen, setSectorOpen] = useState(false)
  const [objectOpen, setObjectOpen] = useState(false)

  const searchLower = search.toLowerCase()
  const activeFilterCount = (activeSector !== 'All' ? 1 : 0) + (activeObject !== 'All' ? 1 : 0)

  const handleDragStart = (e: React.DragEvent, def: ActionDef) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'action', def }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const filterAction = (def: ActionDef) => {
    if (searchLower && !def.name.toLowerCase().includes(searchLower)) return false
    if (mostUsed && !MOST_USED_IDS.has(def.id)) return false
    if (activeObject !== 'All' && !matchesObject(def.name, activeObject)) return false
    return true
  }

  const showRules = activeSector === 'All' || activeSector === 'Rules'
  const filteredRules = AVAILABLE_ACTIONS.rules.filter(filterAction)

  const filteredCategories = AVAILABLE_ACTIONS.categories
    .filter(cat => activeSector === 'All' || cat.name === activeSector)
    .map(cat => ({ ...cat, actions: cat.actions.filter(filterAction) }))
    .filter(cat => cat.actions.length > 0)

  const hasResults = (showRules && filteredRules.length > 0) || filteredCategories.length > 0

  const clearFilters = () => { setActiveSector('All'); setActiveObject('All'); setMostUsed(false) }

  return (
    <div className="side-panel" onClick={() => { setSectorOpen(false); setObjectOpen(false) }}>
      <div className="panel-header">
        <span className="panel-title">Select a step</span>
        <button className="panel-close-btn" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            placeholder="Search by step name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="filter-chips-row" onClick={e => e.stopPropagation()}>
        {/* All steps */}
        <button
          className={`chip-filter ${!mostUsed && activeSector === 'All' && activeObject === 'All' ? 'active' : ''}`}
          onClick={clearFilters}
        >
          All steps
        </button>

        {/* Most used */}
        <button
          className={`chip-filter ${mostUsed ? 'active' : ''}`}
          onClick={() => { setMostUsed(v => !v); setActiveSector('All'); setActiveObject('All') }}
        >
          Most used
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
                  onClick={() => { setActiveSector(opt); setSectorOpen(false); setMostUsed(false) }}
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
                  onClick={() => { setActiveObject(opt); setObjectOpen(false); setMostUsed(false) }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        {(activeFilterCount > 0 || mostUsed) && (
          <span className="clear-filters" onClick={clearFilters}>Clear filters</span>
        )}
      </div>

      <div className="panel-body">
        {!hasResults ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#696969', fontSize: 14 }}>
            No actions match your filters.
          </div>
        ) : (
          <>
            {showRules && filteredRules.length > 0 && (
              <>
                <div className="action-category-title">Rules</div>
                {filteredRules.map(def => (
                  <ActionCard key={def.id} def={def} onSelect={onSelect} onDragStart={handleDragStart} />
                ))}
              </>
            )}

            {filteredCategories.length > 0 && (
              <>
                {(showRules && filteredRules.length > 0) && (
                  <div className="action-category-title" style={{ marginTop: 8 }}>Actions</div>
                )}
                {filteredCategories.map(cat => (
                  <div key={cat.name}>
                    <div className="list-section-title">{cat.name}</div>
                    {cat.actions.map(def => (
                      <ActionCard key={def.id} def={def} onSelect={onSelect} onDragStart={handleDragStart} />
                    ))}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
