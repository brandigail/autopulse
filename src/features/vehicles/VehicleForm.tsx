import { useState, type FormEvent } from 'react'
import type { DistanceUnit, Vehicle } from '../../types'
import type { VehicleInput } from './vehicleRepo'

interface Props {
  initial?: Vehicle
  onSubmit: (input: VehicleInput) => Promise<void>
  onCancel: () => void
}

const CURRENT_YEAR = new Date().getFullYear()

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900'

export function VehicleForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [make, setMake] = useState(initial?.make ?? '')
  const [model, setModel] = useState(initial?.model ?? '')
  const [year, setYear] = useState(String(initial?.year ?? CURRENT_YEAR))
  const [odometer, setOdometer] = useState(String(initial?.odometer ?? 0))
  const [unit, setUnit] = useState<DistanceUnit>(initial?.unit ?? 'KM')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const yearNum = Number(year)
    const odoNum = Number(odometer)
    if (!name.trim()) return setError('Give the vehicle a name.')
    if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > CURRENT_YEAR + 1) {
      return setError('Enter a valid year.')
    }
    if (!Number.isFinite(odoNum) || odoNum < 0) return setError('Odometer must be 0 or more.')
    setError(null)
    await onSubmit({
      name: name.trim(),
      make: make.trim(),
      model: model.trim(),
      year: yearNum,
      odometer: Math.round(odoNum),
      unit,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <label className="block text-sm font-medium">
        Name
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hilux" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">
          Make
          <input className={inputClass} value={make} onChange={(e) => setMake(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Model
          <input className={inputClass} value={model} onChange={(e) => setModel(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Year
          <input className={inputClass} inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Unit
          <select className={inputClass} value={unit} onChange={(e) => setUnit(e.target.value as DistanceUnit)}>
            <option value="KM">Kilometres</option>
            <option value="MI">Miles</option>
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium">
        Current odometer
        <input className={inputClass} inputMode="numeric" value={odometer} onChange={(e) => setOdometer(e.target.value)} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          {initial ? 'Save changes' : 'Add vehicle'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
