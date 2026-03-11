import { useState } from 'react'
import CheckCircle from '@dtsl/icons/dist/icons/react/CheckCircle'
import AlertTriangle from '@dtsl/icons/dist/icons/react/AlertTriangle'
import Xcircle from '@dtsl/icons/dist/icons/react/Xcircle'
import HelpCircle from '@dtsl/icons/dist/icons/react/HelpCircle'
import X from '@dtsl/icons/dist/icons/react/X'
import RotateCcw from '@dtsl/icons/dist/icons/react/RotateCcw'
import ArrowRight from '@dtsl/icons/dist/icons/react/ArrowRight'
import { NaosButton, VARIANTS, COLORS } from '@dtsl/react/dist/components/NaosButton'
import type { TriggerNode, ActionNode } from '../../types'

interface Props {
  triggers: TriggerNode[]
  actions: ActionNode[]
  onContinueBuilding: () => void
  onActivate: () => void
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 40, height: 22, borderRadius: 100, border: 'none', cursor: 'pointer',
        background: on ? '#1b1b1b' : 'var(--color-text-muted)',
        position: 'relative', flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
      }} />
    </button>
  )
}

export default function OverviewPanel({ triggers, actions, onContinueBuilding, onActivate }: Props) {
  const [allowReentry, setAllowReentry] = useState(true)
  const [setupWait, setSetupWait] = useState(false)

  const configuredTriggers = triggers.filter(t => t.configured).length
  const configuredActions = actions.filter(a => a.configured).length
  const totalSteps = triggers.length + actions.length
  const readySteps = configuredTriggers + configuredActions

  const checklist = [
    {
      key: 'trigger',
      name: 'Trigger configured',
      detail: triggers[0]?.description || 'No trigger set',
      status: configuredTriggers > 0 ? 'ok' : 'error',
    },
    {
      key: 'filters',
      name: 'Filters set',
      detail: triggers[0]?.config.selectedLists?.length
        ? 'Dog → Age < 2 yrs AND Breed ≠ Pit Bull'
        : 'No filters configured',
      status: triggers[0]?.config.selectedLists?.length ? 'ok' : 'warn',
    },
    {
      key: 'email',
      name: 'Email template',
      detail: configuredActions > 0
        ? 'Last edited externally — confirm it looks right.'
        : 'No email template set',
      status: configuredActions > 0 ? 'warn' : 'error',
      link: 'Preview template',
    },
    {
      key: 'data',
      name: '5 pets missing breed data',
      detail: "They'll be skipped unless you fill in their breed.",
      status: 'error',
      link: 'Fix missing breeds',
    },
  ]

  const visibleChecklist = checklist.filter(item => item.status !== 'ok')

  return (
    <div className="overview-overlay" onClick={onContinueBuilding}>
      <div className="overview-page" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="overview-page-header">
          <div>
            <div className="overview-page-title">Overview</div>
            <div className="overview-page-subtitle">Review before activating</div>
          </div>
          <button className="panel-close-btn" onClick={onContinueBuilding}><X size={16} /></button>
        </div>

        <div className="overview-page-body" style={{ flexDirection: 'column' }}>
          {/* Full-width: What this automation does */}
          <div className="overview-card">
            <div className="overview-card-title">What this automation does</div>
            <p className="overview-card-text">
              When a <strong>young dog</strong> (under 2 yrs, non-Pit Bull) is added as a <strong>new client</strong>,
              their owner automatically receives a <strong>welcome email</strong> from VetinParis.
            </p>
          </div>

          {/* Two-column row */}
          <div style={{ display: 'flex', gap: 20 }}>
            {/* Estimated Impact */}
            <div className="overview-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <div className="overview-card-title" style={{ margin: 0 }}>Estimated Impact</div>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>If activated now</span>
              </div>
              <div style={{ display: 'flex', flex: 1 }}>
                <div className="impact-stat" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #f0f0f0' }}>
                  <div className="impact-number">~143</div>
                  <div className="impact-label">Pets qualify</div>
                </div>
                <div className="impact-stat" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #f0f0f0' }}>
                  <div className="impact-number">~138</div>
                  <div className="impact-label">Emails sent</div>
                </div>
                <div className="impact-stat" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <div className="impact-number">~42%</div>
                  <div className="impact-label">Est. open rate</div>
                </div>
              </div>
              <div className="impact-note" style={{ marginTop: 14 }}>
                <HelpCircle size={12} />
                Estimate based on current records. Actual numbers may vary.
              </div>
            </div>

            {/* Ready to activate */}
            <div className="overview-col" style={{ flex: 1 }}>
            <div className="overview-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div className="overview-card-title" style={{ margin: 0 }}>Ready to activate?</div>
                <span className="checklist-count">{readySteps}/{totalSteps || 4} ready</span>
              </div>
              <div style={{ fontSize: 13, color: '#696969', marginBottom: 16 }}>Issues to resolve</div>
              {visibleChecklist.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: 'var(--color-success)', fontSize: 13 }}>
                  <CheckCircle size={18} />
                  Everything looks good — ready to activate!
                </div>
              ) : (
                visibleChecklist.map(item => (
                  <div key={item.key} className="checklist-item">
                    <div className="checklist-icon">
                      {item.status === 'warn' && <AlertTriangle size={20} style={{ color: 'var(--color-warning-icon)' }} />}
                      {item.status === 'error' && <Xcircle size={20} style={{ color: 'var(--color-error)' }} />}
                    </div>
                    <div className="checklist-text">
                      <div className="checklist-name">{item.name}</div>
                      <div className="checklist-detail">{item.detail}</div>
                      {item.link && <div className="checklist-link">{item.link}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>{/* end two-column row */}

          {/* Re-entry after exit — full width */}
          <div className="overview-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, background: 'var(--color-success-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <RotateCcw size={14} style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="overview-card-title" style={{ margin: 0 }}>Re-entry after exit</div>
          </div>
          <p style={{ fontSize: 13, color: '#696969', margin: '0 0 16px', lineHeight: 1.5 }}>
            If you activate this option, contacts who have exited this automation and match the triggers again will re-enter it.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Toggle on={allowReentry} onChange={() => setAllowReentry(v => !v)} />
              <span style={{ fontSize: 14, color: '#1b1b1b' }}>Allow contact re-entry after exit</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Toggle on={setupWait} onChange={() => setSetupWait(v => !v)} />
                <span style={{ fontSize: 14, color: setupWait ? '#1b1b1b' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Set up wait time
                  <HelpCircle size={15} style={{ color: 'var(--color-text-muted)' }} />
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '6px 0 0 50px', lineHeight: 1.4 }}>
                Define how long to wait before checking if contacts match the triggers
              </p>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, color: 'var(--brand-interactive)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Manage audience entry and exit
              <ArrowRight size={14} />
            </button>
          </div>{/* end button row */}
          </div>{/* end re-entry card */}
        </div>{/* end overview-page-body */}

        {/* Footer */}
        <div className="overview-page-footer">
          <NaosButton variant={VARIANTS.TERTIARY} color={COLORS.PRIMARY} size="medium" label="Continue building" onClick={onContinueBuilding} />
          <NaosButton variant={VARIANTS.PRIMARY} color={COLORS.PRIMARY} size="medium" label="Activate automation" onClick={onActivate} />
        </div>
      </div>
    </div>
  )
}
