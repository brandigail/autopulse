import { useActiveVehicle } from '../providers/activeVehicle'

export function VehicleSwitcher() {
  const { vehicles, activeVehicle, setActiveId } = useActiveVehicle()
  if (!vehicles || vehicles.length === 0) return null

  return (
    <select
      aria-label="Active vehicle"
      value={activeVehicle?.id ?? ''}
      onChange={(e) => setActiveId(e.target.value)}
      className="min-w-0 max-w-[10rem] truncate rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
    >
      {vehicles.map((v) => (
        <option key={v.id} value={v.id}>
          {v.name}
        </option>
      ))}
    </select>
  )
}
