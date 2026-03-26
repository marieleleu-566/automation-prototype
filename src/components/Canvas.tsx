import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { TriggerNode, ActionNode } from '../types'
import type { TriggerDef, ActionDef } from '../data'
import AIChatPanel from './panels/AIChatPanel'
import List from '@dtsl/icons/dist/icons/react/List'
import LogOut from '@dtsl/icons/dist/icons/react/LogOut'
import Mail from '@dtsl/icons/dist/icons/react/Mail'
import Zap from '@dtsl/icons/dist/icons/react/Zap'
import AlertTriangle from '@dtsl/icons/dist/icons/react/AlertTriangle'
import AlertCircle from '@dtsl/icons/dist/icons/react/AlertCircle'
import MoreVertical from '@dtsl/icons/dist/icons/react/MoreVertical'
import ZoomIn from '@dtsl/icons/dist/icons/react/ZoomIn'
import ZoomOut from '@dtsl/icons/dist/icons/react/ZoomOut'
import Maximize2 from '@dtsl/icons/dist/icons/react/Maximize2'

import Settings from '@dtsl/icons/dist/icons/react/Settings'
import Plus from '@dtsl/icons/dist/icons/react/Plus'
import MagicWand from '@dtsl/icons/dist/icons/react/MagicWand'
import Pause from '@dtsl/icons/dist/icons/react/Pause'
import Trash2 from '@dtsl/icons/dist/icons/react/Trash2'

const TRIGGER_ICON_COLOR = '#F43F5E'
const TRIGGER_ICON_BG = '#FFF1F2'
const ARROW_COLOR = '#9ca3af'
const ARROW_HOVER = '#6358DE'

interface CanvasProps {
  triggers: TriggerNode[]
  actions: ActionNode[]
  editingTriggerId: string | null
  editingActionId: string | null
  onPickTrigger: () => void
  onAddTrigger: () => void
  onClickTrigger: (id: string) => void
  onClickDropZone: (insertAfterIndex?: number) => void
  onClickAction: (id: string) => void
  onDropTrigger: (def: TriggerDef) => void
  onDropAction: (def: ActionDef, insertAfterIndex?: number) => void
  onDeleteTrigger: (id: string) => void
  onDeleteAction: (id: string) => void
}

const ARROW_TOTAL_H = 96

const FORK_W = 280
const FORK_H = 56

function ForkOptions({ onAddTrigger, onAddStep }: { onAddTrigger: () => void; onAddStep: () => void }) {
  const [hoverL, setHoverL] = useState(false)
  const [hoverR, setHoverR] = useState(false)
  const lx = 65, rx = FORK_W - 65, cx = FORK_W / 2, fy = 28
  const arrowSize = 7

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={FORK_W} height={FORK_H} viewBox={`0 0 ${FORK_W} ${FORK_H}`} fill="none" style={{ display: 'block' }}>
        {/* stem */}
        <line x1={cx} y1={0} x2={cx} y2={16} stroke="#9ca3af" strokeWidth="1.5" />
        {/* left branch */}
        <path d={`M${cx},16 C${cx},${fy} ${lx},${fy} ${lx},${FORK_H}`} stroke={hoverL ? ARROW_HOVER : '#9ca3af'} strokeWidth="1.5" fill="none" style={{ transition: 'stroke 0.15s' }} />
        <polyline points={`${lx - arrowSize + 2},${FORK_H - arrowSize} ${lx},${FORK_H} ${lx + arrowSize - 2},${FORK_H - arrowSize}`} stroke={hoverL ? ARROW_HOVER : '#9ca3af'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.15s' }} />
        {/* right branch */}
        <path d={`M${cx},16 C${cx},${fy} ${rx},${fy} ${rx},${FORK_H}`} stroke={hoverR ? ARROW_HOVER : '#9ca3af'} strokeWidth="1.5" fill="none" style={{ transition: 'stroke 0.15s' }} />
        <polyline points={`${rx - arrowSize + 2},${FORK_H - arrowSize} ${rx},${FORK_H} ${rx + arrowSize - 2},${FORK_H - arrowSize}`} stroke={hoverR ? ARROW_HOVER : '#9ca3af'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.15s' }} />
      </svg>
      <div style={{ display: 'flex', gap: FORK_W - lx * 2 - 100 }}>
        <button
          className="add-trigger-btn"
          onClick={onAddTrigger}
          onMouseEnter={() => setHoverL(true)}
          onMouseLeave={() => setHoverL(false)}
          style={{ width: lx * 2 - 10 }}
        >
          <Zap size={13} style={{ color: '#696969' }} />
          Add a trigger
        </button>
        <button
          className="add-trigger-btn"
          onClick={onAddStep}
          onMouseEnter={() => setHoverR(true)}
          onMouseLeave={() => setHoverR(false)}
          style={{ width: lx * 2 - 10 }}
        >
          <Plus size={13} style={{ color: '#696969' }} />
          Add a step
        </button>
      </div>
    </div>
  )
}

function ArrowSVG({ color }: { color: string }) {
  return (
    <svg width="32" height={ARROW_TOTAL_H} viewBox={`0 0 32 ${ARROW_TOTAL_H}`} fill="none" style={{ display: 'block' }}>
      <line x1="16" y1="0" x2="16" y2={ARROW_TOTAL_H - 2} stroke={color} strokeWidth="2" style={{ transition: 'stroke 0.15s' }} />
      <polyline
        points={`6.28,${ARROW_TOTAL_H - 11.72} 16,${ARROW_TOTAL_H - 2} 25.72,${ARROW_TOTAL_H - 11.72}`}
        stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'stroke 0.15s' }}
      />
    </svg>
  )
}

