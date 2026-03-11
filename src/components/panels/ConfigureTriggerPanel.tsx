import { useState } from 'react'
import { NaosButton, VARIANTS, COLORS } from '@dtsl/react/dist/components/NaosButton'
import X from '@dtsl/icons/dist/icons/react/X'
import ChevronDown from '@dtsl/icons/dist/icons/react/ChevronDown'
import ChevronUp from '@dtsl/icons/dist/icons/react/ChevronUp'
import ChevronLeft from '@dtsl/icons/dist/icons/react/ChevronLeft'
import List from '@dtsl/icons/dist/icons/react/List'
import Users from '@dtsl/icons/dist/icons/react/Users'
import type { TriggerNode } from '../../types'
import { AVAILABLE_LISTS, MEMBERSHIP_TYPES } from '../../data'

interface Props {
  trigger: TriggerNode
  onSave: (id: string, config: TriggerNode['config'], description: string) => void
  onCancel: (id: string) => void
}

const MOCK_FILTERS = [
  'Pet age < 2 years',
  'Pet type is Dog',
  'Pet breed is not Pit Bull',
  'Pet vaccination is Up to date',
  'Pet weight > 5 kg',
]

function PetFiltersBody({ filters, onFiltersChange }: { filters: string[]; onFiltersChange: (f: string[]) => void }) {
  const addNext = () => {
    const next = MOCK_FILTERS.find(f => !filters.includes(f))
    if (next) onFiltersChange([...filters, next])
  }
  const remove = (f: string) => onFiltersChange(filters.filter(x => x !== f))

  return (
    <div className="panel-body" style={{ padding: 16 }}>
      <div style={{
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} style={{ color: '#1b1b1b' }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1b1b1b' }}>Pet filters</span>
          </div>
          <p style={{ fontSize: 14, color: '#696969', margin: 0, lineHeight: '20px' }}>
            Define the pets entering your automation.
          </p>
        </div>

        {filters.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filters.map(f => (
              <div key={f} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', background: 'var(--color-surface-subtle)', borderRadius: 6,
                fontSize: 13, color: '#1b1b1b', fontWeight: 500,
              }}>
                {f}
                <button onClick={() => remove(f)} style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: '#696969', display: 'flex', padding: 0, marginLeft: 8,
                }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {filters.length < MOCK_FILTERS.length && (
          <button onClick={addNext} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', border: '1px solid #cfcfcf', borderRadius: 8,
            background: '#fff', fontSize: 14, fontWeight: 600, color: '#1b1b1b',
            cursor: 'pointer', boxShadow: '0 1px 2px rgba(27,27,27,0.08)',
            alignSelf: 'flex-start',
          }}>
            Add filter
          </button>
        )}
      </div>
    </div>
  )
}

