import RotateCcw from '@dtsl/icons/dist/icons/react/RotateCcw'
import RotateCw from '@dtsl/icons/dist/icons/react/RotateCw'
import ChevronDown from '@dtsl/icons/dist/icons/react/ChevronDown'
import Save from '@dtsl/icons/dist/icons/react/Save'
import X from '@dtsl/icons/dist/icons/react/X'

interface TopBarProps {
  onExit: () => void
  isActive: boolean
}

export default function TopBar({ onExit, isActive }: TopBarProps) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">B</div>
        <div className="topbar-title">
          Welcome new pet parents
          <ChevronDown size={16} />
          <div className={`topbar-status ${isActive ? 'active' : ''}`}>{isActive ? 'Active' : 'Inactive'}</div>
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
        <button className="icon-btn topbar-exit-btn" onClick={onExit} title="Exit editor">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