function ArrowConnector({
  onClick,
  isDragging,
  onDrop,
  insertAfterIndex,
}: {
  onClick?: (insertAfterIndex?: number) => void
  isDragging?: boolean
  onDrop?: (e: React.DragEvent, insertAfterIndex?: number) => void
  insertAfterIndex?: number
}) {
  const [hovered, setHovered] = useState(false)
  const [dropHovered, setDropHovered] = useState(false)
  const active = hovered && onClick
  const lineColor = active || dropHovered ? ARROW_HOVER : ARROW_COLOR

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDragging) return
    e.preventDefault()
    e.stopPropagation()
    setDropHovered(true)
  }
  const handleDragLeave = () => setDropHovered(false)
  const handleDrop = (e: React.DragEvent) => {
    setDropHovered(false)
    onDrop?.(e, insertAfterIndex)
  }

  return (
    <div
      className="canvas-arrow"
      style={{ position: 'relative', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ArrowSVG color={dropHovered ? ARROW_HOVER : lineColor} />
      {active && !isDragging && (
        <button className="arrow-add-btn" onClick={e => { e.stopPropagation(); onClick(insertAfterIndex) }}>
          <Plus size={14} />
        </button>
      )}
      {isDragging && (
        <div className={`drop-zone-indicator${dropHovered ? ' active' : ''}`}
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {dropHovered && <span className="drop-zone-label">Drop here</span>}
        </div>
      )}
    </div>
  )
}

const NODE_W = 240
const NODE_GAP = 20

function MergeConnector({
  count,
  onClick,
  isDragging,
  onDrop,
}: {
  count: number
  onClick?: () => void
  isDragging?: boolean
  onDrop?: (e: React.DragEvent) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [dropHovered, setDropHovered] = useState(false)
  const active = hovered && onClick
  const lineColor = active || dropHovered ? ARROW_HOVER : ARROW_COLOR

  const totalWidth = count * NODE_W + (count - 1) * NODE_GAP
  const centers = Array.from({ length: count }, (_, i) => i * (NODE_W + NODE_GAP) + NODE_W / 2)
  const midX = totalWidth / 2

  const STUB = 20
  const ARROW_DOWN = 76
  const TOTAL_H = STUB + ARROW_DOWN
  const arrowBot = TOTAL_H - 2
  const arrowH = 9.72

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDragging) return
    e.preventDefault()
    e.stopPropagation()
    setDropHovered(true)
  }
  const handleDragLeave = () => setDropHovered(false)
  const handleDrop = (e: React.DragEvent) => {
    setDropHovered(false)
    onDrop?.(e)
  }

  return (
    <div
      style={{ position: 'relative', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <svg
        width={totalWidth}
        height={TOTAL_H}
        viewBox={`0 0 ${totalWidth} ${TOTAL_H}`}
        fill="none"
        style={{ display: 'block' }}
      >
        {centers.map((cx, i) => (
          <line key={i} x1={cx} y1={0} x2={cx} y2={STUB}
            stroke={dropHovered ? ARROW_HOVER : lineColor} strokeWidth="2" style={{ transition: 'stroke 0.15s' }} />
        ))}
        <line x1={centers[0]} y1={STUB} x2={centers[count - 1]} y2={STUB}
          stroke={dropHovered ? ARROW_HOVER : lineColor} strokeWidth="2" style={{ transition: 'stroke 0.15s' }} />
        <line x1={midX} y1={STUB} x2={midX} y2={arrowBot}
          stroke={dropHovered ? ARROW_HOVER : lineColor} strokeWidth="2" style={{ transition: 'stroke 0.15s' }} />
        <polyline
          points={`${midX - arrowH},${arrowBot - arrowH} ${midX},${arrowBot} ${midX + arrowH},${arrowBot - arrowH}`}
          stroke={dropHovered ? ARROW_HOVER : lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'stroke 0.15s' }}
        />
      </svg>
      {active && !isDragging && (
        <button
          className="arrow-add-btn"
          style={{ position: 'absolute', left: midX, top: '50%', transform: 'translate(-50%, -50%)' }}
          onClick={e => { e.stopPropagation(); onClick() }}
        >
          <Plus size={14} />
        </button>
      )}
      {isDragging && (
        <div
          className={`drop-zone-indicator${dropHovered ? ' active' : ''}`}
          style={{ top: `${STUB + (ARROW_DOWN / 2)}px`, left: midX, transform: 'translate(-50%, -50%)' }}
        >
          {dropHovered && <span className="drop-zone-label">Drop here</span>}
        </div>
      )}
    </div>
  )
}


function NodeMenu({ items }: { items: { label: string; icon: React.ReactNode; danger?: boolean; action?: () => void }[] }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node
      if (
        ref.current && !ref.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.right + 8 })
    }
    setOpen(v => !v)
  }

  return (
    <div ref={ref} onClick={e => e.stopPropagation()}>
      <button ref={btnRef} className="action-node-menu-btn" onClick={handleOpen}>
        <MoreVertical size={14} />
      </button>
      {open && pos && createPortal(
        <div
          ref={dropdownRef}
          className="action-node-dropdown"
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          {items.map(item => (
            <button
              key={item.label}
              className={`action-node-dropdown-item${item.danger ? ' danger' : ''}`}
              onClick={() => { setOpen(false); item.action?.() }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

const actionMenuItems = (onDelete: () => void) => [
  { label: 'Pause step', icon: <Pause size={14} /> },
  { label: 'Delete step', icon: <Trash2 size={14} />, danger: true, action: onDelete },
]

const triggerMenuItems = (onDelete: () => void) => [
  { label: 'Duplicate trigger', icon: <Plus size={14} /> },
  { label: 'Delete trigger', icon: <Trash2 size={14} />, danger: true, action: onDelete },
]

function ActionIcon({ actionId, color }: { actionId: string; color: string }) {
  const style = { color }
  if (actionId === 'sendEmail') return <Mail size={14} style={style} />
  if (actionId.includes('List') || actionId.includes('list')) return <List size={14} style={style} />
  if (actionId.includes('Attribute') || actionId.includes('attribute')) return <Settings size={14} style={style} />
  return <List size={14} style={style} />
}

function renderActionPreview(action: ActionNode) {
  const { actionId, config = {} } = action

  if (actionId === 'sendEmail') {
    const subject = config.subject || 'Welcome to VetinParis {{PET_NAME}}'
    const parts = subject.split(/({{[^}]+}})/)
    return (
      <div className="action-preview">
        <div className="action-preview-title" style={{ marginBottom: 6, flexWrap: 'wrap', gap: 3 }}>
          {parts.map((p: string, i: number) =>
            p.startsWith('{{') && p.endsWith('}}')
              ? <span key={i} style={{ display: 'inline-block', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 4, padding: '0 5px', fontSize: 11, fontWeight: 600, color: '#1b1b1b', lineHeight: '18px', fontFamily: 'monospace' }}>{p.slice(2, -2)}</span>
              : <span key={i}>{p}</span>
          )}
        </div>
        <div className="email-preview-thumb" style={{ height: 'auto', display: 'block', padding: 0 }}>
          <div style={{ background: '#F43F5E', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 7, fontWeight: 800, color: '#fff', letterSpacing: 0.8 }}>VETINPARIS</span>
            <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.75)' }}>Newsletter</span>
          </div>
          <div style={{ background: '#fde8ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', fontSize: 30, lineHeight: 1 }}>&#x1F415;</div>
          <div style={{ padding: '5px 8px 7px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#1b1b1b', marginBottom: 2 }}>
              Welcome, <span style={{ color: '#F43F5E' }}>Max</span>!
            </div>
            <div style={{ fontSize: 8, color: '#696969', lineHeight: '12px' }}>We're so happy you trusted us with your furry friend at our clinic...</div>
            <div style={{ marginTop: 5 }}>
              <span style={{ background: '#F43F5E', color: '#fff', fontSize: 7, fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>Book appointment</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (actionId === 'sendSms') {
    const msg = config.message || 'Hello {{contact.firstName}}, your appointment is confirmed.'
    return (
      <div className="action-preview">
        <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#1b1b1b', lineHeight: '16px' }}>
          {msg.length > 80 ? msg.slice(0, 80) + '\u2026' : msg || 'No message set'}
        </div>
      </div>
    )
  }

  if (actionId === 'sendPushNotification') {
    return (
      <div className="action-preview">
        <div style={{ background: '#f9fafb', border: '1px solid #e3e3e3', borderRadius: 8, padding: '6px 10px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#1b1b1b', marginBottom: 2 }}>{config.title || 'New message from VetinParis'}</div>
          <div style={{ fontSize: 10, color: '#696969' }}>{config.body || 'Your pet\'s appointment is confirmed.'}</div>
        </div>
      </div>
    )
  }

  if (actionId === 'sendWhatsapp') {
    return (
      <div className="action-preview">
        <div style={{ fontSize: 12, color: '#1b1b1b' }}>
          Template: <strong>{config.template || '\u2014'}</strong>
          {config.lang ? <span style={{ color: '#696969' }}> \u00b7 {config.lang}</span> : null}
        </div>
      </div>
    )
  }

  if (actionId === 'timeDelay') {
    const amount = config.amount ?? 1
    const unit = (config.unit || 'Days').toLowerCase()
    return (
      <div className="action-preview">
        <div style={{ fontSize: 12, color: '#1b1b1b' }}>
          Wait <strong>{amount} {amount === 1 ? unit.replace(/s$/, '') : unit}</strong> before next step
        </div>
      </div>
    )
  }

  if (actionId === 'waitUntilEvent') {
    return (
      <div className="action-preview">
        <div style={{ fontSize: 12, color: '#1b1b1b' }}>
          Wait until <strong>{config.event || 'event'}</strong>
        </div>
        <div style={{ fontSize: 11, color: '#696969', marginTop: 2 }}>
          Timeout: {config.timeout ?? 7} {(config.timeoutUnit || 'Days').toLowerCase()}
        </div>
      </div>
    )
  }

  if (actionId === 'conditionalSplit') {
    const conditions: Array<{field: string, operator: string, value: string}> = config.conditions || [{ field: 'Pet type', operator: 'is', value: 'Dog' }]
    const logic: string = config.logic || 'AND'
    return (
      <div className="action-preview">
        {conditions.filter((c: {field: string}) => c.field).map((c: {field: string, operator: string, value: string}, i: number) => (
          <div key={i} style={{ fontSize: 11, color: '#1b1b1b', marginBottom: i < conditions.length - 1 ? 2 : 0 }}>
            {i > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#696969', marginRight: 4 }}>{logic}</span>}
            <strong>{c.field}</strong> {c.operator} {c.value ? <em>{c.value}</em> : null}
          </div>
        ))}
      </div>
    )
  }

  if (actionId === 'percentageSplit') {
    const a = config.splitA ?? 50
    const b = 100 - a
    return (
      <div className="action-preview">
        <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ width: `${a}%`, background: '#6358DE' }} />
          <div style={{ width: `${b}%`, background: '#a78bfa' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#696969' }}>
          <span>Branch A: <strong style={{ color: '#6358DE' }}>{a}%</strong></span>
          <span>Branch B: <strong style={{ color: '#a78bfa' }}>{b}%</strong></span>
        </div>
      </div>
    )
  }

  if (actionId === 'petListUpdate' || actionId === 'contactListUpdate') {
    const lists: string[] = config.lists || []
    return (
      <div className="action-preview">
        <div style={{ fontSize: 12, color: '#1b1b1b' }}>
          <strong>{config.action || 'Add to list'}</strong>
          {lists.length > 0 && <span style={{ color: '#696969' }}>: {lists.join(', ')}</span>}
        </div>
      </div>
    )
  }

  if (actionId === 'updateContactAttribute' || actionId === 'updatePetAttribute' || actionId === 'updateCompanyAttribute') {
    return (
      <div className="action-preview">
        <div style={{ fontSize: 12, color: '#1b1b1b' }}>
          {config.attr ? <><strong>{config.attr}</strong><span style={{ color: '#696969' }}> \u2192 {config.op || 'set'}</span></> : <span style={{ color: '#696969' }}>No attribute selected</span>}
        </div>
      </div>
    )
  }

  if (actionId === 'createTask') {
    return (
      <div className="action-preview">
        <div style={{ fontSize: 12, color: '#1b1b1b' }}>
          {config.assignee ? <span>Assign to: <strong>{config.assignee}</strong></span> : null}
          {config.priority ? <span style={{ color: '#696969', marginLeft: 6 }}>\u00b7 {config.priority}</span> : null}
          {!config.assignee && !config.priority ? <span style={{ color: '#696969' }}>Follow up task</span> : null}
        </div>
      </div>
    )
  }

  if (actionId === 'assignUserToContact') {
    return (
      <div className="action-preview">
        <div style={{ fontSize: 12, color: '#1b1b1b' }}>
          {config.mode === 'Specific user' && config.user ? <span>Assign to <strong>{config.user}</strong></span>
          : config.mode ? <span><strong>{config.mode}</strong></span>
          : <span style={{ color: '#696969' }}>No assignment set</span>}
        </div>
      </div>
    )
  }

  if (actionId === 'deleteContact' || actionId === 'deletePet') {
    const label = actionId === 'deletePet' ? 'pet' : 'contact'
    return (
      <div className="action-preview">
        <div style={{ fontSize: 11, color: '#e00000' }}>Permanently delete {label}</div>
      </div>
    )
  }

  if (actionId === 'blocklistContact' || actionId === 'blocklistPet') {
    return (
      <div className="action-preview">
        <div style={{ fontSize: 12, color: '#1b1b1b' }}>
          {config.reason ? <span>Reason: <strong>{config.reason}</strong></span> : <span style={{ color: '#696969' }}>No reason set</span>}
        </div>
      </div>
    )
  }

  if (actionId === 'dealManagement') {
    return (
      <div className="action-preview">
        <div style={{ fontSize: 12, color: '#1b1b1b' }}>
          <strong>{config.dealAction || 'Deal action'}</strong>
          {config.pipeline ? <span style={{ color: '#696969' }}>: {config.pipeline}{config.stage ? ` \u2192 ${config.stage}` : ''}</span> : null}
        </div>
      </div>
    )
  }

  if (actionId === 'startAnotherAutomation') {
    return (
      <div className="action-preview">
        <div style={{ fontSize: 12, color: '#1b1b1b' }}>
          \u2192 <strong>{config.automation || 'Select automation'}</strong>
        </div>
      </div>
    )
  }

  if (actionId === 'goToAnotherStep') {
    return (
      <div className="action-preview">
        <div style={{ fontSize: 12, color: '#1b1b1b' }}>
          \u2192 <strong>{config.step || 'Select step'}</strong>
        </div>
      </div>
    )
  }

  if (actionId === 'moveToWalletCampaign' || actionId === 'sendWalletNotification' || actionId === 'moveToWalletAndNotify') {
    return (
      <div className="action-preview">
        {config.campaign ? <div style={{ fontSize: 12, color: '#1b1b1b' }}>Campaign: <strong>{config.campaign}</strong></div> : null}
        {config.notif ? <div style={{ fontSize: 11, color: '#696969', marginTop: 2 }}>Notif: {config.notif}</div> : null}
        {!config.campaign && !config.notif ? <div style={{ fontSize: 12, color: '#696969' }}>No configuration</div> : null}
      </div>
    )
  }

  // Default fallback
  return (
    <div className="action-preview">
      <div style={{ fontSize: 12, color: '#696969' }}>Configured</div>
    </div>
  )
}

export default function Canvas({
  triggers, actions, editingTriggerId, editingActionId,
  onPickTrigger, onAddTrigger, onClickTrigger, onClickDropZone, onClickAction,
  onDropTrigger, onDropAction, onDeleteTrigger, onDeleteAction
}: CanvasProps) {
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [pendingDeleteTriggerId, setPendingDeleteTriggerId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [btnPos, setBtnPos] = useState<'right' | 'left' | 'top' | 'below' | 'inside' | 'node-menu' | 'fork' | 'container'>('container')
  const lastMouse = useRef({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const hasTriggers = triggers.length > 0

  // Track drag from anywhere on page
  useEffect(() => {
    const onDragStart = () => setIsDragging(true)
    const onDragEnd = () => setIsDragging(false)
    document.addEventListener('dragstart', onDragStart)
    document.addEventListener('dragend', onDragEnd)
    return () => {
      document.removeEventListener('dragstart', onDragStart)
      document.removeEventListener('dragend', onDragEnd)
    }
  }, [])

  // Wheel zoom
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.08 : 0.08
      setZoom(z => Math.min(2, Math.max(0.3, +(z + delta).toFixed(2))))
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const isCanvasBg = (target: EventTarget | null) => {
    if (!target) return false
    const el = target as HTMLElement
    return el.classList.contains('canvas') || el.classList.contains('canvas-bg')
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isCanvasBg(e.target)) {
      setIsPanning(true)
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }
    setPan(p => ({ x: p.x + dx, y: p.y + dy }))
  }, [isPanning])

  const stopPan = useCallback(() => setIsPanning(false), [])

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    try {
      const raw = e.dataTransfer.getData('application/json')
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.type === 'trigger') onDropTrigger(data.def)
      if (data.type === 'action') onDropAction(data.def)
    } catch {}
  }

  const handleArrowDrop = (e: React.DragEvent, insertIdx?: number) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    try {
      const raw = e.dataTransfer.getData('application/json')
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.type === 'action') onDropAction(data.def, insertIdx)
    } catch {}
  }

  return (
    <div
      ref={canvasRef}
      className="canvas"
      style={{ cursor: isPanning ? 'grabbing' : 'default', userSelect: isPanning ? 'none' : undefined }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopPan}
      onMouseLeave={stopPan}
      onDragOver={e => e.preventDefault()}
      onDrop={handleCanvasDrop}
    >
      <div className="canvas-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      <div
        className="canvas-content"
        style={{
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.05s ease',
        }}
      >
        {!hasTriggers && actions.length === 0 ? (
          <div className="empty-canvas">
            <button className="pick-trigger-btn" onClick={onPickTrigger}>
              <Zap size={16} />
              Pick a trigger in the library
            </button>
            <div className="or-divider">OR</div>
            <div className="template-link" onClick={() => setShowAIPanel(true)}>
              <MagicWand size={14} />
              Start from AI
            </div>
          </div>
        ) : (
          <>
            {btnPos === 'container' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={`trigger-node ${!hasTriggers || triggers.some(t => !t.configured) ? 'warning' : ''}`} style={{ width: 280, padding: 0, overflow: 'hidden', cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 8px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: TRIGGER_ICON_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Zap size={11} style={{ color: TRIGGER_ICON_COLOR }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#696969' }}>Automation triggered when</span>
                    </div>
                    {hasTriggers && (
                      <span className={`trigger-object-badge trigger-object-badge--${triggers[0].name.toLowerCase().includes('pet') ? 'pet' : 'contact'}`} style={{ fontSize: 10 }}>
                        {triggers[0].name.toLowerCase().includes('pet') ? 'Pet' : 'Contact'}
                      </span>
                    )}
                  </div>

                  {!hasTriggers && (
                    <div
                      onClick={onPickTrigger}
                      style={{ padding: '10px 12px', fontSize: 13, color: '#9ca3af', fontStyle: 'italic', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      No trigger — click to add one
                    </div>
                  )}

                  {triggers.map((trigger, i) => (
                    <div key={trigger.id}>
                      {i > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
                          <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#c0bfbf', letterSpacing: '0.05em' }}>OR</span>
                          <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
                        </div>
                      )}
                      <div
                        onClick={() => onClickTrigger(trigger.id)}
                        style={{
                          padding: '8px 12px', cursor: 'pointer', transition: 'background 0.1s',
                          background: editingTriggerId === trigger.id ? 'rgba(99,88,222,0.05)' : 'transparent',
                          borderLeft: editingTriggerId === trigger.id ? '2px solid #6358DE' : '2px solid transparent',
                        }}
                        onMouseEnter={e => { if (editingTriggerId !== trigger.id) e.currentTarget.style.background = '#fafafa' }}
                        onMouseLeave={e => { if (editingTriggerId !== trigger.id) e.currentTarget.style.background = 'transparent' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1b1b1b', lineHeight: 1.3 }}>
                              {trigger.configured
                                ? trigger.config.membershipType
                                  ? trigger.config.membershipType === 'added' ? 'Pet added to a list' : 'Pet removed from a list'
                                  : trigger.name
                                : trigger.name}
                            </span>
                          </div>
                          <NodeMenu items={triggerMenuItems(() => {
                            if (triggers.length === 1 && actions.length > 0) setPendingDeleteTriggerId(trigger.id)
                            else onDeleteTrigger(trigger.id)
                          })} />
                        </div>
                        {trigger.configured && (
                          <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {trigger.config.selectedLists && trigger.config.selectedLists.length > 0 && (
                              <span style={{ fontSize: 11, color: '#696969' }}>
                                {trigger.config.selectedLists.join(', ')}
                              </span>
                            )}
                            {trigger.config.filterRules && trigger.config.filterRules.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {trigger.config.filterRules.map((r, i) => (
                                  <span key={r.id} style={{ fontSize: 11, color: '#696969' }}>
                                    {i > 0 && <span style={{ fontWeight: 600, color: '#9ca3af' }}>AND </span>}
                                    {r.attributeLabel} {r.operator}{r.value ? ` ${r.value}` : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {!trigger.configured && (
                          <div className="trigger-node-warning" style={{ marginTop: 6 }}>
                            <AlertTriangle size={11} />
                            Verify and save this trigger.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {hasTriggers && (
                    <div
                      onClick={onAddTrigger}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderTop: '1px solid #f0f0f0', cursor: 'pointer', color: '#9ca3af', fontSize: 12, transition: 'background 0.1s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; (e.currentTarget.style.color = '#6358DE') }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; (e.currentTarget.style.color = '#9ca3af') }}
                    >
                      <Plus size={12} />
                      Add a trigger
                    </div>
                  )}
                </div>
                <ArrowConnector onClick={onClickDropZone} isDragging={isDragging} onDrop={handleArrowDrop} insertAfterIndex={-1} />
              </div>
            ) : null}

            <div style={{ position: 'relative', display: btnPos === 'container' ? 'none' : 'flex', justifyContent: 'center' }}>
              <div className="triggers-row" style={{ gap: NODE_GAP }}>
                {!hasTriggers && (
                  <div style={{ display: 'flex' }}>
                    <div className="trigger-node ghost-trigger" onClick={onPickTrigger}>
                      <div className="trigger-node-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={11} style={{ color: '#d1d5db' }} />
                          </div>
                          <div className="trigger-node-badge" style={{ background: '#f3f4f6', color: '#9ca3af' }}>Trigger</div>
                        </div>
                      </div>
                      <span className="trigger-node-label" style={{ color: '#d1d5db' }}>Automation triggered when</span>
                      <div style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic', marginTop: 4 }}>No trigger — click to add one</div>
                    </div>
                  </div>
                )}
                {triggers.map((trigger) => (
                  <div key={trigger.id} style={{ display: 'flex' }}>
                    <div
                      className={`trigger-node ${editingTriggerId === trigger.id ? 'selected' : ''} ${!trigger.configured ? 'warning' : ''}`}
                      onClick={() => onClickTrigger(trigger.id)}
                    >
                      <div className="trigger-node-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, background: TRIGGER_ICON_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <List size={11} style={{ color: TRIGGER_ICON_COLOR }} />
                          </div>
                          <div className="trigger-node-badge">
                            {trigger.name.toLowerCase().includes('pet') ? 'Pet' : 'Contact'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {hasTriggers && btnPos === 'node-menu' && (
                            <button
                              onClick={e => { e.stopPropagation(); onAddTrigger() }}
                              title="Add a trigger"
                              style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#696969' }}
                            >
                              <Plus size={11} />
                            </button>
                          )}
                          <NodeMenu items={triggerMenuItems(() => {
                            if (triggers.length === 1 && actions.length > 0) {
                              setPendingDeleteTriggerId(trigger.id)
                            } else {
                              onDeleteTrigger(trigger.id)
                            }
                          })} />
                        </div>
                      </div>
                      <span className="trigger-node-label">Automation triggered when</span>
                      <div className="trigger-node-title">{trigger.configured ? getTriggerTitle(trigger) : trigger.name}</div>
                      {trigger.configured && trigger.config.filters && trigger.config.filters.length > 0 && (
                        <p style={{ fontSize: 12, color: '#1b1b1b', margin: '2px 0 0', lineHeight: '16px' }}>
                          {trigger.config.filters.map((f, i) => (
                            <span key={f}>
                              {i > 0 && <span style={{ color: '#696969', fontWeight: 600 }}> AND </span>}
                              {f}
                            </span>
                          ))}
                        </p>
                      )}
                      {!trigger.configured && (
                        <div className="trigger-node-warning">
                          <AlertTriangle size={12} />
                          Verify and save this trigger.
                        </div>
                      )}
                      {/* Inside node: bottom row */}
                      {hasTriggers && btnPos === 'inside' && (
                        <div
                          onClick={e => { e.stopPropagation(); onAddTrigger() }}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, paddingTop: 8, borderTop: '1px solid #f0f0f0', color: '#9ca3af', cursor: 'pointer', fontSize: 12 }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#6358DE')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                        >
                          <Plus size={11} />
                          Add a trigger
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right side button */}
              {hasTriggers && btnPos === 'right' && (
                <div style={{ position: 'absolute', left: '100%', top: 40, display: 'flex', alignItems: 'center', marginLeft: 8, whiteSpace: 'nowrap' }}>
                  <div style={{ width: 24, height: 1.5, background: '#e5e7eb' }} />
                  <button className="add-trigger-btn" onClick={onAddTrigger}>
                    <Zap size={13} style={{ color: '#696969' }} />
                    Add a trigger
                  </button>
                </div>
              )}

              {/* Left side button */}
              {hasTriggers && btnPos === 'left' && (
                <div style={{ position: 'absolute', right: '100%', top: 40, display: 'flex', alignItems: 'center', marginRight: 8, whiteSpace: 'nowrap' }}>
                  <button className="add-trigger-btn" onClick={onAddTrigger}>
                    <Zap size={13} style={{ color: '#696969' }} />
                    Add a trigger
                  </button>
                  <div style={{ width: 24, height: 1.5, background: '#e5e7eb' }} />
                </div>
              )}

              {/* Top button */}
              {hasTriggers && btnPos === 'top' && (
                <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8, whiteSpace: 'nowrap' }}>
                  <button className="add-trigger-btn" onClick={onAddTrigger}>
                    <Zap size={13} style={{ color: '#696969' }} />
                    Add a trigger
                  </button>
                </div>
              )}
            </div>

            {/* Below node button */}
            {hasTriggers && btnPos === 'below' && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 0' }}>
                <button className="add-trigger-btn" onClick={onAddTrigger}>
                  <Plus size={13} style={{ color: '#696969' }} />
                  Add a trigger
                </button>
              </div>
            )}

            {btnPos !== 'container' && (
              hasTriggers && btnPos === 'fork' && actions.length === 0 ? (
                <ForkOptions onAddTrigger={onAddTrigger} onAddStep={() => onClickDropZone(-1)} />
              ) : triggers.length > 1 ? (
                <MergeConnector count={triggers.length} onClick={() => onClickDropZone(-1)} isDragging={isDragging} onDrop={(e) => handleArrowDrop(e, -1)} />
              ) : (
                <ArrowConnector onClick={onClickDropZone} isDragging={isDragging} onDrop={handleArrowDrop} insertAfterIndex={-1} />
              )
            )}

            {actions.length > 0 ? (
              actions.map((action, index) => (
                <div key={action.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    className={`action-node ${editingActionId === action.id ? 'selected' : ''} ${!action.configured ? 'warning' : ''}`}
                    onClick={() => onClickAction(action.id)}
                  >
                    <div className="action-node-header">
                      <div className="action-node-type">
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: '#e4f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ActionIcon actionId={action.actionId} color={action.iconColor} />
                        </div>
                        {action.name.toUpperCase()}
                      </div>
                      <NodeMenu items={actionMenuItems(() => onDeleteAction(action.id))} />
                    </div>
                    <div className="action-node-body">
                      {action.configured ? renderActionPreview(action) : (
                        <div className="trigger-node-warning">
                          <AlertCircle size={12} />
                          Define and save this action
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowConnector onClick={onClickDropZone} isDragging={isDragging} onDrop={handleArrowDrop} insertAfterIndex={index} />
                </div>
              ))
            ) : null}

            <div className="exit-node">
              <div className="exit-node-icon">
                <LogOut size={16} style={{ color: '#fff' }} />
              </div>
              <span className="exit-node-label">Exit</span>
            </div>
          </>
        )}
      </div>

      {showAIPanel && (
        <AIChatPanel
          onClose={() => setShowAIPanel(false)}
          onBuild={() => { setShowAIPanel(false); onPickTrigger() }}
        />
      )}

      {pendingDeleteTriggerId && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setPendingDeleteTriggerId(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: 14, padding: '28px 28px 24px', width: 400, boxShadow: '0 12px 40px rgba(0,0,0,0.16)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1b1b1b', marginBottom: 10 }}>
              Delete last trigger?
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
              This is your only trigger. Deleting it will leave your {actions.length} action{actions.length > 1 ? 's' : ''} without a trigger — a ghost placeholder will remain so your steps are not lost.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setPendingDeleteTriggerId(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onDeleteTrigger(pendingDeleteTriggerId); setPendingDeleteTriggerId(null) }}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#ef4444', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
              >
                Delete trigger
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}


      {/* Zoom controls */}
      <div className="canvas-zoom">
        <button title="Zoom out" onClick={() => setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(2)))}>
          <ZoomOut size={14} />
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button title="Zoom in" onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(2)))}>
          <ZoomIn size={14} />
        </button>
        <button title="Reset view" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}>
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  )
}

function getTriggerTitle(trigger: TriggerNode): string {
  const { membershipType, selectedLists } = trigger.config
  const isPet = trigger.triggerId.toLowerCase().startsWith('pet')

  if (trigger.triggerId === 'petListMembership' || trigger.triggerId === 'contactListMembership') {
    const object = isPet ? 'Pet' : 'Contact'
    const action = membershipType === 'removed' ? 'removed from' : 'added to'
    if (selectedLists && selectedLists.length > 0) {
      return `${object} ${action} ${selectedLists.join(' or ')}`
    }
    return `${object} ${action} a list`
  }

  if (trigger.triggerId === 'petFiltered') return 'Pet matches filters'
  if (trigger.triggerId === 'contactFiltered') return 'Contact matches filters'

  return trigger.name
}
