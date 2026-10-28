import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useActiveVehicle } from '../../providers/activeVehicle'
import type { Vehicle } from '../../types'
import { VehicleForm } from './VehicleForm'
import { addVehicle, deleteVehicle, updateVehicle, type VehicleInput } from './vehicleRepo'

type Mode = { kind: 'list' } | { kind: 'add' } | { kind: 'edit'; vehicle: Vehicle }

export function VehiclesPage() {
  const { vehicles, activeVehicle, setActiveId } = useActiveVehicle()
  const [mode, setMode] = useState<Mode>({ kind: 'list' })

  async function handleAdd(input: VehicleInput) {
    setActiveId(await addVehicle(input))
    setMode({ kind: 'list' })
  }

  async function handleEdit(vehicle: Vehicle, input: VehicleInput) {
    await updateVehicle(vehicle.id, input)
    setMode({ kind: 'list' })
  }

  async function handleDelete(vehicle: Vehicle) {
    if (!window.confirm(`Delete ${vehicle.name} and all its services, fuel logs and reminders?`)) return
    await deleteVehicle(vehicle.id)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Vehicles</h2>
        {mode.kind === 'list' && (
          <button
            type="button"
            onClick={() => setMode({ kind: 'add' })}
            className="flex items-center gap-1 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            <Plus size={16} aria-hidden /> Add vehicle
          </button>
        )}
      </div>

      {mode.kind === 'add' && <VehicleForm onSubmit={handleAdd} onCancel={() => setMode({ kind: 'list' })} />}
      {mode.kind === 'edit' && (
        <VehicleForm
          initial={mode.vehicle}
          onSubmit={(input) => handleEdit(mode.vehicle, input)}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {vehicles?.length === 0 && mode.kind === 'list' && (
        <p className="text-slate-600 dark:text-slate-400">No vehicles yet. Add one to start logging.</p>
      )}

      <ul className="space-y-2">
        {vehicles?.map((v) => (
          <li
            key={v.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <button type="button" onClick={() => setActiveId(v.id)} className="min-w-0 flex-1 text-left">
              <p className="truncate font-medium">
                {v.name}
                {v.id === activeVehicle?.id && (
                  <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    Active
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                {v.year} {v.make} {v.model} · {v.odometer.toLocaleString()} {v.unit.toLowerCase()}
              </p>
            </button>
            <button
              type="button"
              aria-label={`Edit ${v.name}`}
              onClick={() => setMode({ kind: 'edit', vehicle: v })}
              className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Pencil size={18} aria-hidden />
            </button>
            <button
              type="button"
              aria-label={`Delete ${v.name}`}
              onClick={() => handleDelete(v)}
              className="flex size-10 items-center justify-center rounded-full text-red-600 hover:bg-slate-100 dark:text-red-400 dark:hover:bg-slate-800"
            >
              <Trash2 size={18} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
