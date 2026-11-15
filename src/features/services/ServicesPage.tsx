import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NoVehicle } from '../../components/NoVehicle'
import { cardClass, iconButton, inputClass, mutedText, primaryButton } from '../../components/ui'
import { db } from '../../db/schema'
import { formatDate } from '../../lib/dates'
import { formatMoney } from '../../lib/money'
import { distanceLabel } from '../../lib/units'
import { useActiveVehicle } from '../../providers/activeVehicle'
import type { ServiceEntry } from '../../types'
import { ServiceForm } from './ServiceForm'
import { addService, deleteService, updateService, type ServiceInput } from './serviceRepo'

type Mode = { kind: 'list' } | { kind: 'add' } | { kind: 'edit'; entry: ServiceEntry }

export function ServicesPage() {
  const { activeVehicle } = useActiveVehicle()
  const [mode, setMode] = useState<Mode>({ kind: 'list' })
  const [filter, setFilter] = useState('all')

  const vehicleId = activeVehicle?.id
  const services = useLiveQuery(
    () => (vehicleId ? db.services.where('vehicleId').equals(vehicleId).toArray() : []),
    [vehicleId],
  )

  const sorted = useMemo(
    () => [...(services ?? [])].sort((a, b) => b.date.localeCompare(a.date) || b.odometer - a.odometer),
    [services],
  )
  const types = useMemo(() => [...new Set(sorted.map((s) => s.type))].sort(), [sorted])
  const visible = filter === 'all' ? sorted : sorted.filter((s) => s.type === filter)
  const total = visible.reduce((sum, s) => sum + s.cost, 0)

  if (!activeVehicle) return <NoVehicle />
  const unit = distanceLabel(activeVehicle.unit)

  async function save(input: ServiceInput) {
    if (!activeVehicle) return
    if (mode.kind === 'edit') await updateService(mode.entry.id, input)
    else await addService(activeVehicle.id, input)
    setMode({ kind: 'list' })
  }

  async function remove(entry: ServiceEntry) {
    if (window.confirm(`Delete the ${entry.type} entry from ${formatDate(entry.date)}?`)) await deleteService(entry.id)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Services</h2>
        {mode.kind === 'list' && (
          <button type="button" className={primaryButton} onClick={() => setMode({ kind: 'add' })}>
            <Plus size={16} aria-hidden /> Log service
          </button>
        )}
      </div>

      {mode.kind !== 'list' && (
        <ServiceForm
          key={mode.kind === 'edit' ? mode.entry.id : 'new'}
          initial={mode.kind === 'edit' ? mode.entry : undefined}
          defaultOdometer={activeVehicle.odometer}
          unitLabel={unit}
          onSubmit={save}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {sorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-medium">
            <span className="sr-only">Filter by type</span>
            <select className={`${inputClass} mt-0 w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <p className={`text-sm ${mutedText}`}>
            {visible.length} {visible.length === 1 ? 'entry' : 'entries'} · {formatMoney(total)} spent
          </p>
        </div>
      )}

      {services && sorted.length === 0 && mode.kind === 'list' && (
        <p className={mutedText}>Nothing logged for {activeVehicle.name} yet. Log the first service above.</p>
      )}

      <ul className="space-y-2">
        {visible.map((s) => (
          <li key={s.id} className={`${cardClass} flex items-start gap-3 !p-3`}>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{s.type}</p>
              <p className={`text-sm ${mutedText}`}>
                {formatDate(s.date)} · {s.odometer.toLocaleString('en-GB')} {unit} · {formatMoney(s.cost)}
              </p>
              {s.notes && <p className="mt-1 text-sm">{s.notes}</p>}
            </div>
            <button type="button" aria-label={`Edit ${s.type} on ${formatDate(s.date)}`} className={iconButton} onClick={() => setMode({ kind: 'edit', entry: s })}>
              <Pencil size={18} aria-hidden />
            </button>
            <button type="button" aria-label={`Delete ${s.type} on ${formatDate(s.date)}`} className={`${iconButton} text-red-600 dark:text-red-400`} onClick={() => void remove(s)}>
              <Trash2 size={18} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
