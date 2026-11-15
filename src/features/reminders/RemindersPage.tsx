import { useLiveQuery } from 'dexie-react-hooks'
import { CheckCheck, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NoVehicle } from '../../components/NoVehicle'
import { cardClass, iconButton, mutedText, primaryButton, secondaryButton } from '../../components/ui'
import { db } from '../../db/schema'
import { formatDate, todayISO } from '../../lib/dates'
import { describeDue, evaluateAll } from '../../lib/reminders'
import { distanceLabel } from '../../lib/units'
import { useActiveVehicle } from '../../providers/activeVehicle'
import type { ReminderRule } from '../../types'
import { ReminderForm } from './ReminderForm'
import { StatusBadge } from './StatusBadge'
import { addReminder, deleteReminder, markReminderDone, updateReminder, type ReminderInput } from './reminderRepo'

type Mode = { kind: 'list' } | { kind: 'add' } | { kind: 'edit'; rule: ReminderRule }

export function RemindersPage() {
  const { activeVehicle } = useActiveVehicle()
  const [mode, setMode] = useState<Mode>({ kind: 'list' })

  const vehicleId = activeVehicle?.id
  const rules = useLiveQuery(() => (vehicleId ? db.reminders.where('vehicleId').equals(vehicleId).toArray() : []), [vehicleId])

  const due = useMemo(
    () => (activeVehicle ? evaluateAll(rules ?? [], activeVehicle.odometer, todayISO()) : []),
    [rules, activeVehicle],
  )

  if (!activeVehicle) return <NoVehicle />
  const unit = distanceLabel(activeVehicle.unit)

  async function save(input: ReminderInput) {
    if (!activeVehicle) return
    if (mode.kind === 'edit') await updateReminder(mode.rule.id, input)
    else await addReminder(activeVehicle.id, input)
    setMode({ kind: 'list' })
  }

  async function remove(rule: ReminderRule) {
    if (window.confirm(`Delete the ${rule.serviceType} reminder?`)) await deleteReminder(rule.id)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Reminders</h2>
        {mode.kind === 'list' && (
          <button type="button" className={primaryButton} onClick={() => setMode({ kind: 'add' })}>
            <Plus size={16} aria-hidden /> Add reminder
          </button>
        )}
      </div>

      {mode.kind !== 'list' && (
        <ReminderForm
          key={mode.kind === 'edit' ? mode.rule.id : 'new'}
          initial={mode.kind === 'edit' ? mode.rule : undefined}
          defaultOdometer={activeVehicle.odometer}
          unitLabel={unit}
          onSubmit={save}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {rules && rules.length === 0 && mode.kind === 'list' && (
        <p className={mutedText}>No reminders yet. Add one, such as an oil change every 10,000 {unit} or 6 months.</p>
      )}

      <ul className="space-y-2">
        {due.map((d) => (
          <li key={d.rule.id} className={`${cardClass} !p-3`}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {d.rule.serviceType} <StatusBadge status={d.status} />
                </p>
                <p className="text-sm">{describeDue(d, unit)}</p>
                <p className={`text-sm ${mutedText}`}>
                  Last done {formatDate(d.rule.lastDoneDate)} at {d.rule.lastDoneOdometer.toLocaleString('en-GB')} {unit}
                  {d.dueOdometer !== null && ` · due at ${d.dueOdometer.toLocaleString('en-GB')} ${unit}`}
                  {d.dueDate !== null && ` · due by ${formatDate(d.dueDate)}`}
                </p>
              </div>
              <button type="button" aria-label={`Edit ${d.rule.serviceType} reminder`} className={iconButton} onClick={() => setMode({ kind: 'edit', rule: d.rule })}>
                <Pencil size={18} aria-hidden />
              </button>
              <button type="button" aria-label={`Delete ${d.rule.serviceType} reminder`} className={`${iconButton} text-red-600 dark:text-red-400`} onClick={() => void remove(d.rule)}>
                <Trash2 size={18} aria-hidden />
              </button>
            </div>
            <button
              type="button"
              className={`${secondaryButton} mt-2`}
              onClick={() => void markReminderDone(d.rule.id, activeVehicle.odometer, todayISO())}
            >
              <CheckCheck size={16} aria-hidden /> Mark done now
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
