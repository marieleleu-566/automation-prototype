import { useState, useEffect, useRef } from 'react'
import RotateCcw from '@dtsl/icons/dist/icons/react/RotateCcw'
import RotateCw from '@dtsl/icons/dist/icons/react/RotateCw'
import ChevronDown from '@dtsl/icons/dist/icons/react/ChevronDown'
import Save from '@dtsl/icons/dist/icons/react/Save'
import X from '@dtsl/icons/dist/icons/react/X'
import PauseCircle from '@dtsl/icons/dist/icons/react/PauseCircle'
import XCircle from '@dtsl/icons/dist/icons/react/Xcircle'

interface TopBarProps {
  onExit: () => void
  isActive: boolean
  setIsActive: (v: boolean) => void
  onActivate: () => void
}

export default function TopBar({ onExit, isActive, setIsActive, onActivate }: TopBarProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const statusMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showStatusMenu) return
    function handle(e: MouseEvent) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showStatusMenu])

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">B</div>
        <div className="topbar-title">
          Welcome new pet parents
          <ChevronDown size={16} />
        </div>
        <div className="topbar-divider" />
        <button className="icon-btn" title="Undo"><RotateCcw size={16} /></button>
        <button className="icon-btn" title="Redo"><RotateCw size={16} /></button>
        <div className="topbar-saved">
          <Save size={12} />
          Saved today 4:30PM
        </div>
      </div>
      <div className="topbar-actions">
        {isActive ? (
          <div ref={statusMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="topbar-pill topbar-pill--activated">Activated</button>
            <button
              className="topbar-pill topbar-pill--primary"
              onClick={() => setShowStatusMenu(v => !v)}
            >
              Manage status
              <ChevronDown size={13} />
            </button>
            {showStatusMenu && (
              <div className="fab-status-menu" style={{ top: 'calc(100% + 6px)', bottom: 'auto', right: 0, left: 'auto' }}>
                <button className="fab-status-item" onClick={() => { setIsActive(false); setShowStatusMenu(false) }}>
                  <PauseCircle size={15} />
                  Pause automation
                </button>
                <button className="fab-status-item danger" onClick={() => { setIsActive(false); setShowStatusMenu(false) }}>
                  <XCircle size={15} />
                  Deactivate automation
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="topbar-pill topbar-pill--ghost">Inactive</button>
            <button className="topbar-pill topbar-pill--primary" onClick={onActivate}>
              Activate automation
            </button>
            <button className="topbar-pill topbar-pill--outline">Test</button>
          </div>
        )}
        <button className="icon-btn" onClick={onExit} title="Exit editor">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
