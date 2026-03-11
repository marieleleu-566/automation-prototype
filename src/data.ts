export type TriggerIconType =
  | 'list' | 'circle' | 'filter' | 'form' | 'calendar'
  | 'message' | 'phone' | 'mail' | 'shopping' | 'gift'
  | 'check' | 'chart' | 'credit' | 'star' | 'globe' | 'zap'

export interface TriggerDef {
  id: string
  name: string
  description: string
  iconType: TriggerIconType
  iconColor: string
  iconBg: string
  category: string
  recentlyUsed: boolean
}

const PINK = { iconColor: '#F43F5E', iconBg: '#FFF1F2' }

export const TRIGGER_CATEGORIES: { name: string; triggers: TriggerDef[] }[] = [
  {
    name: 'Objects & CRM',
    triggers: [
      { id: 'contactListMembership', name: 'Contact list membership changed', description: 'Contact added or removed from a list', iconType: 'list', ...PINK, category: 'Objects & CRM', recentlyUsed: false },
      { id: 'petListMembership', name: 'Pet list membership changed', description: 'Pet added or removed from a list', iconType: 'list', ...PINK, category: 'Objects & CRM', recentlyUsed: false },
      { id: 'formSubmitted', name: 'Form submitted', description: 'Contact submits a form', iconType: 'form', ...PINK, category: 'Objects & CRM', recentlyUsed: false },
      { id: 'contactAddedManually', name: 'Contact added manually', description: 'Contact added manually to database', iconType: 'circle', ...PINK, category: 'Objects & CRM', recentlyUsed: false },
      { id: 'petAddedManually', name: 'Pet added manually', description: 'Pet added manually to database', iconType: 'circle', ...PINK, category: 'Objects & CRM', recentlyUsed: true },
      { id: 'contactFiltered', name: 'Contact is filtered or segmented', description: 'Contact matches filters or segments set by you', iconType: 'filter', ...PINK, category: 'Objects & CRM', recentlyUsed: false },
      { id: 'petFiltered', name: 'Pet matches custom filters', description: 'Pet matches filters or segments set by you', iconType: 'filter', ...PINK, category: 'Objects & CRM', recentlyUsed: true },
      { id: 'anniversary', name: 'Anniversary', description: 'Data based on object attribute selected', iconType: 'calendar', ...PINK, category: 'Objects & CRM', recentlyUsed: false },
    ],
  },
  {
    name: 'Sales activities',
    triggers: [
      { id: 'convStarted', name: 'Conversation started', description: 'Contact starts a conversation', iconType: 'message', ...PINK, category: 'Sales activities', recentlyUsed: false },
      { id: 'convEnded', name: 'Conversation ended', description: 'Contact ended a conversation', iconType: 'message', ...PINK, category: 'Sales activities', recentlyUsed: false },
      { id: 'msgReceived', name: 'Message received', description: 'Contact receives a message', iconType: 'message', ...PINK, category: 'Sales activities', recentlyUsed: false },
      { id: 'meetingBooked', name: 'Meeting booked', description: 'Contact books a meeting', iconType: 'calendar', ...PINK, category: 'Sales activities', recentlyUsed: false },
      { id: 'meetingStarted', name: 'Meeting started', description: 'Meeting between you and contact started', iconType: 'calendar', ...PINK, category: 'Sales activities', recentlyUsed: false },
      { id: 'meetingCancelled', name: 'Meeting cancelled', description: 'Contact cancels a meeting', iconType: 'calendar', ...PINK, category: 'Sales activities', recentlyUsed: false },
      { id: 'taskCreated', name: 'Task created', description: 'Task created by contact', iconType: 'check', ...PINK, category: 'Sales activities', recentlyUsed: false },
      { id: 'taskCompleted', name: 'Task completed', description: 'Task completed by contact', iconType: 'check', ...PINK, category: 'Sales activities', recentlyUsed: false },
      { id: 'dealCreated', name: 'Deal created', description: 'Deal created between you and contact', iconType: 'chart', ...PINK, category: 'Sales activities', recentlyUsed: false },
      { id: 'dealStageUpdated', name: 'Deal stage updated', description: 'Deal stage updated', iconType: 'chart', ...PINK, category: 'Sales activities', recentlyUsed: false },
    ],
  },
  {
    name: 'Commerce & Product',
    triggers: [
      { id: 'productAlerts', name: 'Product alerts', description: 'Cart updated / price drop alert / back in stock', iconType: 'shopping', ...PINK, category: 'Commerce & Product', recentlyUsed: false },
      { id: 'voucherCreated', name: 'Voucher created', description: 'Voucher created for contact', iconType: 'gift', ...PINK, category: 'Commerce & Product', recentlyUsed: false },
      { id: 'voucherRedeemed', name: 'Voucher redeemed', description: 'Contact redeems a voucher', iconType: 'gift', ...PINK, category: 'Commerce & Product', recentlyUsed: false },
      { id: 'voucherRevoked', name: 'Voucher revoked', description: 'Contact voucher is revoked', iconType: 'gift', ...PINK, category: 'Commerce & Product', recentlyUsed: false },
      { id: 'voucherExpired', name: 'Voucher expired', description: 'Contact voucher has expired', iconType: 'gift', ...PINK, category: 'Commerce & Product', recentlyUsed: false },
      { id: 'uniqueCouponSent', name: 'Unique coupon sent', description: 'Coupon sent to contacts', iconType: 'gift', ...PINK, category: 'Commerce & Product', recentlyUsed: false },
    ],
  },
  {
    name: 'Marketing & Engagement',
    triggers: [
      { id: 'callFinished', name: 'Call finished', description: 'Phone call is finished', iconType: 'phone', ...PINK, category: 'Marketing & Engagement', recentlyUsed: false },
      { id: 'emailEngagement', name: 'Email engagement metrics', description: 'Contact open / click / bounced / unsubscribed', iconType: 'mail', ...PINK, category: 'Marketing & Engagement', recentlyUsed: false },
      { id: 'pushInteractions', name: 'Push notification user interactions', description: 'Received, clicked, subscribed / unsubscribed', iconType: 'zap', ...PINK, category: 'Marketing & Engagement', recentlyUsed: false },
    ],
  },
  {
    name: 'Loyalty & Rewards',
    triggers: [
      { id: 'subscriptionActivity', name: 'Subscription activity', description: 'Subscription created or revoked', iconType: 'star', ...PINK, category: 'Loyalty & Rewards', recentlyUsed: false },
      { id: 'balanceUpdates', name: 'Balance thresholds & updates', description: 'Balance value updated / expired & max/min', iconType: 'credit', ...PINK, category: 'Loyalty & Rewards', recentlyUsed: false },
      { id: 'loyaltyReminders', name: 'Loyalty data reminders', description: 'Tier / voucher / membership / anniversaries', iconType: 'star', ...PINK, category: 'Loyalty & Rewards', recentlyUsed: false },
      { id: 'tierUpdated', name: 'Tier association updated', description: 'Changes in loyalty status', iconType: 'star', ...PINK, category: 'Loyalty & Rewards', recentlyUsed: false },
      { id: 'passActivity', name: 'Pass activity', description: 'Pass downloaded / installed / print / used', iconType: 'credit', ...PINK, category: 'Loyalty & Rewards', recentlyUsed: false },
    ],
  },
  {
    name: 'Custom event',
    triggers: [
      { id: 'customEvent', name: 'Custom event', description: 'Event selector triggers the automation', iconType: 'globe', ...PINK, category: 'Custom event', recentlyUsed: false },
    ],
  },
]

