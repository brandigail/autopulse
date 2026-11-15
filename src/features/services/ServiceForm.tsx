import { useState, type FormEvent } from 'react'
import { inputClass, primaryButton, secondaryButton } from '../../components/ui'
import { isValidISO, todayISO } from '../../lib/dates'
import { toMajorString, toMinor } from '../../lib/money'
import { parseNumber } from '../../lib/parse'
import type { ServiceEntry } from '../../types'
import type { ServiceInput } from './serviceRepo'
import { COMMON_SERVICE_TYPES } from './serviceTypes'

interface Props {
  initial?: ServiceEntry
  /** Pre-fills the odometer for a new entry. */
  defaultOdometer: number
  unitLabel: string
  onSubmit: (input: ServiceInput) => Promise<void>
  onCancel: () => void
}

export function ServiceForm({ initial, defaultOdometer, unitLabel, onSubmit, onCancel }: Props) {
  const [type, setType] = useState(initial?.type ?? '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [odometer, setOdometer] = useState(String(initial?.odometer ?? defaultOdometer))
  const [cost, setCost] = useState(initial ? toMajorString(initial.cost) : '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const odo = parseNumber(odometer)
    const money = cost.trim() === '' ? 0 : parseNumber(cost)
    if (!type.trim()) return setError('What was done? Pick a type or write your own.')
    if (!isValidISO(date) || date > todayISO()) return setError('Enter a date that is today or earlier.')
    if (odo === null || odo < 0) return setError('Odometer must be 0 or more.')
    if (money === null || money < 0) return setError('Cost must be 0 or more.')
    setError(null)
    await onSubmit({ type: type.trim(), date, odometer: Math.round(odo), cost: toMinor(money), notes: notes.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <label className="block text-sm font-medium">
        Service type
        <input className={inputClass} list="service-types" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Engine oil and filter" />
        <datalist id="service-types">
          {COMMON_SERVICE_TYPES.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">
          Date
          <input className={inputClass} type="date" max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Odometer ({unitLabel})
          <input className={inputClass} inputMode="numeric" value={odometer} onChange={(e) => setOdometer(e.target.value)} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Cost (R)
        <input className={inputClass} inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
      </label>
      <label className="block text-sm font-medium">
        Notes
        <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className={primaryButton}>
          {initial ? 'Save changes' : 'Add service'}
        </button>
        <button type="button" className={secondaryButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