export default function ConfigureTriggerPanel({ trigger, onSave, onCancel }: Props) {
  const [membershipType, setMembershipType] = useState(trigger.config.membershipType ?? '')
  const [selectedLists, setSelectedLists] = useState<string[]>(trigger.config.selectedLists ?? [])
  const [filters, setFilters] = useState<string[]>(trigger.config.filters ?? [])
  const [membershipOpen, setMembershipOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false)

  const isPetFiltered = trigger.triggerId === 'petFiltered'
  const isPetTrigger = trigger.triggerId.toLowerCase().includes('pet')

  const toggleList = (name: string) =>
    setSelectedLists(prev => prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name])

  const handleSave = () => {
    if (isPetFiltered) {
      onSave(trigger.id, { filters }, trigger.name)
    } else {
      const desc = selectedLists.length > 0
        ? `Pet added to list ${selectedLists.join(' & ')}`
        : trigger.name
      onSave(trigger.id, { membershipType, selectedLists }, desc)
    }
  }

  const selectedLabel = MEMBERSHIP_TYPES.find(m => m.id === membershipType)?.label ?? ''

  return (
    <div className="side-panel">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--color-error-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <List size={14} style={{ color: 'var(--color-error)' }} />
          </div>
          <div>
            <div className="panel-title">{trigger.name}</div>
            <div className="panel-subtitle">Step ID #XX</div>
          </div>
        </div>
        <button className="panel-close-btn" onClick={() => onCancel(trigger.id)}><X size={16} /></button>
      </div>

      {isPetTrigger && (
        <div style={{
          margin: '16px 16px 12px',
          padding: '8px 12px',
          background: 'var(--brand-interactive-bg)',
          border: '1px solid #ede9fe',
          borderRadius: 8,
          fontSize: 12,
          color: '#1b1b1b',
          lineHeight: '18px',
        }}>
          <strong style={{ color: 'var(--brand-interactive)' }}>Custom object · linked to Contact</strong> — Actions in this automation can target the pet's linked contact (e.g. send them an email).
        </div>
      )}

      {isPetFiltered ? (
        <PetFiltersBody filters={filters} onFiltersChange={setFilters} />
      ) : (
        <div className="panel-body">
          {/* Membership type select */}
          <div className="field-group">
            <div className="field-label">
              Choose a list membership trigger <span className="required-dot">*</span>
            </div>
            <div className="select-dropdown-wrap">
              <div
                className={`custom-select ${membershipOpen ? 'open' : ''}`}
                onClick={() => { setMembershipOpen(v => !v); setListOpen(false) }}
              >
                <span style={{ color: selectedLabel ? '#1b1b1b' : '#9ca3af' }}>{selectedLabel || 'Select...'}</span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {membershipOpen && (
                    <button
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#696969', display: 'flex', padding: 0 }}
                      onClick={e => { e.stopPropagation(); setMembershipType('added'); setMembershipOpen(false) }}
                    >
                      <X size={13} />
                    </button>
                  )}
                  {membershipOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {membershipOpen && (
                <div className="dropdown-menu">
                  {MEMBERSHIP_TYPES.map(m => (
                    <div
                      key={m.id}
                      className={`dropdown-option ${membershipType === m.id ? 'selected' : ''}`}
                      onClick={() => { setMembershipType(m.id); setMembershipOpen(false) }}
                    >
                      {m.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* List multi-select */}
          <div className="field-group">
            <div className="field-label">
              List <span className="required-dot">*</span>
            </div>
            <div className="select-dropdown-wrap">
              <div
                className={`multi-select-wrapper ${listOpen ? 'open' : ''}`}
                onClick={() => { setListOpen(v => !v); setMembershipOpen(false) }}
              >
                {selectedLists.map(name => (
                  <div key={name} className="selected-chip">
                    {name}
                    <button onClick={e => { e.stopPropagation(); toggleList(name) }}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {selectedLists.length === 0 && (
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Select lists...</span>
                )}
                <div className="multi-select-clear">
                  {selectedLists.length > 0 && (
                    <button onClick={e => { e.stopPropagation(); setSelectedLists([]) }}>
                      <X size={13} />
                    </button>
                  )}
                  {listOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>
              {listOpen && (
                <div className="multi-dropdown">
                  <div className="multi-dropdown-category">
                    <ChevronLeft size={13} /> Animal
                  </div>
                  <div className="multi-dropdown-option" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedLists.length === AVAILABLE_LISTS.length}
                      onChange={() => setSelectedLists(
                        selectedLists.length === AVAILABLE_LISTS.length ? [] : AVAILABLE_LISTS.map(l => l.name)
                      )}
                      onClick={e => e.stopPropagation()}
                    />
                    <span>Option ({selectedLists.length}/{AVAILABLE_LISTS.length})</span>
                  </div>
                  {AVAILABLE_LISTS.map(list => (
                    <div
                      key={list.id}
                      className={`multi-dropdown-option ${selectedLists.includes(list.name) ? 'checked' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleList(list.name) }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLists.includes(list.name)}
                        onChange={() => toggleList(list.name)}
                        onClick={e => e.stopPropagation()}
                      />
                      <span>{list.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="panel-footer">
        <NaosButton variant={VARIANTS.TERTIARY} color={COLORS.PRIMARY} size="medium" label="Cancel" onClick={() => onCancel(trigger.id)} />
        <NaosButton variant={VARIANTS.PRIMARY} color={COLORS.PRIMARY} size="medium" label="Save" onClick={handleSave} />
      </div>
    </div>
  )
}
