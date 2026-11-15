import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NoVehicle } from '../../components/NoVehicle'
import { cardClass, iconButton, mutedText, primaryButton } from '../../components/ui'
import { db } from '../../db/schema'
import { formatDate } from '../../lib/dates'
import { computeEfficiency } from '../../lib/efficiency'
import { formatMoney } from '../../lib/money'
import { distanceLabel, formatEfficiency, type EfficiencyUnit } from '../../lib/units'
import { useActiveVehicle } from '../../providers/activeVehicle'
import { usePreferences } from '../../providers/preferences'
import type { FuelEntry } from '../../types'
import { FuelChart } from './FuelChart'
import { FuelForm } from './FuelForm'
import { addFuel, deleteFuel, updateFuel, type FuelInput } from './fuelRepo'

type Mode = { kind: 'list' } | { kind: 'add' } | { kind: 'edit'; entry: FuelEntry }

const UNITS: { value: EfficiencyUnit; label: string }[] = [
  { value: 'L_PER_100KM', label: 'L/100km' },
  { value: 'MPG', label: 'mpg' },
]

export function FuelPage() {
  const { activeVehicle } = useActiveVehicle()
  const { efficiencyUnit, setEfficiencyUnit } = usePreferences()
  const [mode, setMode] = useState<Mode>({ kind: 'list' })

  const vehicleId = activeVehicle?.id
  const entries = useLiveQuery(() => (vehicleId ? db.fuel.where('vehicleId').equals(vehicleId).toArray() : []), [vehicleId])

  const report = useMemo(
    () => computeEfficiency(entries ?? [], activeVehicle?.unit ?? 'KM'),
    [entries, activeVehicle?.unit],
  )
  const sorted = useMemo(() => [...(entries ?? [])].sort((a, b) => b.odometer - a.odometer), [entries])
  const segmentByEnd = useMemo(() => new Map(report.segments.map((s) => [s.endOdometer, s])), [report])

  if (!activeVehicle) return <NoVehicle />
  const unit = distanceLabel(activeVehicle.unit)

  async function save(input: FuelInput) {
    if (!activeVehicle) return
    if (mode.kind === 'edit') await updateFuel(mode.entry.id, input)
    else await addFuel(activeVehicle.id, input)
    setMode({ kind: 'list' })
  }

  async function remove(entry: FuelEntry) {
    if (window.confirm(`Delete the fill-up from ${formatDate(entry.date)}?`)) await deleteFuel(entry.id)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Fuel</h2>
        {mode.kind === 'list' && (
          <button type="button" className={primaryButton} onClick={() => setMode({ kind: 'add' })}>
            <Plus size={16} aria-hidden /> Add fill-up
          </button>
        )}
      </div>

      {mode.kind !== 'list' && (
        <FuelForm
          key={mode.kind === 'edit' ? mode.entry.id : 'new'}
          initial={mode.kind === 'edit' ? mode.entry : undefined}
          defaultOdometer={activeVehicle.odometer}
          unitLabel={unit}
          onSubmit={save}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className={cardClass}>
          <p className={`text-sm ${mutedText}`}>Average</p>
          <p className="text-xl font-semibold">{formatEfficiency(report.averageLPer100km, efficiencyUnit)}</p>
        </div>
        <div className={cardClass}>
          <p className={`text-sm ${mutedText}`}>Fuel cost per {unit}</p>
          <p className="text-xl font-semibold">{report.costPerDistance === null ? 'n/a' : formatMoney(report.costPerDistance)}</p>
        </div>
      </div>

      <div className={`${cardClass} space-y-3`}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold">Efficiency trend</h3>
          <div role="group" aria-label="Efficiency unit" className="flex overflow-hidden rounded-lg border border-slate-300 text-sm dark:border-slate-700">
            {UNITS.map((u) => (
              <button
                key={u.value}
                type="button"
                aria-pressed={efficiencyUnit === u.value}
                onClick={() => setEfficiencyUnit(u.value)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  efficiencyUnit === u.value
                    ? 'bg-teal-700 text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
        <FuelChart segments={report.segments} unit={efficiencyUnit} />
      </div>

      {entries && sorted.length === 0 && mode.kind === 'list' && (
        <p className={mutedText}>No fill-ups yet. Add one to start measuring efficiency.</p>
      )}

      <ul className="space-y-2">
        {sorted.map((f) => {
          const segment = segmentByEnd.get(f.odometer)
          return (
            <li key={f.id} className={`${cardClass} flex items-start gap-3 !p-3`}>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {f.litres.toFixed(1)} L · {formatMoney(f.cost)}
                  {!f.fullTank && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">Part fill</span>}
                </p>
                <p className={`text-sm ${mutedText}`}>
                  {formatDate(f.date)} · {f.odometer.toLocaleString('en-GB')} {unit}
                  {segment && ` · ${formatEfficiency(segment.lPer100km, efficiencyUnit)}`}
                </p>
              </div>
              <button type="button" aria-label={`Edit fill-up on ${formatDate(f.date)}`} className={iconButton} onClick={() => setMode({ kind: 'edit', entry: f })}>
                <Pencil size={18} aria-hidden />
              </button>
              <button type="button" aria-label={`Delete fill-up on ${formatDate(f.date)}`} className={`${iconButton} text-red-600 dark:text-red-400`} onClick={() => void remove(f)}>
                <Trash2 size={18} aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
