import { useState, type FormEvent } from 'react'
import { inputClass, primaryButton, secondaryButton } from '../../components/ui'
import { isValidISO, todayISO } from '../../lib/dates'
import { parseNumber } from '../../lib/parse'
import type { ReminderRule } from '../../types'
import { COMMON_SERVICE_TYPES } from '../services/serviceTypes'
import type { ReminderInput } from './reminderRepo'

interface Props {
  initial?: ReminderRule
  defaultOdometer: number
  unitLabel: string
  onSubmit: (input: ReminderInput) => Promise<void>
  onCancel: () => void
}

export function ReminderForm({ initial, defaultOdometer, unitLabel, onSubmit, onCancel }: Props) {
  const [serviceType, setServiceType] = useState(initial?.serviceType ?? '')
  const [everyKm, setEveryKm] = useState(initial?.everyKm != null ? String(initial.everyKm) : '10000')
  const [everyMonths, setEveryMonths] = useState(initial?.everyMonths != null ? String(initial.everyMonths) : '6')
  const [lastOdometer, setLastOdometer] = useState(String(initial?.lastDoneOdometer ?? defaultOdometer))
  const [lastDate, setLastDate] = useState(initial?.lastDoneDate ?? todayISO())
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const km = parseNumber(everyKm)
    const months = parseNumber(everyMonths)
    const odo = parseNumber(lastOdometer)
    if (!serviceType.trim()) return setError('Which service is this reminder for?')
    if (km === null && months === null) return setError(`Set an interval in ${unitLabel}, in months, or both.`)
    if (km !== null && (km <= 0 || !Number.isInteger(km))) return setError(`The ${unitLabel} interval must be a whole number above 0.`)
    if (months !== null && (months <= 0 || !Number.isInteger(months))) return setError('The month interval must be a whole number above 0.')
    if (odo === null || odo < 0) return setError('Odometer at last service must be 0 or more.')
    if (!isValidISO(lastDate) || lastDate > todayISO()) return setError('Last service date must be today or earlier.')
    setError(null)
    await onSubmit({ serviceType: serviceType.trim(), everyKm: km, everyMonths: months, lastDoneOdometer: Math.round(odo), lastDoneDate: lastDate })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <label className="block text-sm font-medium">
        Service
        <input className={inputClass} list="reminder-types" value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="e.g. Engine oil and filter" />
        <datalist id="reminder-types">
          {COMMON_SERVICE_TYPES.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </label>
      <p className="text-sm text-slate-600 dark:text-slate-400">It fires on whichever comes first. Clear one box to use only the other.</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">
          Every ({unitLabel})
          <input className={inputClass} inputMode="numeric" value={everyKm} onChange={(e) => setEveryKm(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Every (months)
          <input className={inputClass} inputMode="numeric" value={everyMonths} onChange={(e) => setEveryMonths(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Last done at ({unitLabel})
          <input className={inputClass} inputMode="numeric" value={lastOdometer} onChange={(e) => setLastOdometer(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Last done on
          <input className={inputClass} type="date" max={todayISO()} value={lastDate} onChange={(e) => setLastDate(e.target.value)} />
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className={primaryButton}>
          {initial ? 'Save changes' : 'Add reminder'}
        </button>
        <button type="button" className={secondaryButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
