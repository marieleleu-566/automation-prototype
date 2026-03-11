import { useState } from 'react'
import Zap from '@dtsl/icons/dist/icons/react/Zap'
import Settings from '@dtsl/icons/dist/icons/react/Settings'
import Activity from '@dtsl/icons/dist/icons/react/Activity'

const items = [
  { id: 'builder', label: 'Builder', Icon: Zap },
  { id: 'settings', label: 'Settings', Icon: Settings },
  { id: 'activity', label: 'Activity', Icon: Activity },
]

export default function LeftSidebar() {
  const [active, setActive] = useState('builder')
  return (
    <div className="left-sidebar">
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`sidebar-item ${active === id ? 'active' : ''}`}
          onClick={() => setActive(id)}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
    </div>
  )
}
