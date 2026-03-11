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
  onClickDropZone: () => void
  onClickAction: (id: string) => void
  onDropTrigger: (def: TriggerDef) => void
  onDropAction: (def: ActionDef) => void
  onDeleteTrigger: (id: string) => void
  onDeleteAction: (id: string) => void
}

const ARROW_TOTAL_H = 96

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
}: {
  onClick?: () => void
  isDragging?: boolean
  onDrop?: (e: React.DragEvent) => void
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
    onDrop?.(e)
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
        <button className="arrow-add-btn" onClick={e => { e.stopPropagation(); onClick() }}>
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

  const handleArrowDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    try {
      const raw = e.dataTransfer.getData('application/json')
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.type === 'action') onDropAction(data.def)
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
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div className="triggers-row" style={{ gap: NODE_GAP }}>
                {!hasTriggers && (
                  <div style={{ display: 'flex' }}>
                    <div className="trigger-node ghost-trigger" onClick={onPickTrigger}>
                      <div className="trigger-node-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                            background: '#f3f4f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <Zap size={11} style={{ color: '#d1d5db' }} />
                          </div>
                          <div className="trigger-node-badge" style={{ background: '#f3f4f6', color: '#9ca3af' }}>Trigger</div>
                        </div>
                      </div>
                      <span className="trigger-node-label" style={{ color: '#d1d5db' }}>Automation triggered when</span>
                      <div style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic', marginTop: 4 }}>
                        No trigger — click to add one
                      </div>
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
                          <div style={{
                            width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                            background: TRIGGER_ICON_BG,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <List size={11} style={{ color: TRIGGER_ICON_COLOR }} />
                          </div>
                          <div className="trigger-node-badge">
                            {trigger.name.toLowerCase().includes('pet') ? 'Pet' : 'Contact'}
                          </div>
                        </div>
                        <NodeMenu items={triggerMenuItems(() => {
                          if (triggers.length === 1 && actions.length > 0) {
                            setPendingDeleteTriggerId(trigger.id)
                          } else {
                            onDeleteTrigger(trigger.id)
                          }
                        })} />
                      </div>
                      <span className="trigger-node-label">Automation triggered when</span>
                      <div className="trigger-node-title">
                        {trigger.configured ? getTriggerTitle(trigger) : trigger.name}
                      </div>
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
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ position: 'absolute', left: '100%', top: 40, display: 'flex', alignItems: 'center', marginLeft: 8, whiteSpace: 'nowrap' }}>
                <div style={{ width: 24, height: 1.5, background: '#e5e7eb' }} />
                <button className="add-trigger-btn" onClick={onAddTrigger}>
                  <Zap size={13} style={{ color: '#696969' }} />
                  Add a trigger
                </button>
              </div>
            </div>

            {triggers.length > 1 ? (
              <MergeConnector count={triggers.length} onClick={onClickDropZone} isDragging={isDragging} onDrop={handleArrowDrop} />
            ) : (
              <ArrowConnector onClick={onClickDropZone} isDragging={isDragging} onDrop={handleArrowDrop} />
            )}

            {actions.length > 0 ? (
              actions.map((action) => (
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
                      {action.configured ? (
                        <div className="action-preview">
                          <div className="action-preview-title">
                            Welcome to VetinParis{' '}
                            <span className="action-preview-chip">PET_NAME</span>
                          </div>
                          <div className="action-preview-desc">We're so happy you trusted us to treat M...</div>
                          <div className="email-preview-thumb" style={{ height: 'auto', display: 'block', padding: 0 }}>
                            <div style={{ background: '#F43F5E', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 7, fontWeight: 800, color: '#fff', letterSpacing: 0.8 }}>VETINPARIS</span>
                              <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.75)' }}>Newsletter</span>
                            </div>
                            <div style={{ background: '#fde8ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', fontSize: 30, lineHeight: 1 }}>🐕</div>
                            <div style={{ padding: '5px 8px 7px' }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#1b1b1b', marginBottom: 2 }}>
                                Welcome, <span style={{ color: '#F43F5E' }}>Max</span>!
                              </div>
                              <div style={{ fontSize: 8, color: '#696969', lineHeight: '12px' }}>
                                We're so happy you trusted us with your furry friend at our clinic...
                              </div>
                              <div style={{ marginTop: 5 }}>
                                <span style={{ background: '#F43F5E', color: '#fff', fontSize: 7, fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>Book appointment</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="trigger-node-warning">
                          <AlertCircle size={12} />
                          Define and save this action
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowConnector onClick={onClickDropZone} isDragging={isDragging} onDrop={handleArrowDrop} />
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
  const { selectedLists } = trigger.config
  if (selectedLists && selectedLists.length > 0) {
    return `Pet added to list ${selectedLists.join(' & ')}`
  }
  if (trigger.triggerId === 'contactFiltered') return 'Pet matches custom filters'
  return trigger.name
}
