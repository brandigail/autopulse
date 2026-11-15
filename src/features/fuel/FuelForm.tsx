import { useState, type FormEvent } from 'react'
import { inputClass, primaryButton, secondaryButton } from '../../components/ui'
import { isValidISO, todayISO } from '../../lib/dates'
import { toMajorString, toMinor } from '../../lib/money'
import { parseNumber } from '../../lib/parse'
import type { FuelEntry } from '../../types'
import type { FuelInput } from './fuelRepo'

interface Props {
  initial?: FuelEntry
  defaultOdometer: number
  unitLabel: string
  onSubmit: (input: FuelInput) => Promise<void>
  onCancel: () => void
}

export function FuelForm({ initial, defaultOdometer, unitLabel, onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [odometer, setOdometer] = useState(String(initial?.odometer ?? defaultOdometer))
  const [litres, setLitres] = useState(initial ? String(initial.litres) : '')
  const [cost, setCost] = useState(initial ? toMajorString(initial.cost) : '')
  const [fullTank, setFullTank] = useState(initial?.fullTank ?? true)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const odo = parseNumber(odometer)
    const l = parseNumber(litres)
    const money = parseNumber(cost)
    if (!isValidISO(date) || date > todayISO()) return setError('Enter a date that is today or earlier.')
    if (odo === null || odo < 0) return setError('Odometer must be 0 or more.')
    if (l === null || l <= 0) return setError('Litres must be more than 0.')
    if (money === null || money < 0) return setError('Enter what the fill-up cost.')
    setError(null)
    await onSubmit({ date, odometer: Math.round(odo), litres: Math.round(l * 100) / 100, cost: toMinor(money), fullTank })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">
          Date
          <input className={inputClass} type="date" max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Odometer ({unitLabel})
          <input className={inputClass} inputMode="numeric" value={odometer} onChange={(e) => setOdometer(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Litres
          <input className={inputClass} inputMode="decimal" value={litres} onChange={(e) => setLitres(e.target.value)} placeholder="0.0" />
        </label>
        <label className="block text-sm font-medium">
          Total cost (R)
          <input className={inputClass} inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-1 size-4 accent-teal-700" checked={fullTank} onChange={(e) => setFullTank(e.target.checked)} />
        <span>
          <span className="font-medium">Filled the tank</span>
          <span className="block text-slate-600 dark:text-slate-400">
            Efficiency is measured between two full tanks, so untick this for a part fill.
          </span>
        </span>
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className={primaryButton}>
          {initial ? 'Save changes' : 'Add fill-up'}
        </button>
        <button type="button" className={secondaryButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