export const AVAILABLE_TRIGGERS: TriggerDef[] = TRIGGER_CATEGORIES.flatMap(c => c.triggers)

export const AVAILABLE_LISTS = [
  { id: 'new-client-2026', name: 'New client 2026' },
  { id: 'puppy', name: 'Puppy' },
  { id: 'kitten', name: 'Kitten' },
  { id: 'fish', name: 'Fish' },
]

export const MEMBERSHIP_TYPES = [
  { id: 'added', label: 'Added to a list' },
  { id: 'removed', label: 'Removed from a list' },
]

export interface ActionDef {
  id: string
  name: string
  iconColor: string
  iconBg: string
  isRule?: boolean
}

const BLUE = { iconColor: '#0B7AD1', iconBg: '#e4f2ff' }
const BLUE2 = { iconColor: '#0B7AD1', iconBg: '#d7ecff' }

export const AVAILABLE_ACTIONS = {
  rules: [
    { id: 'conditionalSplit', name: 'Conditional split', iconColor: '#8B5CF6', iconBg: '#ede9fe', isRule: true },
    { id: 'percentageSplit', name: 'Percentage split', iconColor: '#8B5CF6', iconBg: '#ede9fe', isRule: true },
    { id: 'waitUntilEvent', name: 'Wait until event', iconColor: '#8B5CF6', iconBg: '#ede9fe', isRule: true },
    { id: 'timeDelay', name: 'Time delay', iconColor: '#8B5CF6', iconBg: '#ede9fe', isRule: true },
  ] as ActionDef[],
  categories: [
    {
      name: 'Objects & CRM',
      actions: [
        { id: 'petListUpdate', name: 'Pet List update', ...BLUE },
        { id: 'contactListUpdate', name: 'Contact List update', ...BLUE },
        { id: 'updateContactAttribute', name: 'Update contact attribute', ...BLUE },
        { id: 'updatePetAttribute', name: 'Update Pet attribute', ...BLUE },
        { id: 'deletePet', name: 'Delete Pet', ...BLUE },
        { id: 'deleteContact', name: 'Delete contact', ...BLUE },
        { id: 'blocklistContact', name: 'Blocklist contact', ...BLUE },
        { id: 'blocklistPet', name: 'Blocklist Pet', ...BLUE },
        { id: 'assignPetToContact', name: 'Assign a Pet to a contact', ...BLUE },
        { id: 'assignUserToContact', name: 'Assign a user to a contact', ...BLUE },
        { id: 'updateCompanyAttribute', name: 'Update company attribute', ...BLUE },
      ] as ActionDef[]
    },
    {
      name: 'Marketing & Engagement',
      actions: [
        { id: 'sendEmail', name: 'Send an email', ...BLUE },
        { id: 'sendSms', name: 'Send an SMS', ...BLUE },
        { id: 'sendPushNotification', name: 'Send a push notification', ...BLUE },
        { id: 'sendWhatsapp', name: 'Send a WhatsApp message', ...BLUE },
      ] as ActionDef[]
    },
    {
      name: 'Sales activity',
      actions: [
        { id: 'createTask', name: 'Create a task', ...BLUE },
        { id: 'dealManagement', name: 'Deal management', ...BLUE },
      ] as ActionDef[]
    },
    {
      name: 'Loyalty & Rewards',
      actions: [
        { id: 'moveToWalletCampaign', name: 'Move to a wallet campaign', ...BLUE2 },
        { id: 'sendWalletNotification', name: 'Send a wallet notification', ...BLUE2 },
        { id: 'moveToWalletAndNotify', name: 'Move to a wallet campaign and notify', ...BLUE2 },
      ] as ActionDef[]
    },
    {
      name: 'Workflow',
      actions: [
        { id: 'startAnotherAutomation', name: 'Start another automation', ...BLUE },
        { id: 'goToAnotherStep', name: 'Go to another step', ...BLUE },
      ] as ActionDef[]
    },
  ]
}
