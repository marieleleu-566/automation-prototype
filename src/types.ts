export type PanelType =
  | 'selectTrigger'
  | 'configureTrigger'
  | 'selectAction'
  | 'configureAction'
  | 'overview'
  | null

export interface TriggerNode {
  id: string
  triggerId: string
  name: string
  description: string
  configured: boolean
  config: {
    membershipType?: string
    selectedLists?: string[]
    filters?: string[]
  }
}

export interface ActionNode {
  id: string
  actionId: string
  name: string
  iconColor: string
  iconBg: string
  configured: boolean
  config?: Record<string, any>
}

export interface AppState {
  panel: PanelType
  triggers: TriggerNode[]
  actions: ActionNode[]
  editingTriggerId: string | null
  editingActionId: string | null
}
