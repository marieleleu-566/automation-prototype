import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import X from '@dtsl/icons/dist/icons/react/X'
import ChevronRight from '@dtsl/icons/dist/icons/react/ChevronRight'
import ChevronDown from '@dtsl/icons/dist/icons/react/ChevronDown'
import ChevronLeft from '@dtsl/icons/dist/icons/react/ChevronLeft'
import Search from '@dtsl/icons/dist/icons/react/Search'
import type { FilterRule } from '../../types'

interface Attribute {
  id: string
  label: string
  type: 'text' | 'number' | 'select'
  options?: string[]
}

interface Category {
  id: string
  label: string
  attributes: Attribute[]
}

const FILTER_CATEGORIES: Category[] = [
  {
    id: 'pet',
    label: 'Pet details',
    attributes: [
      { id: 'species', label: 'Species', type: 'select', options: ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'] },
      { id: 'breed', label: 'Breed', type: 'text' },
      { id: 'name', label: 'Name', type: 'text' },
      { id: 'age', label: 'Age (years)', type: 'number' },
      { id: 'weight', label: 'Weight (kg)', type: 'number' },
      { id: 'vaccination', label: 'Vaccination status', type: 'select', options: ['Up to date', 'Overdue', 'None'] },
      { id: 'sterilized', label: 'Sterilized', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  {
    id: 'contact',
    label: 'Contact (owner) details',
    attributes: [
      { id: 'firstName', label: 'First name', type: 'text' },
      { id: 'lastName', label: 'Last name', type: 'text' },
      { id: 'email', label: 'Email', type: 'text' },
      { id: 'city', label: 'City', type: 'text' },
      { id: 'country', label: 'Country', type: 'text' },
    ],
  },
]

const OPERATORS: Record<Attribute['type'], string[]> = {
  text: ['is', 'is not', 'contains', 'does not contain', 'is empty', 'is not empty'],
  number: ['=', '≠', '<', '>', '≤', '≥'],
  select: ['is', 'is not'],
}
const NO_VALUE_OPERATORS = ['is empty', 'is not empty']

interface FilterRowData {
  id: string
  attribute: Attribute
  operator: string
  value: string
}

function FilterRow({
  row,
  onChange,
  onRemove,
}: {
  row: FilterRowData
  onChange: (updated: FilterRowData) => void
  onRemove: () => void
}) {
  const ops = OPERATORS[row.attribute.type]
  const needsValue = !NO_VALUE_OPERATORS.includes(row.operator)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
      <span style={{ fontSize: 13, color: '#696969', minWidth: 32 }}>Where</span>
      <div style={{
        padding: '5px 10px', background: '#f0f0f0', borderRadius: 6,
        fontSize: 13, fontWeight: 500, color: '#1b1b1b', whiteSpace: 'nowrap',
      }}>
        {row.attribute.label}
      </div>

      {/* Operator */}
      <select
        value={row.operator}
        onChange={e => onChange({ ...row, operator: e.target.value, value: '' })}
        style={{
          padding: '5px 8px', borderRadius: 6, border: '1px solid #e0e0e0',
          fontSize: 13, color: '#1b1b1b', background: '#fff', cursor: 'pointer',
        }}
      >
        {ops.map(op => <option key={op} value={op}>{op}</option>)}
      </select>

      {/* Value */}
      {needsValue && (
        row.attribute.type === 'select' ? (
          <select
            value={row.value}
            onChange={e => onChange({ ...row, value: e.target.value })}
            style={{
              padding: '5px 8px', borderRadius: 6, border: '1px solid #e0e0e0',
              fontSize: 13, color: row.value ? '#1b1b1b' : '#9ca3af', background: '#fff', cursor: 'pointer',
              flex: 1,
            }}
          >
            <option value="">Select a value...</option>
            {row.attribute.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type={row.attribute.type === 'number' ? 'number' : 'text'}
            value={row.value}
            onChange={e => onChange({ ...row, value: e.target.value })}
            placeholder="Enter value..."
            style={{
              flex: 1, padding: '5px 10px', borderRadius: 6, border: '1px solid #e0e0e0',
              fontSize: 13, color: '#1b1b1b', outline: 'none',
            }}
          />
        )
      )}

      <button onClick={onRemove} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>
  )
}

function AddFilterDropdown({ onSelect }: { onSelect: (attr: Attribute) => void }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const filtered = FILTER_CATEGORIES.filter(c =>
    !search || c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.attributes.some(a => a.label.toLowerCase().includes(search.toLowerCase()))
  )
  const attrs = selectedCategory?.attributes.filter(a =>
    !search || a.label.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 10,
      background: '#fff', borderRadius: 10, width: 300,
      boxShadow: '0 4px 20px rgba(0,0,0,0.14)', border: '1px solid #ebebeb',
      overflow: 'hidden',
    }}>
      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #6358DE', borderRadius: 8, padding: '6px 10px' }}>
          <Search size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
            autoFocus
            style={{ border: 'none', outline: 'none', fontSize: 13, color: '#1b1b1b', width: '100%', background: 'transparent' }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {selectedCategory ? (
          <>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 14px', background: '#f5f5f5', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: '#1b1b1b', borderBottom: '1px solid #f0f0f0',
              }}
            >
              <ChevronLeft size={14} />
              {selectedCategory.label}
            </button>
            {attrs.map(attr => (
              <button
                key={attr.id}
                onClick={() => onSelect(attr)}
                style={{
                  width: '100%', display: 'flex', padding: '11px 16px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: '#1b1b1b', borderBottom: '1px solid #f5f5f5',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9f9f9' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
              >
                {attr.label}
              </button>
            ))}
          </>
        ) : (
          filtered.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: '#1b1b1b', borderBottom: '1px solid #f5f5f5',
                textAlign: 'left',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9f9f9' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
            >
              {cat.label}
              <ChevronRight size={14} style={{ color: '#9ca3af' }} />
            </button>
          ))
        )}
      </div>
    </div>
  )
}

interface Props {
  onAdd: (rules: FilterRule[]) => void
  onClose: () => void
}

export default function FilterPickerModal({ onAdd, onClose }: Props) {
  const [rows, setRows] = useState<FilterRowData[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showDropdown) return
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showDropdown])

  const handleSelectAttribute = (attr: Attribute) => {
    setRows(prev => [...prev, {
      id: `row-${Date.now()}`,
      attribute: attr,
      operator: OPERATORS[attr.type][0],
      value: '',
    }])
    setShowDropdown(false)
  }

  const handleConfirm = () => {
    const rules: FilterRule[] = rows.map(r => ({
      id: r.id,
      attributeId: r.attribute.id,
      attributeLabel: r.attribute.label,
      operator: r.operator,
      value: r.value,
    }))
    onAdd(rules)
    onClose()
  }

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 14, width: 720, maxHeight: '80vh',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1b1b1b' }}>Define pet filters</div>
            <div style={{ fontSize: 13, color: '#696969', marginTop: 4 }}>
              Define the pets to include in your automation using filters.
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#696969', display: 'flex', padding: 4, marginTop: -2 }}>
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '10px 28px', background: '#f7f7f7', borderTop: '1px solid #efefef', borderBottom: '1px solid #efefef', display: 'flex', gap: 8 }}>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                borderRadius: 8, border: '1px solid #d8d8d8', background: '#fff',
                fontSize: 13, fontWeight: 500, color: '#1b1b1b', cursor: 'pointer',
              }}
            >
              Add filter
              <ChevronDown size={13} />
            </button>
            {showDropdown && <AddFilterDropdown onSelect={handleSelectAttribute} />}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 28px 8px' }}>
          {rows.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: '#9ca3af', fontSize: 13 }}>
              No filters added yet. Click "Add filter" to get started.
            </div>
          ) : (
            <div>
              {rows.map((row, i) => (
                <div key={row.id}>
                  {i > 0 && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', padding: '4px 0', textTransform: 'uppercase' }}>AND</div>
                  )}
                  <FilterRow
                    row={row}
                    onChange={updated => setRows(prev => prev.map(r => r.id === updated.id ? updated : r))}
                    onRemove={() => setRows(prev => prev.filter(r => r.id !== row.id))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 14, fontWeight: 500, color: '#6358DE', cursor: 'pointer', padding: '8px 4px' }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '9px 22px', borderRadius: 100, border: 'none',
              background: rows.length > 0 ? '#1b1b1b' : '#d0d0d0',
              color: rows.length > 0 ? '#fff' : '#9ca3af',
              fontSize: 14, fontWeight: 600, cursor: rows.length > 0 ? 'pointer' : 'default',
            }}
          >
            Add filters
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
