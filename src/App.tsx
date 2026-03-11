import { useState } from 'react'
import type { AppState, TriggerNode, ActionNode } from './types'
import TopBar from './components/TopBar'
import LeftSidebar from './components/LeftSidebar'
import Canvas from './components/Canvas'
import SelectTriggerPanel from './components/panels/SelectTriggerPanel'
import ConfigureTriggerPanel from './components/panels/ConfigureTriggerPanel'
import SelectActionPanel from './components/panels/SelectActionPanel'
import ConfigureActionPanel from './components/panels/ConfigureActionPanel'
import OverviewPanel from './components/panels/OverviewPanel'
import Power from '@dtsl/icons/dist/icons/react/Power'
import Play from '@dtsl/icons/dist/icons/react/Play'
import ChevronDown from '@dtsl/icons/dist/icons/react/ChevronDown'
import PauseCircle from '@dtsl/icons/dist/icons/react/PauseCircle'
import XCircle from '@dtsl/icons/dist/icons/react/Xcircle'
import { useRef, useEffect } from 'react'
import type { TriggerDef, ActionDef } from './data'

const initialState: AppState = {
  panel: 'selectTrigger',
  triggers: [],
  actions: [],
  editingTriggerId: null,
  editingActionId: null,
}

function getExistingObject(triggers: AppState['triggers']): 'pet' | 'contact' | null {
  if (triggers.length === 0) return null
  const first = triggers[0]
  const text = (first.name + ' ' + first.triggerId).toLowerCase()
  if (text.includes('pet')) return 'pet'
  if (text.includes('contact')) return 'contact'
  return null
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState)
  const [fabTab, setFabTab] = useState<'activate' | 'test'>('activate')
  const [isActive, setIsActive] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const statusMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showStatusMenu) return
    function handleClick(e: MouseEvent) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showStatusMenu])
  const update = (partial: Partial<AppState>) => setState(s => ({ ...s, ...partial }))

  const openSelectTrigger = () => {
    update({ panel: 'selectTrigger' })
  }

  const onSelectTrigger = (def: TriggerDef) => {
    const id = `trigger-${Date.now()}`
    const newTrigger: TriggerNode = {
      id, triggerId: def.id, name: def.name, description: '',
      configured: false, config: {}
    }
    update({ triggers: [...state.triggers, newTrigger], editingTriggerId: id, panel: 'configureTrigger' })
  }

  const onSaveTrigger = (id: string, config: TriggerNode['config'], description: string) => {
    update({
      triggers: state.triggers.map(t => t.id === id ? { ...t, config, description, configured: true } : t),
      panel: 'selectAction', editingTriggerId: null,
    })
  }

  const onCancelTrigger = (id: string) => {
    const trigger = state.triggers.find(t => t.id === id)
    if (trigger && !trigger.configured) {
      update({ triggers: state.triggers.filter(t => t.id !== id), panel: null, editingTriggerId: null })
    } else {
      update({ panel: null, editingTriggerId: null })
    }
  }

  const onClickTrigger = (id: string) => {
    update({ editingTriggerId: id, panel: 'configureTrigger' })
  }

  const openSelectAction = () => update({ panel: 'selectAction' })

  const onSelectAction = (def: ActionDef) => {
    const id = `action-${Date.now()}`
    const newAction: ActionNode = {
      id, actionId: def.id, name: def.name,
      iconColor: def.iconColor, iconBg: def.iconBg,
      configured: false
    }
    update({ actions: [...state.actions, newAction], editingActionId: id, panel: 'configureAction' })
  }

  const onSaveAction = (id: string) => {
    update({
      actions: state.actions.map(a => a.id === id ? { ...a, configured: true } : a),
      panel: null, editingActionId: null,
    })
  }

  const onCancelAction = (id: string) => {
    const action = state.actions.find(a => a.id === id)
    if (action && !action.configured) {
      update({ actions: state.actions.filter(a => a.id !== id), panel: null, editingActionId: null })
    } else {
      update({ panel: null, editingActionId: null })
    }
  }

  const onClickAction = (id: string) => update({ editingActionId: id, panel: 'configureAction' })

  const onDeleteTrigger = (id: string) => update({
    triggers: state.triggers.filter(t => t.id !== id),
    editingTriggerId: state.editingTriggerId === id ? null : state.editingTriggerId,
    panel: state.editingTriggerId === id ? null : state.panel,
  })

  const onDeleteAction = (id: string) => update({
    actions: state.actions.filter(a => a.id !== id),
    editingActionId: state.editingActionId === id ? null : state.editingActionId,
    panel: state.editingActionId === id ? null : state.panel,
  })

  const openOverview = () => update({ panel: 'overview' })
  const closePanel = () => update({ panel: null, editingTriggerId: null, editingActionId: null })
  const handleExit = () => { alert('Exiting builder…') }

  const editingTrigger = state.triggers.find(t => t.id === state.editingTriggerId) ?? null
  const editingAction = state.actions.find(a => a.id === state.editingActionId) ?? null

  return (
    <div className="app">
      <TopBar onExit={handleExit} isActive={isActive} />
      <div className="main-layout">
        <LeftSidebar />
        <div className="content-area">
          {state.panel === 'selectTrigger' && (
            <SelectTriggerPanel
              onSelect={onSelectTrigger}
              onClose={closePanel}
              existingObject={getExistingObject(state.triggers)}
            />
          )}
          {state.panel === 'configureTrigger' && editingTrigger && (
            <ConfigureTriggerPanel trigger={editingTrigger} onSave={onSaveTrigger} onCancel={onCancelTrigger} />
          )}
          {state.panel === 'selectAction' && (
            <SelectActionPanel onSelect={onSelectAction} onClose={closePanel} />
          )}
          {state.panel === 'configureAction' && editingAction && (
            <ConfigureActionPanel action={editingAction} onSave={onSaveAction} onCancel={onCancelAction} />
          )}
          <Canvas
            triggers={state.triggers}
            actions={state.actions}
            editingTriggerId={state.editingTriggerId}
            editingActionId={state.editingActionId}
            onPickTrigger={openSelectTrigger}
            onAddTrigger={openSelectTrigger}
            onClickTrigger={onClickTrigger}
            onClickDropZone={openSelectAction}
            onClickAction={onClickAction}
            onDropTrigger={onSelectTrigger}
            onDropAction={onSelectAction}
            onDeleteTrigger={onDeleteTrigger}
            onDeleteAction={onDeleteAction}
          />
        </div>
      </div>

      {/* Overview modal — rendered at app root so it overlays everything */}
      {state.panel === 'overview' && (
        <OverviewPanel
          triggers={state.triggers}
          actions={state.actions}
          onContinueBuilding={closePanel}
          onActivate={() => { setIsActive(true); closePanel() }}
        />
      )}

      {/* Floating action bar */}
      <div className="floating-action-bar">
        <button
          className={`fab-btn ${fabTab === 'test' ? 'fab-primary' : 'fab-ghost'}`}
          onClick={() => setFabTab('test')}
        >
          <Power size={15} />
          Test
        </button>
        {isActive ? (
          <div ref={statusMenuRef} style={{ position: 'relative' }}>
            <button
              className="fab-btn fab-manage"
              onClick={() => setShowStatusMenu(v => !v)}
            >
              <Play size={15} />
              Manage status
              <ChevronDown size={13} />
            </button>
            {showStatusMenu && (
              <div className="fab-status-menu">
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
          <button
            className={`fab-btn ${fabTab === 'activate' ? 'fab-primary' : 'fab-ghost'}`}
            onClick={() => { setFabTab('activate'); openOverview() }}
          >
            <Play size={15} />
            Activate
          </button>
        )}
      </div>
    </div>
  )
}
