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
import type { TriggerDef, ActionDef } from './data'

const initialState: AppState = {
  panel: 'selectTrigger',
  triggers: [],
  actions: [],
  editingTriggerId: null,
  editingActionId: null,
  objectType: null,
}


export default function App() {
  const [state, setState] = useState<AppState>(initialState)
  const [isActive, setIsActive] = useState(false)
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
    const nameAndId = (def.name + ' ' + def.id).toLowerCase()
    const inferredType = nameAndId.includes('pet') ? 'pet' : 'contact'
    update({
      triggers: [...state.triggers, newTrigger],
      editingTriggerId: id,
      panel: 'configureTrigger',
      objectType: state.objectType ?? inferredType,
    })
  }

  const onSaveTrigger = (id: string, config: TriggerNode['config'], description: string) => {
    update({
      triggers: state.triggers.map(t => t.id === id ? { ...t, config, description, configured: true } : t),
      panel: 'selectAction', editingTriggerId: null,
    })
  }

  const onCancelTrigger = (_id: string) => {
    update({ panel: null, editingTriggerId: null })
  }

  const onClickTrigger = (id: string) => {
    update({ editingTriggerId: id, panel: 'configureTrigger' })
  }

  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null)

  const openSelectAction = (idx?: number) => {
    setInsertAfterIndex(idx ?? null)
    update({ panel: 'selectAction' })
  }

  const onSelectAction = (def: ActionDef) => {
    const id = `action-${Date.now()}`
    const newAction: ActionNode = {
      id, actionId: def.id, name: def.name,
      iconColor: def.iconColor, iconBg: def.iconBg,
      configured: false
    }
    const insertIdx = insertAfterIndex !== null ? insertAfterIndex + 1 : state.actions.length
    const newActions = [
      ...state.actions.slice(0, insertIdx),
      newAction,
      ...state.actions.slice(insertIdx),
    ]
    update({ actions: newActions, editingActionId: id, panel: 'configureAction' })
  }

  const onSaveAction = (id: string, config: Record<string, any>) => {
    update({
      actions: state.actions.map(a => a.id === id ? { ...a, configured: true, config } : a),
      panel: null, editingActionId: null,
    })
  }

  const onCancelAction = (_id: string) => {
    update({ panel: null, editingActionId: null })
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

  const onResetObjectType = () => update({
    objectType: null,
    actions: state.actions.map(a => ({ ...a, configured: false, config: undefined })),
  })

  const openOverview = () => update({ panel: 'overview' })
  const closePanel = () => update({ panel: null, editingTriggerId: null, editingActionId: null })
  const handleExit = () => { alert('Exiting builder…') }

  const editingTrigger = state.triggers.find(t => t.id === state.editingTriggerId) ?? null
  const editingAction = state.actions.find(a => a.id === state.editingActionId) ?? null

  return (
    <div className="app">
      <TopBar
        onExit={handleExit}
        isActive={isActive}
        setIsActive={setIsActive}
        onActivate={openOverview}
      />
      <div className="main-layout">
        <LeftSidebar />
        <div className="content-area">
          {state.panel === 'selectTrigger' && (
            <SelectTriggerPanel
              onSelect={onSelectTrigger}
              onClose={closePanel}
              existingObject={state.objectType}
              lockedWithNoTriggers={state.objectType !== null && state.triggers.length === 0}
              onResetObjectType={onResetObjectType}
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
            onClickDropZone={(idx?: number) => openSelectAction(idx)}
            onClickAction={onClickAction}
            onDropTrigger={onSelectTrigger}
            onDropAction={(def: ActionDef, idx?: number) => {
              const id = `action-${Date.now()}`
              const newAction: ActionNode = {
                id, actionId: def.id, name: def.name,
                iconColor: def.iconColor, iconBg: def.iconBg,
                configured: false
              }
              const insertIdx = idx !== undefined ? idx + 1 : state.actions.length
              const newActions = [
                ...state.actions.slice(0, insertIdx),
                newAction,
                ...state.actions.slice(insertIdx),
              ]
              update({ actions: newActions, editingActionId: id, panel: 'configureAction' })
            }}
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

    </div>
  )
}
